import { TestSuite } from "../../docs/src/kolibri/util/test.js";
import { ChoiceDetailController, ChoiceMasterController } from "./choiceInputController.js";

const choiceInputControllerSuite = TestSuite("experimental/js6/choiceInputController");
// prepare for ip6 inclusion in docs folder
// const choiceInputControllerSuite = TestSuite("projector/choiceInput/choiceInputController");

choiceInputControllerSuite.add("full-detail", (assert) => {
    const controller = ChoiceDetailController({
        value: "Switzerland",
        placeholder: "Choose a country",
        label: "Country",
        name: "country",
    });

    // test getter with given values in args
    assert.is(controller.getValue(), "Switzerland");
    assert.is(controller.getPlaceholder(), "Choose a country");
    assert.is(controller.getLabel(), "Country");
    assert.is(controller.getName(), "country");

    // register callback on value change
    let found = false;
    controller.onValueChanged(() => (found = true));
    assert.is(found, true); // callback is called when registering

    // test value setter and callback
    found = false;
    controller.setValue("other value");
    assert.is(found, true);
    assert.is(controller.getValue(), "other value");
});

choiceInputControllerSuite.add("full-master", (assert) => {
    const countries = [
        { country: "Germany", continent: "Europe" },
        { country: "Switzerland", continent: "Europe" },
        { country: "United States", continent: "North America" },
    ];

    const controller = ChoiceMasterController(
        "continent",
        "country",
        100
    )({
        elementList: countries,
        sectionElement: { continent: "All", country: "Switzerland" },
        focusObject: { column: 1, value: "Germany" },
    });

    // test getter with given values in args
    assert.is(controller.getValue().country, "Switzerland");
    assert.is(controller.getElementList(), countries);
    assert.is(controller.getFocusObject().column, 1);

    // test default values of other getters
    assert.is(controller.getChoiceBoxOpen(), false);
    assert.is(controller.getDebounceText(), "");

    // test list splitting functions
    assert.is(controller.getCategories().join(","), ["All", "Europe", "North America"].join(","));
    assert.is(controller.getElements().join(","), ["Germany", "Switzerland", "United States"].join(","));
    assert.is(controller.getFilteredElements().join(","), ["Germany", "Switzerland", "United States"].join(","));

    // test filtering with changed continent value
    controller.setValue({ continent: "Europe" });
    assert.is(controller.getFilteredElements().join(","), ["Germany", "Switzerland"].join(","));

    // test state change of master view visibility
    controller.setChoiceBoxOpen(true);
    assert.is(controller.getChoiceBoxOpen(), true);

    // register callback on value change
    let found = false;
    controller.onValueChanged(() => (found = true));
    assert.is(found, true); // callback is called when registering

    // test value setter and callback
    found = false;
    controller.setValue({ continent: "North America" });
    assert.is(found, true);
    assert.is(controller.getValue().continent, "North America");

    // register and test focus setter and callback
    controller.onFocusObjectChanged(() => (found = true));
    found = false;
    controller.setFocusObject({ column: -1 });
    assert.is(controller.getFocusObject().column, 0); // value from selection continent (column 0) taken

    // test debouncing and delay
    controller.triggerDebounceInput("t");
    controller.triggerDebounceInput("est");
    assert.is(controller.getDebounceText(), "test");
    setTimeout(() => { // delay
        controller.triggerDebounceInput("t");
        assert.is(controller.getDebounceText(), "t");
    }, 100);
});

choiceInputControllerSuite.run();
