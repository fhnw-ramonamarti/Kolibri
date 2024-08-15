import { TestSuite } from "../../docs/src/kolibri/util/test.js";
import { fireChangeEvent } from "../../docs/src/kolibri/util/dom.js";
import { projectChoiceInput } from "./choiceInputProjector.js";
import { ChoiceDetailController, ChoiceMasterController } from "./choiceInputController.js";

const choiceInputProjectorSuite = TestSuite("experimental/js6/choiceInputProjector");
// prepare for ip6 inclusion in docs folder
// const choiceInputProjectorSuite = TestSuite("projector/choiceInput/choiceInputProjector");

/**
 * The purpose of this binding spike is not to test all possible user interactions and their outcome but rather
 * making sure that the view construction and the binding is properly set up.
 * Complex logic is to be tested against the controller (incl. model).
 */
choiceInputProjectorSuite.add("binding", (assert) => {
    // prepare controller for ui call
    const detailController = ChoiceDetailController({
        value: "Switzerland",
        placeholder: "Choose a country",
        label: "Country",
        name: "country",
    });
    const masterController = ChoiceMasterController(
        "continent",
        "country"
    )({
        elementList: [
            { country: "Germany", continent: "Europe" },
            { country: "Switzerland", continent: "Europe" },
            { country: "United States", continent: "North America" },
        ],
        sectionElement: { continent: "Europe", country: "Switzerland" },
        focusObject: { column: 1, value: "Switzerland" },
    });

    // prepare used dom elements
    const [_, choiceElement] = projectChoiceInput(detailController, masterController, "TEST");
    const someEntry = choiceElement.querySelector("ul .entry.country:first-child");
    const someEntry2 = choiceElement.querySelector("ul .entry.continent:first-child");

    // test the binding

    // test hover on other element
    const event = new MouseEvent("mouseover", {
        view: window,
        bubbles: true,
        cancelable: true,
    });
    someEntry2.dispatchEvent(event);
    fireChangeEvent(someEntry2);
    assert.is(detailController.getValue(), "Switzerland");
    assert.is(masterController.getValue().continent, "Europe");
    assert.is(masterController.getFocusObject().value, "All");

    // test click on other element
    someEntry.click();
    fireChangeEvent(someEntry);
    assert.is(detailController.getValue(), "Germany");
    assert.is(masterController.getValue().country, "Germany");
    assert.is(masterController.getFocusObject().value, "Germany");
});

choiceInputProjectorSuite.run();
