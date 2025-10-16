jQuery(document).ready(function ($) {
    $(document).on('nfFormReady', function () {
        console.log('Ninja Forms is ready.');

        var startDateField = document.querySelector('.ninja-forms-field.start-date');
        var endDateField = document.querySelector('.ninja-forms-field.end-date');

        if (startDateField && endDateField) {
            console.log('Found Start Date Field:', startDateField);
            console.log('Found End Date Field:', endDateField);

            if (typeof flatpickr !== 'undefined') {
                console.log('Flatpickr is available, initializing...');
                initializeFlatpickr(startDateField, endDateField);
            } else {
                console.error('Flatpickr is not defined. Please ensure the library is included.');
            }
        } else {
            console.error('Start or End Date fields not found.');
        }
    });

    function initializeFlatpickr(startField, endField) {
        console.log('Initializing Flatpickr with fields:', startField, endField);

        try {
var startPicker = flatpickr(startField, {
    minDate: 'today',
    dateFormat: 'Y-m-d',  // Format for submission
    altFormat: 'l, F j, Y', // Format for display
    altInput: true,        // Use the altFormat for display in the input field
    onChange: function (selectedDates, dateStr, instance) {
        console.log('Start Date Selected:', dateStr);

        // Get the day and add a leading zero if it's a single-digit day
        var day = instance.formatDate(selectedDates[0], 'j'); // Get the day as number (without leading zero)
        if (parseInt(day) < 10) {
            day = '0' + day;  // Add leading zero if day is less than 10
        }

        // Format the date as "Monday, January 22, 2025" (with leading zero for days 01-09)
        var formattedDate = instance.formatDate(selectedDates[0], 'l, F ') + day + ' ' + instance.formatDate(selectedDates[0], 'Y');
        console.log('Formatted Start Date:', formattedDate);

        // Update the hidden field with the formatted date
        startField.value = formattedDate;
        console.log('Hidden field updated with:', formattedDate);

        // Update the minDate of the end date field
        if (endField._flatpickr) {
            endField._flatpickr.set('minDate', dateStr);
        }
    }
});


var endPicker = flatpickr(endField, {
    minDate: 'today',
    dateFormat: 'Y-m-d',  // Format for submission
    altFormat: 'l, F j, Y', // Format for display
    altInput: true,        // Use the altFormat for display in the input field
    onChange: function (selectedDates, dateStr, instance) {
        console.log('End Date Selected:', dateStr);

        // Get the day and add a leading zero if it's a single-digit day
        var day = instance.formatDate(selectedDates[0], 'j'); // Get the day as number (without leading zero)
        if (parseInt(day) < 10) {
            day = '0' + day;  // Add leading zero if day is less than 10
        }

        // Format the date as "Monday, January 22, 2025" (with leading zero for days 01-09)
        var formattedDate = instance.formatDate(selectedDates[0], 'l, F ') + day + ' ' + instance.formatDate(selectedDates[0], 'Y');
        console.log('Formatted End Date:', formattedDate);

        // Update the hidden field with the formatted date
        endField.value = formattedDate;
        console.log('Hidden field updated with:', formattedDate);
    }
});


            console.log('Flatpickr initialized successfully.');
        } catch (error) {
            console.error('Error initializing Flatpickr:', error);
        }
    }
});


