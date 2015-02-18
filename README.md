# Autocomplete Choice Input

This jQuery plugin was created, because I needed to create select box with thousand of options.
Rendering all of them was slow and not necessary, because it is impossible to scroll through all the options.
I needed something with select box functionality without rendering all options. So I created this plugin.


## Documentation and examples
You can find documentation, examples and FAQ on http://alesjiranek.github.com/autocomplete-choice-input


## Basic Usage

In default selected values are submitted as array.

```javascript
<input type="text" name="example1" class="a-c-i" data-options="{1:"Option 1", 2:"Option 2"}">

$(document).ready(function(){
    $('.a-c-i').autocompleteChoiceInput();
});
```

## Options

```javascript
$(document).ready(function(){
    $('.a-c-i').autocompleteChoiceInput({
        minLength: 2,                   // starts autocomplete after count of chars
        maxItems: 10,                   // max autocompleted items
        singleText: false,              // if true, selected items are string value, else output is array
        singleTextDelimiter: ';',       // values separator if singleText is true
        data: null                      // values for autocomplete, default data-options attribute
    });
});
```