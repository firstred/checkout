MyParcel = {
    /*
     * Init
     *
     * Initialize the MyParcel checkout.
     *
     */
    data: {},
    result: {},
    currentLocation: {},

    DELIVERY_MORNING: 'morning',
    DELIVERY_NORMAL: 'standard',
    DELIVERY_NIGHT: 'avond',
    DELIVERY_SIGNED: 0,
    DELIVERY_ONLY_RECIPIENT: 0,

    init: function (externalData) {
        this.data = externalData;

        isMobile = true;
        if ($(window).width() > 980) {
            isMobile = false;
        }

        /* Titles of the options*/
        if (MyParcel.data.config.deliveryTitle) {
            $('#mypa-delivery-title').html(MyParcel.data.config.deliveryTitle);
        }
        if (MyParcel.data.config.onlyRecipientTitle) {
            $('#mypa-only-recipient-title').html(MyParcel.data.config.onlyRecipientTitle);
        }
        if (MyParcel.data.config.signatureTitle) {
            $('#mypa-signature-title').html(MyParcel.data.config.signatureTitle);
        }
        if (MyParcel.data.config.pickupTitle) {
            $('#mypa-pickup-title').html(MyParcel.data.config.pickupTitle);
        }

        /* Prices */
        $('#mypa-morning-delivery').html(MyParcel.getPriceHtml(this.data.config.priceMorningDelivery));
        $('#mypa-evening-delivery').html(MyParcel.getPriceHtml(this.data.config.priceEveningDelivery));
        $('#mypa-normal-delivery').html(MyParcel.getPriceHtml(this.data.config.priceStandardDelivery));
        $('#mypa-signature-price').html(MyParcel.getPriceHtml(this.data.config.priceSignature));
        $('#mypa-only-recipient-price').html(MyParcel.getPriceHtml(this.data.config.priceOnlyRecipient));
        $('#mypa-pickup-price').html(MyParcel.getPriceHtml(this.data.config.pricePickup));

        /* Call delivery options */
        MyParcel.callDeliveryOptions();

        /* Engage defaults */
        MyParcel.hideDelivery();
        $('#method-myparcel-normal').click();

        MyParcel.bind();
    },

    getPriceHtml: function (priceOfDeliveryOption) {

        if (!priceOfDeliveryOption) {
            var price = "";
        }

        if (parseFloat(priceOfDeliveryOption) >= 0) {
            var price = '&euro; ' + priceOfDeliveryOption;
        }

        if (priceOfDeliveryOption && isNaN(parseFloat(priceOfDeliveryOption))) {
            var price = priceOfDeliveryOption;
        }

        return price;
    },

    setCurrentDeliveryOptions: function () {
        if (typeof MyParcel.storeDeliveryOptions === 'undefined') {
            console.error('setCurrentDeliveryOptions() MyParcel.storeDeliveryOptions === undefined');
            return;
        }

        var selectedDate = $('#mypa-select-date').val();
        var selectDateKey = MyParcel.storeDeliveryOptions.data.delivery[selectedDate]['time'];

        MyParcel.hideMorningDelivery();
        MyParcel.hideEveningDelivery();

        $.each(selectDateKey, function (key, value) {

            if (value['price_comment'] == 'morning' && MyParcel.data.config.allowMorningDelivery) {
                var morningTitle = MyParcel.data.config.deliveryMorningTitle;
                MyParcel.getDeliveryTime(morningTitle, 'morning', MyParcel.data.config.deliveryMorningTitle, value['start'], value['end']);
                MyParcel.showMorningDelivery();
            }
            if (value['price_comment'] == 'standard') {
                var standardTitle = MyParcel.data.config.deliveryStandardTitle;
                MyParcel.getDeliveryTime(standardTitle, 'standard', MyParcel.data.config.deliveryStandardTitle, value['start'], value['end']);

            }
            if (value['price_comment'] == 'avond' && MyParcel.data.config.allowEveningDelivery) {
                var eveningTitle = MyParcel.data.config.deliveryEveningTitle;
                MyParcel.getDeliveryTime(eveningTitle, 'evening', MyParcel.data.config.deliveryEveningTitle, value['start'], value['end']);
                MyParcel.showEveningDelivery();
            }

        });
    },
    getDeliveryTime: function (configDeliveryTitle, deliveryMoment, deliveryTitle, startTime, endTime) {
        startTime = startTime.replace(/(.*)\D\d+/, '$1');
        endTime = endTime.replace(/(.*)\D\d+/, '$1');

        $('#mypa-' + deliveryMoment + '-title').html(deliveryTitle);

        if (!configDeliveryTitle) {
            $('#mypa-' + deliveryMoment + '-title').html(startTime + ' - ' + endTime);
        }

    },

    setCurrentLocation: function () {
        var locationId = $('#mypa-pickup-location').val();
        this.currentLocation = this.getPickupByLocationId(MyParcel.storeDeliveryOptions.data.pickup, locationId);

    },
    /*
     * Bind
     *
     * Bind actions to selectors.
     *
     */

    bind: function () {
        $('#mypa-submit').on('click', function (e) {
            e.preventDefault();
            MyParcel.exportDeliveryOptionToWebshop();
        });

        /* show default delivery options and hide PostNL options */
        $('#mypa-select-delivery').on('click', function () {
            MyParcel.setCurrentDeliveryOptions();
            MyParcel.showDelivery();
            MyParcel.hidePickUpLocations();
        });

        /* hide default delivery options and show PostNL options */
        $('#mypa-pickup-delivery').on('click', function () {
            MyParcel.hideDelivery();
            MyParcel.showPickUpLocations();
        });

        $('#method-myparcel-delivery-morning, #method-myparcel-delivery-evening').on('click', function () {
            MyParcel.defaultCheckCheckbox('mypa-only-recipient');
        });

        /* Mobile specific triggers */
        if (isMobile) {
            $('#mypa-show-location-details').on('click', function () {
                MyParcel.setCurrentLocation();
                MyParcel.showLocationDetails();
                MyParcel.hideDelivery();
            });
        }

        /* Desktop specific triggers */
        else {
            $('#mypa-show-location-details').on('mouseenter', function () {
                MyParcel.setCurrentLocation();
                MyParcel.showLocationDetails();
            });
        }

        $('#mypa-location-details').on('click', function () {
            MyParcel.hideLocationDetails();
        });

        $('#method-myparcel-normal').on('click', function () {
            MyParcel.defaultCheckCheckbox('method-myparcel-normal');
        });

        $('#mypa-pickup-express').hide();
        /* todo: move */


        $('#mypa-pickup-delivery, #mypa-pickup-location').on('change', function (e) {
            MyParcel.setCurrentLocation();
            MyParcel.toggleDeliveryOptions();
            MyParcel.mapExternalWebshopTriggers();
        });

        $('#mypa-select-date').on('change', function (e) {
            MyParcel.setCurrentDeliveryOptions();
            MyParcel.mapExternalWebshopTriggers();
        });

        /* External webshop triggers */
        $('#mypa-load').on('click', function () {

            MyParcel.mapExternalWebshopTriggers()
        });
    },

    mapExternalWebshopTriggers: function () {
        MyParcel.DELIVERY_SIGNED = 0;
        MyParcel.DELIVERY_ONLY_RECIPIENT = 0;
        MyParcel.removeStyleFromPrice();

        /**
         * Morning delivery
         *
         */
        if ($('#method-myparcel-delivery-morning').prop('checked')) {
            $('#s_method_myparcel_morning').click();
            MyParcel.DELIVERY_ONLY_RECIPIENT = 1;
            MyParcel.addStyleToPrice('#mypa-morning-delivery, #mypa-only-recipient-price');

            /**
             * Signature
             */
            if ($('#mypa-signature-selector').prop('checked')) {
                $('#s_method_myparcel_morning_signature').click();
                MyParcel.DELIVERY_SIGNED = 1;
                MyParcel.addStyleToPrice('#mypa-signature-price');
            }

            MyParcel.addDeliveryToExternalInput(MyParcel.DELIVERY_MORNING);
            return;
        }

        /**
         * Normal delivery
         *
         */
        if ($('#mypa-pickup-delivery').prop('checked') === false && $('#method-myparcel-normal').prop('checked')) {
            /**
             * Signature and only recipient
             */
            if ($('#mypa-signature-selector').prop('checked') && $('#mypa-only-recipient-selector').prop('checked')) {
                $('#s_method_myparcel_delivery_signature_and_only_recipient_fee').click();
                MyParcel.DELIVERY_SIGNED = 1;
                MyParcel.DELIVERY_ONLY_RECIPIENT = 1;
                MyParcel.addStyleToPrice('#mypa-signature-price, #mypa-only-recipient-price');
            } else

            /**
             * Signature
             */
            if ($('#mypa-signature-selector').prop('checked')) {
                $('#s_method_myparcel_delivery_signature').click();
                MyParcel.DELIVERY_SIGNED = 1;
                MyParcel.addStyleToPrice('#mypa-signature-price');
            } else

            /**
             * Only recipient
             */
            if ($('#mypa-only-recipient-selector').prop('checked')) {
                $('#s_method_myparcel_delivery_only_recipient').click();
                MyParcel.DELIVERY_ONLY_RECIPIENT = 1;
                MyParcel.addStyleToPrice('#mypa-only-recipient-price');
            } else {
                $('#s_method_myparcel_flatrate, #s_method_myparcel_tablerate').click();
            }

            MyParcel.addDeliveryToExternalInput(MyParcel.DELIVERY_NORMAL);
            return;
        }

        /**
         * Evening delivery
         *
         */
        if ($('#method-myparcel-delivery-evening').prop('checked')) {
            $('#s_method_myparcel_evening').click();
            MyParcel.DELIVERY_ONLY_RECIPIENT = 1;
            MyParcel.addStyleToPrice('#mypa-evening-delivery, #mypa-only-recipient-price');

            /**
             * Signature
             */
            if ($('#mypa-signature-selector').prop('checked')) {
                $('#s_method_myparcel_evening_signature').click();
                MyParcel.DELIVERY_SIGNED = 1;
                MyParcel.addStyleToPrice('#mypa-signature-price');
            }

            MyParcel.addDeliveryToExternalInput(MyParcel.DELIVERY_NIGHT);
            return;
        }

        /**
         * Pickup
         *
         */
        if ($('#mypa-pickup-delivery').prop('checked') || $('#mypa-pickup-selector').prop('checked')) {
            /**
             * Early morning pickup
             */
            if ($('#mypa-pickup-express-selector').prop('checked')) {
                $('#s_method_myparcel_pickup_express').click();
                MyParcel.addPickupToExternalInput('retailexpress');
                MyParcel.addStyleToPrice('#mypa-pickup-express-price');
                return;
            } else {
                MyParcel.addStyleToPrice('#mypa-pickup-price');
            }


            $('#s_method_myparcel_pickup').click();
            MyParcel.addPickupToExternalInput('retail');
        }
    },

    addPickupToExternalInput: function (selectedPriceComment) {
        var locationId = $('#mypa-pickup-location').val();
        var currentLocation = MyParcel.getPickupByLocationId(MyParcel.storeDeliveryOptions.data.pickup, locationId);

        var result = jQuery.extend({}, currentLocation);

        /* If retail; convert retailexpress to retail */
        if (selectedPriceComment === "retail") {
            MyParcel.result.price_comment = "retail";
        }

        $('#mypa-input').val(JSON.stringify(result));
    },

    addStyleToPrice: function (chosenDelivery) {
        $(chosenDelivery).addClass('mypa-bold-price');
    },

    removeStyleFromPrice: function () {
        $('.mypa-delivery-option-table').find("span").removeClass('mypa-bold-price');
    },

    addDeliveryToExternalInput: function (deliveryMomentOfDay) {

        var deliveryDateId = $('#mypa-select-date').val();

        var currentDeliveryData = MyParcel.triggerDefaultOptionDelivery(deliveryDateId, deliveryMomentOfDay);

        if (currentDeliveryData !== null) {

            currentDeliveryData.signed = 1;
            $('#mypa-input').val(JSON.stringify(currentDeliveryData));
        }
    },


    triggerDefaultOptionDelivery: function (deliveryDateId, deliveryMomentOfDay) {

        var dateArray = MyParcel.result.deliveryOptions.data.delivery[deliveryDateId];
        var currentDeliveryData = null;

        $.each(dateArray['time'], function (key, value) {
            if (value.price_comment === deliveryMomentOfDay) {
                currentDeliveryData = jQuery.extend({}, dateArray);
                currentDeliveryData['time'] = [value];
            }
        });

        if (currentDeliveryData === null) {
            $('#mypa-only-recipient-selector').prop('disabled', false).prop('checked', false);
            $('#method-myparcel-normal').prop('checked', true);
            MyParcel.mapExternalWebshopTriggers();
        }

        return currentDeliveryData;
    },

    /*
     * defaultCheckCheckbox
     *
     * Check the additional options that are required for certain delivery options
     *
     */
    defaultCheckCheckbox: function (selectedOption) {
        if (selectedOption === 'mypa-only-recipient') {
            $('#mypa-only-recipient-selector').prop('checked', true).prop({disabled: true});
            $('#mypa-only-recipient-price').html('Inclusief');
        } else {
            $('#mypa-only-recipient-selector').prop('checked', false).removeAttr("disabled");
            $('#mypa-only-recipient-price').html(MyParcel.getPriceHtml(this.data.config.priceOnlyRecipient));
        }
    },

    /*
     * toggleDeliveryOptions
     *
     * Shows and hides the display options that are valid for the recipient only and signature required pre-selectors
     *
     */

    toggleDeliveryOptions: function () {
        var isPickup = $('#mypa-pickup-delivery').is(':checked');
        $('#mypa-pickup-selector').prop('checked', true);

        if (isPickup && this.currentLocation.price_comment === "retailexpress") {
            $('#mypa-pickup-express-price').html(MyParcel.getPriceHtml(this.data.config.pricePickupExpress));
            $('#mypa-pickup-express').show();

        } else {
            $('#mypa-pickup-express-selector').attr("checked", false);
            $('#mypa-pickup-express').hide();

        }
    },


    /*
     * exportDeliverOptionToWebshop
     *
     * Exports the selected deliveryoption to the webshop.
     *
     */

    exportDeliveryOptionToWebshop: function () {
        var deliveryOption = "";
        var selected = $("#mypa-delivery-option-form").find("input[type='radio']:checked");
        if (selected.length > 0) {
            deliveryOption = selected.val();
        }

        /* XXX Send to appropriate webshop field */
    },


    /*
     * hideMessage
     *
     * Hides pop-up message.
     *
     */

    hideMessage: function () {
        $('.mypa-message-model').hide().html(' ');
        $('#mypa-delivery-option-form').show();
    },

    /*
     * hideMessage
     *
     * Hides pop-up essage.
     *
     */

    showMessage: function (message) {
        $('.mypa-message-model').html(message).show();
        $('#mypa-delivery-option-form').hide();

    },

    /*
     * hideDelivery
     *
     * Hides interface part for delivery.
     *
     */

    hideDelivery: function () {
        $('#mypa-delivery-date-select, #mypa-pre-selectors-nl, #mypa-delivery, #mypa-normal-delivery').hide();
        MyParcel.hideSignature();
        MyParcel.hideOnlyRecipient();
        MyParcel.hideMorningDelivery();
        MyParcel.hideEveningDelivery();

    },

    /*
     * showDelivery
     *
     * Shows interface part for delivery.
     *
     */

    showDelivery: function () {
        $('#mypa-pre-selectors-' + this.data.address.cc.toLowerCase()).show();
        $('#mypa-delivery-selectors-' + this.data.address.cc.toLowerCase()).show();
        $('#mypa-delivery, #mypa-normal-delivery, #mypa-delivery-date-select').show();

        MyParcel.hideSignature();
        if (this.data.config.allowSignature) {
            MyParcel.showSignature();
        }

        MyParcel.hideOnlyRecipient();
        if (this.data.config.allowOnlyRecipient) {
            MyParcel.showOnlyRecipient();
        }
    },

    /*
     * showSpinner
     *
     * Shows the MyParcel spinner.
     *
     */

    showSpinner: function () {
        $('#mypa-delivery-option-form').hide();
        $('.mypa-message-model').hide();
        $('#mypa-spinner-model').show();
    },


    /*
     * hideSpinner
     *
     * Hides the MyParcel spinner.
     *
     */

    hideSpinner: function () {
        $('#mypa-spinner-model').hide();
    },

    showMorningDelivery: function () {
        $('#method-myparcel-delivery-morning-div').show();
    },

    hideMorningDelivery: function () {
        $('#method-myparcel-delivery-morning-div').hide();
    },

    showEveningDelivery: function () {
        $('#method-myparcel-delivery-evening-div').show();
    },

    hideEveningDelivery: function () {
        $('#method-myparcel-delivery-evening-div').hide();
    },

    showSignature: function () {
        $('.mypa-extra-delivery-option-signature, #mypa-signature-price').show();
    },

    hideSignature: function () {
        $('.mypa-extra-delivery-option-signature, #mypa-signature-price').hide();
    },

    showOnlyRecipient: function () {
        $('#mypa-only-recipient, #mypa-only-recipient-price').show();
    },

    hideOnlyRecipient: function () {
        $('#mypa-only-recipient, #mypa-only-recipient-price').hide();
    },

    /*
     * dateToString
     *
     * Convert api date string format to human readable string format
     *
     */

    dateToString: function (apiDate) {
        var deliveryDate = apiDate;
        var dateArr = deliveryDate.split('-');
        var dateObj = new Date(dateArr[0], dateArr[1] - 1, dateArr[2]);
        var day = ("0" + (dateObj.getDate())).slice(-2);
        var month = ("0" + (dateObj.getMonth() + 1)).slice(-2);

        return this.data.txtWeekDays[dateObj.getDay()] + " " + day + "-" + month + "-" + dateObj.getFullYear();
    },

    /*
     * showDeliveryDates
     *
     * Show possible delivery dates.
     *
     */

    showDeliveryDates: function () {
        var html = "";
        var deliveryWindow = parseInt(MyParcel.data.config.deliverydaysWindow);

        $.each(MyParcel.result.deliveryOptions.data.delivery, function (key, value) {
            html += '<option value="' + key + '">' + MyParcel.dateToString(value.date) + ' </option>\n';
        });

        /* Hide the day selector when the value of the deliverydaysWindow is 0*/
        if (deliveryWindow === 0) {
            $('#mypa-select-date').hide();
        }

        /* When deliverydaysWindow is 1, hide the day selector and show a div to show the date */
        if (deliveryWindow === 1) {
            $('#mypa-select-date').hide();
            $('#mypa-delivery-date-text').show();
        }

        /* When deliverydaysWindow > 1, show the day selector */
        if (deliveryWindow > 1) {
            $('#mypa-select-date').show();
            $('#mypa-delivery-date-text').hide();
        }

        $('#mypa-select-date, #mypa-date').html(html);
    },

    hideDeliveryDates: function () {
        $('#mypa-delivery-date-text').parent().hide();
    },

    /*
     * clearPickupLocations
     *
     * Clear pickup locations and show a non-value option.
     *
     */

    clearPickUpLocations: function () {
        var html = '<option value="">---</option>';
        $('#mypa-pickup-location').html(html);
    },


    /*
     * hidePickupLocations
     *
     * Hide the pickup location option.
     *
     */

    hidePickUpLocations: function () {
        if (!MyParcel.data.config.allowPickupPoints) {
            $('#mypa-pickup-location-selector').hide();
        }

        $('#mypa-pickup-options, #mypa-pickup, #mypa-pickup-express, #mypa-pickup-google-maps').hide();

    },


    /*
     * showPickupLocations
     *
     * Shows possible pickup locations, from closest to furdest.
     *
     */

    showPickUpLocations: function () {
        if (MyParcel.data.config.allowPickupPoints) {

            var html = "";
            $.each(MyParcel.result.deliveryOptions.data.pickup, function (key, value) {
                var distance = parseFloat(Math.round(value.distance) / 1000).toFixed(1);
                html += '<option value="' + value.location_code + '">' + value.location + ', ' + value.street + ' ' + value.number + ", " + value.city + " (" + distance + " km) </option>\n";
            });
            $('#mypa-pickup-location').html(html).prop("checked", true);
            $('#mypa-pickup-location-selector, #mypa-pickup-options, #mypa-pickup').show();
        }

        if (MyParcel.data.config.allowGoogleMaps) {
            MyParcel.showPostnlPickupOnGoogleMaps();
        }
    },

    /*
     * hideLocationDetails
     *
     * Hide the detailed information pop-up for selected location.
     *
     */

    hideLocationDetails: function () {
        $('#mypa-delivery-option-form').show();
        $('#mypa-location-details').hide();
    },

    /*
     * showLocationDetails
     *
     * Shows the detailed information pop-up for the selected pick-up location.
     */

    showLocationDetails: function () {
        var html = "";
        var locationId = $('#mypa-pickup-location').val();

        var currentLocation = MyParcel.getPickupByLocationId(MyParcel.storeDeliveryOptions.data.pickup, locationId);
        var startTime = currentLocation.start_time;

        /* Strip seconds if present */
        if (startTime.length > 5) {
            startTime = startTime.slice(0, -3);
        }

        html += '<svg  class="svg-inline--fa mypa-fa-times fa-w-12" aria-hidden="true" data-prefix="fas" data-icon="times" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" data-fa-i2svg=""><path fill="currentColor" d="M323.1 441l53.9-53.9c9.4-9.4 9.4-24.5 0-33.9L279.8 256l97.2-97.2c9.4-9.4 9.4-24.5 0-33.9L323.1 71c-9.4-9.4-24.5-9.4-33.9 0L192 168.2 94.8 71c-9.4-9.4-24.5-9.4-33.9 0L7 124.9c-9.4 9.4-9.4 24.5 0 33.9l97.2 97.2L7 353.2c-9.4 9.4-9.4 24.5 0 33.9L60.9 441c9.4 9.4 24.5 9.4 33.9 0l97.2-97.2 97.2 97.2c9.3 9.3 24.5 9.3 33.9 0z"></path></svg>'
        html += '<span class="mypa-pickup-location-details-location"><h3>' + currentLocation.location + '</h3></span>'
        html += '<svg class="mypa-postnl-logo" aria-hidden="true" data-prefix="PostNL" data-icon="PostNL" role="img" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve"><image xlink:href="data:image/png;base64,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"/></svg>';
        html += '<span class="mypa-pickup-location-details-street">' + currentLocation.street + '&nbsp;' + this.currentLocation.number + '</span>';
        html += '<span class="mypa-pickup-location-details-city">' + currentLocation.postal_code + '&nbsp;' + currentLocation.city + '</span>';

        if (currentLocation.phone_number) {
            html += '<span class="mypa-pickup-location-details-phone">' + currentLocation.phone_number + '</span>'
        }
        html += '<span class="mypa-pickup-location-details-time">Ophalen vanaf:&nbsp;' + startTime + '</span>'
        html += '<h3>Openingstijden</h3>';

        $.each(
            currentLocation.opening_hours, function (weekday, value) {
                html += '<span class="mypa-pickup-location-details-day">' + MyParcel.data.translateENtoNL[weekday] + "</span> ";

                if (value[0] === undefined) {
                    html += '<span class="mypa-time">Gesloten</span>';
                }

                $.each(value, function (key2, times) {
                    html += '<span class="mypa-time">' + times + "</span>";
                });
                html += "<br>";
            });

        $('#mypa-delivery-option-form').hide();
        $('#mypa-location-details').html(html).show();
    },

    showPostnlPickupOnGoogleMaps: function () {

        $.getScript("https://maps.googleapis.com/maps/api/js?key=AIzaSyAyBuzlPSNhmRIEhIl-3ZUidj3fwXfsDSw&amp;sensor=false", function () {
            $('#mypa-pickup-google-maps').show();

            var bounds = new google.maps.LatLngBounds();
            var infowindow = new google.maps.InfoWindow();
            var marker, i;

            var locations = [
                $.each(MyParcel.result.deliveryOptions.data.pickup, function (key, value) {
                    [value.location, value.latitude, value.longitude, key]
                }),
            ];

            var map = new google.maps.Map(document.getElementById('mypa-map'), {
                mapTypeId: google.maps.MapTypeId.ROADMAP
            });

            for (i = 0; i < locations[0].length; i++) {
                marker = new google.maps.Marker({
                    position: new google.maps.LatLng(locations[0][i]['latitude'], locations[0][i]['longitude']),
                    map: map
                });
                bounds.extend(marker.position);

                google.maps.event.addListener(marker, 'click', (function (marker, i) {
                    return function () {
                        infowindow.setContent(locations[0][i]['location']);
                        infowindow.open(map, marker);
                        map.setZoom(18);
                        map.setCenter(marker.getPosition());
                    }
                })(marker, i));
            }
            map.fitBounds(bounds);

            /* zoom in the middel to 12 */
            var listener = google.maps.event.addListener(map, "idle", function () {
                map.setZoom(12);
                google.maps.event.removeListener(listener);
            });
        });
    },

    /*
     * getPickupByLocationId
     *
     * Find the location by id and return the object.
     *
     */
    getPickupByLocationId: function (obj, locationId) {
        var object;

        $.each(obj, function (key, info) {
            if (info.location_code === locationId) {
                object = info;
                return false;
            };
        });

        return object;
    },

    /*
     * retryPostalcodeHouseNumber
     *
     * After detecting an unrecognised postcal code / house number combination the user can try again.
     * This function copies the newly entered data back into the webshop forms.
     *
    */
    retryPostalcodeHouseNumber: function () {
        this.data.address.postalCode = $('#mypa-error-postcode').val();
        this.data.address.number = $('#mypa-error-number').val();

        $('#postalCode').val(this.data.address.postalCode);
        $('#number').val(this.data.address.number);

        MyParcel.callDeliveryOptions();
        $('#mypa-select-delivery').click();
    },

    /*
     * showFallBackDelivery
     *
     * If the API call fails and we have no data about delivery or pick up options
     * show the customer an "As soon as possible" option.
     */

    showFallBackDelivery: function () {
        MyParcel.hideSpinner();
        MyParcel.hideDelivery();
        $('#mypa-select-date, #method-myparcel-normal').hide();
        $('.mypa-is-pickup-element').hide();
        $('#mypa-select-delivery-title').html('Zo snel mogelijk bezorgen');
    },


    /*
     * showRetru
     *
     * If a customer enters an unrecognised postal code housenumber combination show a
     * pop-up so they can try again.
     */

    showRetry: function () {
        MyParcel.showMessage(
            '<h3>Huisnummer/postcode combinatie onbekend</h3>' +
            '<div class="mypa-full-width mypa-error">' +
            '<label for="mypa-error-postcode">Postcode</label>' +
            '<input type="text" name="mypa-error-postcode" id="mypa-error-postcode" value="' + MyParcel.data.address.postalCode + '">' +
            '</div><div class="mypa-full-width mypa-error">' +
            '<label for="mypa-error-number">Huisnummer</label>' +
            '<input type="text" name="mypa-error-number" id="mypa-error-number" value="' + MyParcel.data.address.number + '">' +
            '<br><button id="mypa-error-try-again">Opnieuw</button>' +
            '</div>'
        );

        $('.mypa-message-model').off('click');

        /* bind trigger to new button */
        $('#mypa-error-try-again').on('click', function () {
            MyParcel.retryPostalcodeHouseNumber();
        });
    },


    /*
     * callDeliveryOptions
     *
     * Calls the MyParcel API to retrieve the pickup and delivery options for given house number and
     * Postal Code.
     *
     */

    callDeliveryOptions: function () {
        MyParcel.showSpinner();
        MyParcel.clearPickUpLocations();

        var cc = this.data.address.cc;
        var postalCode = this.data.address.postalCode;
        var number = this.data.address.number;
        var city = this.data.address.city;
        var mondayDeliveryActive = 0;

        if (postalCode == '' || number == '') {
            MyParcel.showMessage(
                '<h3>Adresgegevens zijn niet ingevuld</h3>'
            );
        }
        if (cc === "BE") {
            var numberExtra = this.data.address.numberExtra;
            var street = this.data.address.street;
        }

        if (numberExtra) {
            number = number + numberExtra;
        }

        /* Don't call API unless both Postcode and House Number are set */
        if (!number || !postalCode) {
            MyParcel.showFallBackDelivery();
            return;
        }

        /* Check if the deliverydaysWindow == 0 and hide the select input*/
        this.deliveryDaysWindow = this.data.config.deliverydaysWindow;

        if (this.deliveryDaysWindow === "0") {
            this.deliveryDaysWindow = 1;
        }

        if (this.data.config.allowMondayDelivery === true) {
            mondayDeliveryActive = 1;
        }

        var url = this.data.config.apiBaseUrl + "delivery_options";
        var params = {
            cc: this.data.address.cc,
            postal_code: postalCode,
            number: number,
            city: city,
            carrier: this.data.config.carrier,
            dropoff_days: this.data.config.dropOffDays,
            monday_delivery: mondayDeliveryActive,
            deliverydays_window: this.deliveryDaysWindow,
            cutoff_time: this.data.config.cutoffTime,
            dropoff_delay: this.data.config.dropoffDelay
        };

        $.get(url, params)
            .done(MyParcel.responseSuccess)
            .fail(MyParcel.responseError)
            .always(MyParcel.responseComplete);
    },

    responseSuccess: function (response) {
        MyParcel.result.deliveryOptions = response;
        if (response.errors) {
            $.each(response.errors, function (key, value) {
                /* Postalcode housenumber combination not found or not recognised. */
                if (value.code != '') {
                    MyParcel.showRetry();
                }

                /* Any other error */
                else {
                    MyParcel.showFallBackDelivery();
                }
            });
        }

        /* No errors */
        else {
            MyParcel.hideMessage();
            MyParcel.showDeliveryDates();
            if (MyParcel.result.deliveryOptions.data.delivery.length <= 0) {
                MyParcel.hideDeliveryDates();
            }
            MyParcel.storeDeliveryOptions = response;
        }
        MyParcel.hideSpinner();
    },

    responseError: function () {
        MyParcel.showFallBackDelivery();
    },

    responseComplete: function () {
        $('#mypa-select-delivery').click();
    }
};
