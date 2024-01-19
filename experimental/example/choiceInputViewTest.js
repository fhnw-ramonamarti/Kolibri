import { TestSuite } from "../../docs/src/kolibri/util/test.js";
import { start } from "./starter.js";
import { countryList } from "../countries.js";

const choiceInputViewSuite = TestSuite("experimental/choiceInputView");
// prepare for ip6 inclusion in docs folder
// const choiceInputViewSuite = TestSuite("examples/choiceInput/choiceInputView");

/**
 * The purpose of a spike is not to test all possible user interactions and their outcome but rather
 * making sure that the view construction and the binding is properly set up.
 * Complex logic is to be tested against the controller (incl. model).
 */
choiceInputViewSuite.add("spike", (assert) => {
    const className = "test";
    const root = document.createElement("div"); // created but never mounted
    root.classList.add(className);
    root.append(...start(className));

    // constants for country example
    const numbCountries = countryList.length;
    const numbContinents = new Set(countryList.map((e) => e.continent)).size;

    // assert properties of the generated DOM elements
    assert.is(root.querySelectorAll("." + className).length, 1);
    assert.is(root.querySelectorAll("ul").length, 2);
    assert.is(root.querySelectorAll(".entry.country").length, numbCountries);
    assert.is(root.querySelectorAll(".entry.continent").length, numbContinents + 1); // + 1 for All

    // work with DOM elements just like user would do in the browser
    const oldSelection = root.querySelector(".continent.selected");
    const newSelection = root.querySelector(".continent:not(.selected)");
    newSelection.click();
    assert.isTrue(!oldSelection.classList.contains("selected"));
    assert.is(newSelection, root.querySelector(".continent.selected"));
});

choiceInputViewSuite.run();