jQuery(document).ready(function ($) {
    // Wait for the form and fields to fully load before running the script
    var checkFieldsExist = setInterval(function () {
        if ($('.children-number').length > 0) {
            console.log("Children number field found");
            clearInterval(checkFieldsExist); // Stop checking once it's found
            initializeDynamicFields();
        }
    }, 100); // Check every 100ms

    function initializeDynamicFields() {
        console.log("Dynamic fields functionality loaded.");

        // Initially hide all age fields on page load
        $('[class*="child-age-"]').each(function () {
            var fieldContainer = $(this).closest('.nf-field-container');
            if (fieldContainer.length) {
                fieldContainer.addClass('hidden').css({
                    display: 'none',
                    visibility: 'hidden',
                    opacity: '0',
                });
            }
        });

        // Attach input event handler to the children number field
        $('.children-number').on('input', function () {
            var inputVal = $(this).val(); // Get the value of the input field
            console.log("Captured input value:", inputVal);

            // Hide all age fields initially
            $('[class*="child-age-"]').each(function () {
                var fieldContainer = $(this).closest('.nf-field-container');
                if (fieldContainer.length) {
                    fieldContainer.addClass('hidden').css({
                        display: 'none',
                        visibility: 'hidden',
                        opacity: '0',
                    });
                }
            });

            // Handle empty input separately
            if (inputVal === "") {
                console.log("Input is empty, hiding all fields.");
                return;
            }

            // Parse and handle the number of children
            var numberOfChildren = parseInt(inputVal, 10);
            console.log("Parsed number of children:", numberOfChildren);

            // If input is invalid or zero, hide all fields
            if (isNaN(numberOfChildren) || numberOfChildren <= 0) {
                console.log("Hiding all fields due to invalid or zero input.");
                return;
            }

            // Dynamically show the required number of child-age fields
            for (var i = 1; i <= numberOfChildren; i++) {
                $('.child-age-' + i).each(function () {
                    var fieldContainer = $(this).closest('.nf-field-container');
                    if (fieldContainer.length) {
                        fieldContainer.removeClass('hidden').css({
                            display: 'block',
                            visibility: 'visible',
                            opacity: '1',
                            height: 'auto',
                            overflow: 'visible',
                        });
                    }
                });
            }
        });
    }
});




jQuery(document).ready(function ($) {
    // Wait for the form and fields to fully load before running the script
    var checkFieldsExist = setInterval(function () {
        if ($('.children-number').length > 0) {
            console.log("Children number field found");
            clearInterval(checkFieldsExist); // Stop checking once it's found
            initializeDynamicFields();
        }
    }, 100); // Check every 100ms

    function initializeDynamicFields() {
        console.log("Dynamic fields functionality loaded.");

        // Initially hide all age fields on page load
        $('[class*="child-age-"]').each(function () {
            var fieldContainer = $(this).closest('.nf-field-container');
            if (fieldContainer.length) {
                fieldContainer.addClass('hidden').css({
                    display: 'none',
                    visibility: 'hidden',
                    opacity: '0',
                    height: '0', // Ensure no space is reserved
                });
            }
        });

        // Attach input event handler to the children number field
        $('.children-number').on('input', function () {
            var inputVal = $(this).val(); // Get the value of the input field
            console.log("Captured input value:", inputVal);

            // Hide all age fields initially
            $('[class*="child-age-"]').each(function () {
                var fieldContainer = $(this).closest('.nf-field-container');
                if (fieldContainer.length) {
                    fieldContainer.addClass('hidden').css({
                        display: 'none',
                        visibility: 'hidden',
                        opacity: '0',
                        height: '0', // Ensure no space is reserved
                    });
                }
            });

            // Handle empty input separately
            if (inputVal === "") {
                console.log("Input is empty, hiding all fields.");
                return;
            }

            // Parse and handle the number of children
            var numberOfChildren = parseInt(inputVal, 10);
            console.log("Parsed number of children:", numberOfChildren);

            // If input is invalid or zero, hide all fields
            if (isNaN(numberOfChildren) || numberOfChildren <= 0) {
                console.log("Hiding all fields due to invalid or zero input.");
                return;
            }

            // Dynamically show the required number of child-age fields
            for (var i = 1; i <= numberOfChildren; i++) {
                $('.child-age-' + i).each(function () {
                    var fieldContainer = $(this).closest('.nf-field-container');
                    if (fieldContainer.length) {
                        fieldContainer.removeClass('hidden').css({
                            display: 'block',    // Ensure it takes up space
                            visibility: 'visible', // Make it visible
                            opacity: '1',         // Make it fully visible
                            height: 'auto',       // Let it expand naturally
                            overflow: 'visible',  // Ensure no clipping
                        });
                    }
                });
            }
        });
    }
});



