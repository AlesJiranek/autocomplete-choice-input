# Autocomplete Choice Input [![Build Status](https://travis-ci.org/AlesJiranek/autocomplete-choice-input.svg?branch=master)](https://travis-ci.org/AlesJiranek/autocomplete-choice-input)

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
You can find list of all options and examples of their usage on http://alesjiranek.github.com/autocomplete-choice-input