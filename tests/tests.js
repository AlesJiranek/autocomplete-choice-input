describe("Autocomplete Choice Input Tests", function () {
    "use strict";

    /** Helpers */
    var states = {
        "AL": "Alabama",
        "AK": "Alaska",
        "AS": "American Samoa",
        "AZ": "Arizona",
        "AR": "Arkansas",
        "CA": "California",
        "CO": "Colorado",
        "CT": "Connecticut",
        "DE": "Delaware",
        "DC": "District Of Columbia",
        "FM": "Federated States Of Micronesia",
        "FL": "Florida",
        "GA": "Georgia",
        "GU": "Guam",
        "HI": "Hawaii",
        "ID": "Idaho",
        "IL": "Illinois",
        "IN": "Indiana",
        "IA": "Iowa",
        "KS": "Kansas",
        "KY": "Kentucky",
        "LA": "Louisiana",
        "ME": "Maine",
        "MH": "Marshall Islands",
        "MD": "Maryland",
        "MA": "Massachusetts",
        "MI": "Michigan",
        "MN": "Minnesota",
        "MS": "Mississippi",
        "MO": "Missouri",
        "MT": "Montana",
        "NE": "Nebraska",
        "NV": "Nevada",
        "NH": "New Hampshire",
        "NJ": "New Jersey",
        "NM": "New Mexico",
        "NY": "New York",
        "NC": "North Carolina",
        "ND": "North Dakota",
        "MP": "Northern Mariana Islands",
        "OH": "Ohio",
        "OK": "Oklahoma",
        "OR": "Oregon",
        "PW": "Palau",
        "PA": "Pennsylvania",
        "PR": "Puerto Rico",
        "RI": "Rhode Island",
        "SC": "South Carolina",
        "SD": "South Dakota",
        "TN": "Tennessee",
        "TX": "Texas",
        "UT": "Utah",
        "VT": "Vermont",
        "VI": "Virgin Islands",
        "VA": "Virginia",
        "WA": "Washington",
        "WV": "West Virginia",
        "WI": "Wisconsin",
        "WY": "Wyoming"
    };

    function matchStates(text, maxItems) {
        maxItems = typeof maxItems !== "undefined" ? maxItems : 10;

        var matches = {};
        var counter = 0;
        for (var state in states) {
            if (states.hasOwnProperty(state)) {
                if (states[state].toLowerCase().indexOf(text.toLowerCase()) >= 0) {
                    matches[state] = states[state];

                    if (++counter === maxItems) {
                        break;
                    }
                }
            }
        }
        return matches;
    }

    /** Tests */

    var $input;
    var sandbox;

    beforeAll(function () {
        sandbox = $("<div id=\"sandbox\">");
        $(document.body).append(sandbox);
    });


    describe("Core", function () {

        beforeEach(function () {
            sandbox.empty();
            $input = $("<input type=\"text\" name=\"testInput\" id=\"testInput\">");

            $input.data("options", states);
            sandbox.append($input);

            $input.autocompleteChoiceInput();
        });

        it("Should wrap input into new div", function () {
            expect($("div.autocomplete-choice-input").length).toBe(1);
            expect($input.parent().hasClass("autocomplete-choice-input")).toBe(true);
        });

        it("Should create new html input element for user input", function () {
            expect($input.siblings("input[type=\"text\"]").length).toBe(1);
        });

        it("Should copy classes and placeholder from original input to new one", function () {
            expect($input.attr("class")).toBe($input.siblings("input[type=\"text\"]").attr("class"));
            expect($input.attr("placeholder")).toBe($input.siblings("input[type=\"text\"]").attr("placeholder"));
        });

        it("Should create list for selected items", function () {
            expect($input.siblings("ul.autocomplete-choice-input-selected-list").length).toBe(1);
        });

        it("Should create list for autocomplete items", function () {
            expect($input.siblings("ul.autocomplete-choice-input-autocomplete").length).toBe(1);
        });

        it("Should create selected items counter", function () {
            expect($input.siblings("div.autocomplete-choice-input-items-counter").length).toBe(1);
        });

        it("Should suggest no options", function () {
            $input.siblings("input[type=\"text\"]").simulate("key-sequence", {sequence: "a"});
            expect($("ul.autocomplete-choice-input-autocomplete li").length).toBe(0);
        });

        it("Should suggest Alabama, Alaska, California, Marshall Islands, Palau", function () {
            var text = "al";

            var matches = matchStates(text);
            $input.siblings("input[type=\"text\"]").simulate("key-sequence", {sequence: text});
            expect($("ul.autocomplete-choice-input-autocomplete li").length).toBe(Object.keys(matches).length);

            var suggested = {};
            $("ul.autocomplete-choice-input-autocomplete li").each(function () {
                if ($(this).attr("id")) {
                    suggested[$(this).attr("id")] = $(this).text();
                }
            });

            expect(suggested).toEqual(matches);
        });

        it("Should suggest Alabama", function () {
            $input.siblings("input[type=\"text\"]").simulate("key-sequence", {sequence: "alabama"});
            var li = $("ul.autocomplete-choice-input-autocomplete li");
            expect(li.length).toBe(1);
            expect(li.first().attr("id")).toBe("AL");
            expect(li.first().text()).toBe("Alabama");
        });

        it("Should pass test with 100 random words", function () {
            for (var i = 0; i < 100; i++) {
                $input.siblings("input[type=\"text\"]").val("");
                var text = randstr(Math.floor(Math.random() * (15 - 2)) + 2);

                var matches = matchStates(text);
                $input.siblings("input[type=\"text\"]").simulate("key-sequence", {sequence: text});
                expect($("ul.autocomplete-choice-input-autocomplete li").length).toBe(Object.keys(matches).length);

                var suggested = {};
                $("ul.autocomplete-choice-input-autocomplete li").each(function () {
                    if ($(this).attr("id")) {
                        suggested[$(this).attr("id")] = $(this).text();
                    }
                });

                expect(suggested).toEqual(matches);
            }
        });

        it("Should add item to selected after clicking on it", function () {
            var text = "alabama";
            $input.siblings("input[type=\"text\"]").simulate("key-sequence", {sequence: text});
            var match = matchStates(text, 1);

            $("ul.autocomplete-choice-input-autocomplete li").first().simulate("click");

            var list = $("ul.autocomplete-choice-input-selected-list");
            expect(list.find("li").length).toBe(1);

            var option = list.find("li").first();
            var optionObj = {};

            if (option.attr("id")) {
                optionObj[option.attr("id")] = option.text();
            }

            expect(optionObj).toEqual(match);

            var counter = $("div.autocomplete-choice-input-items-counter");
            expect(counter.text()).toBe("1");

            var hidden = $input.parent().find("input[type=\"hidden\"]");
            expect(hidden.length).toBe(1);
            expect(hidden.attr("name")).toBe("testInput[]");
            expect(hidden.val()).toBe("AL");
        });

        it("Should add item to selected and then remove it after clicking on remove button", function () {
            var text = "alabama";
            $input.siblings("input[type=\"text\"]").simulate("key-sequence", {sequence: text});

            $("ul.autocomplete-choice-input-autocomplete li").first().simulate("click");

            var list = $("ul.autocomplete-choice-input-selected-list");
            expect(list.find("li").length).toBe(1);

            var removeButton = list.find("li").first().find("span.remove-button");
            removeButton.simulate("click");

            expect(list.find("li").length).toBe(0);

            var counter = $("div.autocomplete-choice-input-items-counter");
            expect(counter.text()).toBe("0");
        });
    });
});