// Functionality to dynamically show or hide child age fields based on input
jQuery(document).ready(function ($) {
    // Wait for the form and fields to fully load before running the script
    var checkFieldsExist = setInterval(function () {
        if ($('.children-number').length > 0) {
            console.log("Children number field found");
            clearInterval(checkFieldsExist); // Stop checking once it's found
            initializeDynamicFields();
        }
    }, 100); // Check every 100ms

    function initializeDynamicFields() {
        console.log("Dynamic fields functionality loaded.");

        // Attach input event handler to the children number field
        $('.children-number').on('input', function () {
            var inputVal = $(this).val(); // Get the value of the input field
            console.log("Captured input value:", inputVal);

            // Hide all age fields initially
            $('[class*="child-age-"]').each(function () {
                var fieldContainer = $(this).closest('.nf-field-container');
                if (fieldContainer.length) {
                    fieldContainer.addClass('hidden').css({
                        display: 'none',
                        visibility: 'hidden',
                        opacity: '0',
                    });
                }
            });
            
            // Hide all age fields initially
            $('[class*="child-age-"]').addClass('hidden');

            // Handle empty input separately
            if (inputVal === "") {
                console.log("Input is empty, hiding all fields.");
                return;
            }

            // Parse and handle the number of children
            var numberOfChildren = parseInt(inputVal, 10);
            console.log("Parsed number of children:", numberOfChildren);

            // If input is invalid or zero, hide all fields
            if (isNaN(numberOfChildren) || numberOfChildren <= 0) {
                console.log("Hiding all fields due to invalid or zero input.");
                return;
            }

            // Dynamically show the required number of child-age fields
            for (var i = 1; i <= numberOfChildren; i++) {
                $('.child-age-' + i).each(function () {
                    var fieldContainer = $(this).closest('.nf-field-container');
                    if (fieldContainer.length) {
                        fieldContainer.removeClass('hidden').css({
                            display: 'block',
                            visibility: 'visible',
                            opacity: '1',
                            height: 'auto',
                            overflow: 'visible',
                        });
                    }
                });
            }
            
            // Dynamically show the required number of child-age fields
            for (var i = 1; i <= numberOfChildren; i++) {
                $('.child-age-' + i).removeClass('hidden');
            }
            
        });
    }
});

// Country code

jQuery(document).ready(function ($) {
    // Check if the phone field exists
    var phoneField = $('#nf-field-140');
    if (phoneField.length) {
        // Add a country code dropdown before the phone field
        var countryCodeDropdown = `
            <select id="country-code" class="nf-country-code">
                <option value="+1">+1 (US)</option>
                <option value="+44">+44 (UK)</option>
                <option value="+91">+91 (IN)</option>
                <option value="+254">+254 (KE)</option>
                <option value="+61">+61 (AU)</option>
                <!-- Add more country codes as needed -->
            </select>
        `;

        // Insert the dropdown before the phone field
        phoneField.before(countryCodeDropdown);

        // Update the phone field value with the selected country code
        $('#country-code').on('change', function () {
            var countryCode = $(this).val();
            phoneField.val(countryCode + ' ' + phoneField.val().replace(/^\+\d+ /, '')); // Remove existing code if any
        });

        // Prepend the default country code on focus
        phoneField.on('focus', function () {
            if (!phoneField.val().startsWith($('#country-code').val())) {
                phoneField.val($('#country-code').val() + ' ' + phoneField.val());
            }
        });
    }
});
// Create a style element
const style = document.createElement('style');
style.type = 'text/css';

// Add the CSS rule
style.innerHTML = `
  .ninja-forms-field.nf-element.iti__tel-input {
    padding-left: 50px !important;
  }
`;

// Append the style element to the head
document.head.appendChild(style);


