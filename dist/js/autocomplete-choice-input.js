/**!
 * Turbo Select v0.9 (https://github.com/AlesJiranek/autocomplete-choice-input)
 *
 * Copyright 2015 Ales Jiranek
 *
 * Licensed under GNU GPL, Version 2.0.
 */
jQuery.fn.extend({
    autocompleteChoiceInput: function (options) {
        this.filter('input[type="text"]').each(function () {
            new AutocompleteChoiceInput(this, options);
        });
    }
});

/**
 * Constructor to create a new autocomplete choice input using the given input
 * @param element
 * @param options
 * @constructor
 */
function AutocompleteChoiceInput(element, options) {
    this.element = $(element);
    this.options = $.extend(this.options, options);
    this.init();
}

AutocompleteChoiceInput.prototype = {
    options: {
        minLength: 2,                       // starts autocomplete after count of chars
        maxItems: 10,                       // max autocompleted items
        singleText: false,                  // if true, selected items are string value, else output is array
        singleTextDelimiter: ';',           // values separator if singleText is true
        data: null                          // values for autocomplete
    },
    selectedData: {},
    autocompleteValues: {},
    cache: {},
    input: $('<input type="text">'),
    selectedItemsCounter: $('<div class="autocomplete-choice-input-items-counter"></div>'),
    selectedItemsList: $('<ul class="autocomplete-choice-input-selected-list">'),
    autocompleteList: $('<ul class="autocomplete-choice-input-autocomplete">'),

    /**
     * Creates autocomplete choice input
     */
    init: function () {
        this.buildContainer();
        this.setAutocompleteData();
        this.createSelectedItemsList();
        this.createSelectedItemsCounter();
        this.createAutocompleteList();
        this.addInputListener();
    },


    /**
     * Sets values for suggestion
     */
    setAutocompleteData: function () {
        if (this.options.data == null)
            this.autocompleteValues = this.element.data('options');
        else {
            this.autocompleteValues = this.options.data;
        }
    },


    /**
     * Creates container and input for input
     */
    buildContainer: function () {
        this.element.wrap('<div class="autocomplete-choice-input">');
        this.element.parent().css('position', 'relative');
        this.input.attr('class', this.element.attr('class'));
        this.input.attr('placeholder', this.element.attr('placeholder'));
        this.element.parent().append(this.input);
        this.element.hide();

        if (!this.options.singleText) {
            this.elementName = this.element.attr('name');
            this.element.attr('name', '');
        }
    },


    /**
     * Creates counter of selected items visible on right side of input
     */
    createSelectedItemsCounter: function () {
        this.selectedItemsCounter.text(Object.keys(this.selectedData).length);
        this.element.parent().append(this.selectedItemsCounter);

        this.selectedItemsCounter.on('click', $.proxy(function (e) {
            this.selectedItemsList.toggle();
            e.stopPropagation(e);
        }, this));
    },


    /**
     * Creates list for selected items
     */
    createSelectedItemsList: function () {
        this.selectedItemsList.hide();
        this.element.parent().append(this.selectedItemsList);
        this.selectedItemsList.css('min-width', this.element.parent().width());


        $('html').on('click', $.proxy(function () {
            this.selectedItemsList.hide();
        }, this));

    },


    /**
     * Creates list for suggested items
     */
    createAutocompleteList: function () {
        this.autocompleteList.hide();
        this.element.parent().append(this.autocompleteList);
        this.autocompleteList.css('min-width', this.element.parent().width());
    },


    /**
     * Adds listener to keyup event to start suggestion
     */
    addInputListener: function () {
        this.input.on('keyup', $.proxy(this.suggestItems, this));
    },


    /**
     * Updates list of selected items and their counter
     */
    updateSelected: function () {
        this.updateSelectedItemsList();
        this.updateItemsCounter()
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
        this.selectedItemsList.find('li').remove();

        var self = this;
        for (var key in this.selectedData) {
            var li = $('<li>');
            li.attr('id', key);
            li.text(this.selectedData[key]);

            var removeButton = $('<span class="remove-button">');
            removeButton.on('click', function (e) {
                self.removeSelectedItem($(this).closest('li'));
                e.stopPropagation(e);
            });

            li.prepend(removeButton);

            this.selectedItemsList.append(li);
        }
    },


    /**
     * Update suggested items list
     * @param values   Object    suggested items
     */
    updateAutocompleteItemsList: function (values) {
        this.autocompleteList.find('li').remove();

        if (Object.keys(values).length > 0)
            this.autocompleteList.show();
        else
            this.autocompleteList.hide();

        var self = this;
        for (var key in values) {
            var li = $('<li>');
            li.attr('id', key);
            li.text(values[key]);

            li.on('click', function () {
                self.addSuggestedItem($(this));
                self.autocompleteList.hide();
                self.input.val('');
            });

            this.autocompleteList.append(li);
        }
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
                if (this.autocompleteValues[key].toLowerCase().indexOf(value.toLowerCase()) >= 0) {
                    matches[key] = this.autocompleteValues[key];

                    if (++counter >= this.options.maxItems) {
                        break;
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
        this.selectedData[li.attr('id')] = li.text();
        this.updateSelected();

        if (this.options.singleText) {
            this.element.val(this.getSelectedAsString());
        }
        else {
            var hidden = $('<input type="hidden">');
            hidden.attr('name', this.elementName + '[]');
            hidden.val(li.attr('id'));
            this.element.parent().append(hidden);
        }

    },


    /**
     * Removes item from selected list
     * @param li
     */
    removeSelectedItem: function (li) {
        delete this.selectedData[li.attr('id')];
        this.updateSelected();

        if (this.options.singleText) {
            this.element.val(this.getSelectedAsString());
        }
        else {
            this.element.parent()
                .find('input[type="hidden"][name="' + this.elementName + '[]"][value="' + li.attr('id') + '"]')
                .remove();
        }
    },


    /**
     * Return string of selected items values
     * @returns {string}
     */
    getSelectedAsString: function () {
        var str = '';

        for (var key in this.selectedData)
            str += key + this.options.singleTextDelimiter;

        return str;
    }
};