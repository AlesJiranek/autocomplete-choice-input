/**!
 *  Autocomplete Choice Input - v1.1.0
 *  jQuery plugin for fast selects with huge amount of options
 *  https://github.com/AlesJiranek/autocomplete-choice-input
 *
 *  Made by Aleš Jiránek
 *  Under MIT License
 */
;(function ($, window, document, undefined) {
    "use strict"; //jsHint

    var pluginName = "autocompleteChoiceInput",
        defaults = {
            minLength: 2,                       // starts autocomplete after count of chars
            maxItems: 10,                       // max autocompleted items
            singleText: false,                  // if true, selected items are string value, else output is array
            singleTextDelimiter: ";",           // values separator if singleText is true
            data: null,                         // values for autocomplete
            keyboardSupport: true,              // allow selecting autocompleted items with keyboard
            allowAdd: false,                    // allow adding new items
            addText: "Create %item%...",        // suggested string for creating new item,
            addedPrefix: "",                    // prefix added to created value
            allowEdit: false,                   // allow editing selected values, depends on allowAdd
            endpoint: ""                        // if available, call endpoint to fetch data
        };

    /**
     * Constructor to create a new autocomplete choice input using the given input
     * @param element
     * @param options
     * @constructor
     */
    function AutocompleteChoiceInput(element, options) {
        this.element = $(element);
        this.options = $.extend({}, defaults, options);
        this.init();
    }

    $.extend(AutocompleteChoiceInput.prototype, {

        /**
         * Creates autocomplete choice input
         */
        init: function () {
            this.buildContainer();
            this.createInput();
            this.setAutocompleteData();
            this.createSelectedItemsList();
            this.createSelectedItemsCounter();
            this.createAutocompleteList();
            this.addInputListener();
            this.setDefaultSelectedItems();
        },


        /**
         * Sets values for suggestion
         */
        setAutocompleteData: function () {
            this.autocompleteValues = {};
            this.cache = {};
            var data = {};

            if (this.options.data === null) {
                data = this.element.data("options");
                if (typeof data === "undefined") {
                    if (this.element.is("select")) {
                        data = this.parseSelectOptions();
                    }
                    else if (this.options.endpoint) {
                        $.ajax({
                            url: this.options.endpoint
                        }).success(function(res) {
                            data = res.data;
                        }).error(function(err){
                            data = ["Alabama", "Alaska", "California", "New York", "Texas"];
                            //This is for demo purpose because we do not have an endpoint
                        })
                    }
                    else {
                        data = {};
                    }
                }
            }
            else {
                data = this.options.data;
            }

            if ($.isArray(data)) {
                var temp = {};
                for (var i = 0; i < data.length; i++) {
                    if (typeof data[i] !== "string") {
                        window.console.error("Invalid type of data for suggestion.");
                        temp = {};
                        break;
                    }
                    temp[data[i]] = data[i];
                }

                data = temp;
            }

            for (var item in data) {
                if (data.hasOwnProperty(item)) {
                    if (data[item].indexOf(this.options.addedPrefix) >= 0) {
                        data[item] = data[item].replace(this.options.addedPrefix, "");
                    }
                }
            }

            this.autocompleteValues = data;

            if (Object.keys(this.autocompleteValues).length < 1) {
                this.setInputDisabled();
            }
        },


        /**
         * Parses select box options as values for suggestion
         */
        parseSelectOptions: function () {
            var data = {};
            this.element.find("option").each(function () {
                var option = $(this);

                if (option.attr("value") !== "") {
                    data[option.attr("value")] = option.text();
                }
                else {
                    data[option.text()] = option.text();
                }
            });

            return data;
        },


        /**
         * Set plugins input disabled
         */
        setInputDisabled: function () {
            this.input.attr("disabled", "disabled");
        },


        /**
         * Creates container for input
         */
        buildContainer: function () {
            this.element.wrap("<div class=\"autocomplete-choice-input\">");
            this.element.parent().css("position", "relative");
        },


        /**
         * Creates input
         */
        createInput: function () {
            this.input = $("<input type=\"text\">");
            this.input.attr("class", this.element.attr("class"));
            this.input.attr("placeholder", this.element.attr("placeholder"));
            this.element.parent().append(this.input);
            this.element.hide();

            if (!this.options.singleText) {
                this.elementName = this.element.attr("name");
                this.element.attr("name", "");
            }
        },


        /**
         * Creates counter of selected items visible on right side of input
         */
        createSelectedItemsCounter: function () {
            this.selectedItemsCounter = $("<div class=\"autocomplete-choice-input-items-counter\"></div>");

            this.selectedItemsCounter.text(Object.keys(this.selectedData).length);
            this.element.parent().append(this.selectedItemsCounter);

            this.selectedItemsCounter.on("click", $.proxy(function (e) {
                this.selectedItemsList.toggle();
                e.stopPropagation(e);
            }, this));
        },


        /**
         * Creates list for selected items
         */
        createSelectedItemsList: function () {
            this.selectedData = {};
            this.selectedItemsList = $("<ul class=\"autocomplete-choice-input-selected-list\">");

            this.selectedItemsList.hide();
            this.element.parent().append(this.selectedItemsList);
            this.selectedItemsList.css("min-width", this.element.parent().width());


            $("html").on("click", $.proxy(function () {
                this.selectedItemsList.hide();
            }, this));

        },


        /**
         * Creates list for suggested items
         */
        createAutocompleteList: function () {
            this.autocompleteList = $("<ul class=\"autocomplete-choice-input-autocomplete\">");

            this.updateAutocompleteItemsList({});
            this.element.parent().append(this.autocompleteList);
            this.autocompleteList.css("min-width", this.element.parent().width());
        },


        /**
         * Adds listener to keyup event to start suggestion
         */
        addInputListener: function () {
            if (this.options.keyboardSupport === true) {
                this.addKeyboardSupport();
            }
            else {
                this.input.on("keyup", $.proxy(this.suggestItems, this));
            }
        },


        /**
         * Updates list of selected items and their counter
         */
        updateSelected: function () {
            this.updateSelectedItemsList();
            this.updateItemsCounter();
            this.updateSelectedInput();
        },


        /**
         * Updates selected items counter
         */
        updateItemsCounter: function () {
            this.selectedItemsCounter.text(Object.keys(this.selectedData).length);
        },


        /**
         *  Updates selected items list
         */
        updateSelectedItemsList: function () {
            this.selectedItemsList.find("li").remove();

            if (Object.keys(this.selectedData).length < 1) {
                this.selectedItemsList.hide();
            }

            var self = this;
            for (var key in this.selectedData) {
                if (this.selectedData.hasOwnProperty(key)) {
                    var li = $("<li>");
                    li.attr("id", key);
                    li.text(this.selectedData[key]);

                    if (this.options.allowEdit && this.options.allowAdd) {
                        var editButton = $("<span class=\"edit-button\">");
                        editButton.on("click", self.editSelectedItemButtonCallback(editButton));
                        li.prepend(editButton);
                    }

                    var removeButton = $("<span class=\"remove-button\">");
                    removeButton.on("click", self.removeSelectedItemButtonCallback(removeButton));

                    li.prepend(removeButton);

                    this.selectedItemsList.append(li);
                }
            }
        },


        /**
         * Callback function called after clicking on remove button in selected items list
         *
         * @param button
         * @returns {Function}
         */
        removeSelectedItemButtonCallback: function (button) {
            var self = this;
            return function () {
                self.removeSelectedItem(button.closest("li"));
                window.event.stopPropagation();
            };
        },


        /**
         * Callback function called after clicking on edit button in selected items list
         *
         * @param button
         * @returns {Function}
         */
        editSelectedItemButtonCallback: function (button) {
            var self = this;
            return function () {
                window.event.stopPropagation();
                var li = button.closest("li");
                self.input.val(li.text());
                self.removeSelectedItem(li);
                self.input.keyup(); // invokes suggestion of items
                self.setFocus();
            };
        },


        /**
         * Updates input value with selected data
         */
        updateSelectedInput: function () {
            if (this.options.singleText) {
                this.element.val(this.getSelectedAsString());
            }
            else {
                this.element.parent().find("input[type=\"hidden\"][name=\"" + this.elementName + "[]\"]").remove();

                for (var key in this.selectedData) {
                    if (this.selectedData.hasOwnProperty(key)) {
                        var hidden = $("<input type=\"hidden\">");
                        hidden.attr("name", this.elementName + "[]");
                        hidden.val(key);
                        this.element.parent().append(hidden);
                    }
                }
            }
        },


        /**
         * Update suggested items list
         * @param values   Object    suggested items
         */
        updateAutocompleteItemsList: function (values) {
            this.autocompleteList.find("li").remove();

            if (Object.keys(values).length > 0 || (this.options.allowAdd && this.input.val())) {
                this.autocompleteList.show();
            }
            else {
                this.autocompleteList.hide();
            }

            if (this.options.allowAdd && typeof values[this.input.val()] === "undefined") {
                var addLi = $("<li>");
                addLi.attr("id", this.input.val());
                addLi.text(this.options.addText.replace("%item%", this.input.val()));
                addLi.on("click", this.createNewItem(addLi));
                this.autocompleteList.append(addLi);
            }

            for (var key in values) {
                if (values.hasOwnProperty(key)) {
                    var li = $("<li>");
                    li.attr("id", key);
                    li.text(values[key]);

                    li.on("click", this.suggestedItemClickCallback(li));

                    this.autocompleteList.append(li);
                }
            }
        },


        /**
         * Callback function called after clicking on suggested item
         *
         * @param li
         * @returns {Function}
         */
        suggestedItemClickCallback: function (li) {
            var self = this;
            return function () {
                self.addSuggestedItem(li);
                self.input.val("");
                self.updateAutocompleteItemsList({});
                self.setFocus();
            };
        },


        /**
         * Callback function called after clicking on first suggested item which creates new item if allowAdd = true
         *
         * @param li
         * @returns {Function}
         */
        createNewItem: function (li) {
            var self = this;
            return function () {
                li.text(li.attr("id"));
                li.attr("id", self.options.addedPrefix + li.attr("id"));
                self.addSuggestedItem(li);
                self.input.val("");
                self.updateAutocompleteItemsList({});
                self.setFocus();
            };
        },


        /**
         * Suggests items for given input
         */
        suggestItems: function () {
            var value = this.input.val();

            if (value.length < this.options.minLength) {
                this.updateAutocompleteItemsList({});
                return;
            }

            if (!(value in this.cache)) {
                var matches = {};
                var counter = 0;
                for (var key in this.autocompleteValues) {
                    if (this.autocompleteValues.hasOwnProperty(key)) {
                        if (this.autocompleteValues[key].toLowerCase().indexOf(value.toLowerCase()) >= 0) {
                            matches[key] = this.autocompleteValues[key];

                            if (++counter >= this.options.maxItems) {
                                break;
                            }
                        }
                    }
                }

                this.cache[value] = matches;
            }

            this.updateAutocompleteItemsList(this.cache[value]);
        },


        /**
         * Add suggested item to selected list
         * @param li
         */
        addSuggestedItem: function (li) {
            this.selectedData[li.attr("id")] = li.text();
            this.updateSelected();
        },


        /**
         * Removes item from selected list
         * @param li
         */
        removeSelectedItem: function (li) {
            delete this.selectedData[li.attr("id")];
            this.updateSelected();
        },


        /**
         * Return string of selected items values
         * @returns {string}
         */
        getSelectedAsString: function () {
            var str = "";
            var delimiter = "";

            for (var key in this.selectedData) {
                if (this.selectedData.hasOwnProperty(key)) {
                    str += delimiter + key;
                    delimiter = this.options.singleTextDelimiter;
                }
            }

            return str;
        },


        /**
         * Creates default selected list from input value
         */
        setDefaultSelectedItems: function () {
            if (this.element.is("select")) {
                var self = this;

                this.element.find("option").each(function () {
                    var option = $(this);

                    if (option.attr("selected") === "selected") {
                        var value = option.attr("value");
                        var label = option.text();

                        if (typeof value !== "undefined" && typeof self.autocompleteValues[value] !== "undefined") {
                            self.selectedData[value] = label;
                        }
                        else if (typeof self.autocompleteValues[label] !== "undefined") {
                            self.selectedData[label] = label;
                        }
                    }
                });
            }
            else {
                if (this.element.val() !== "") {
                    var values = this.element.val();
                    values = values.split(this.options.singleTextDelimiter);

                    for (var i = 0; i < values.length; i++) {
                        if (typeof this.autocompleteValues[values[i]] !== "undefined") {
                            this.selectedData[values[i]] = this.autocompleteValues[values[i]];
                        }
                    }
                }
            }
            this.updateSelected();
            this.selectedItemsList.hide();
        },


        /**
         * Binds callbacks for keyboard support
         */
        addKeyboardSupport: function () {
            var self = this;

            this.element.parent().off("keyup.autocompletechoiceinput").on("keyup.autocompletechoiceinput", $.proxy(function (event) {

                if (event.which === 38) {
                    self.onPressKeyUp();
                    event.stopPropagation();
                }
                else if (event.which === 40) {
                    self.onPressKeyDown();
                    event.stopPropagation();
                }
                else if (event.which === 13) {
                    self.onPressKeyEnter();
                    event.stopPropagation();
                }
                else {
                    self.suggestItems();
                }
            }));

            this.element.parent().off("keydown.autocompletechoiceinput").on("keydown.autocompletechoiceinput", $.proxy(function (event) {
                if (self.autocompleteList.is(":visible")) {
                    if (event.which === 38 || event.which === 40) {
                        return false;
                    }
                    else if (event.which === 13) {
                        event.preventDefault(event);
                    }
                }
            }));
        },


        /**
         * Key Up functionality
         */
        onPressKeyUp: function () {
            if (this.autocompleteList.is(":visible")) {
                var active = this.autocompleteList.find(".active");

                if (active.length === 0) {
                    this.autocompleteList.find("li:last-child").addClass("active");
                }
                else {
                    var index = this.autocompleteList.find("li.active").index();

                    if (index > 0) {
                        this.autocompleteList.find("li.active").removeClass("active");
                        this.autocompleteList.find("li:eq(" + (index - 1) + ")").addClass("active");
                    }
                }
            }
        },


        /**
         * Key Down functionality
         */
        onPressKeyDown: function () {
            if (this.autocompleteList.is(":visible")) {
                var active = this.autocompleteList.find(".active");

                if (active.length === 0) {
                    this.autocompleteList.find("li:first-child").addClass("active");
                }
                else {
                    var index = this.autocompleteList.find("li.active").index();

                    if (index < this.autocompleteList.find("li").length - 1) {
                        this.autocompleteList.find("li.active").removeClass("active");
                        this.autocompleteList.find("li:eq(" + (index + 1) + ")").addClass("active");
                    }
                }
            }
        },


        /**
         * Key Down functionality
         */
        onPressKeyEnter: function () {
            if (this.autocompleteList.is(":visible")) {
                if (this.autocompleteList.find("li.active").length !== 0) {
                    this.autocompleteList.find("li.active").click();
                }
                else {
                    if (this.options.allowAdd) {
                        this.autocompleteList.find("li").first().click();
                    }
                }
            }
        },


        /**
         * Sets focus to input
         */
        setFocus: function () {
            this.input.focus();
        }
    });

    jQuery.fn[pluginName] = function (options) {
        return this.each(function () {
            if (!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" + pluginName, new AutocompleteChoiceInput(this, options));
            }
        });
    };
})(jQuery, window, document);
