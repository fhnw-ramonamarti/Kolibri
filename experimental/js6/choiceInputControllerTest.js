import { TestSuite } from "../../docs/src/kolibri/util/test.js";
import { ChoiceDetailController, ChoiceMasterController } from "./choiceInputController.js";

const choiceInputControllerSuite = TestSuite("experimental/js6/choiceInputController");
// const choiceInputControllerSuite = TestSuite("projector/choiceInput/choiceInputController");

choiceInputControllerSuite.add("full-detail", (assert) => {
    const controller = ChoiceDetailController({
        value: "Switzerland",
        placeholder: "Choose a country",
        label: "Country",
        name: "country",
    });
    assert.is(controller.getValue(), "Switzerland");
    assert.is(controller.getPlaceholder(), "Choose a country");
    assert.is(controller.getLabel(), "Country");
    assert.is(controller.getName(), "country");

    let found = false;
    controller.onValueChanged(() => (found = true));
    assert.is(found, true); // callback is called when registering
    found = false;
    controller.setValue("other value");
    assert.is(found, true);
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

    assert.is(controller.getValue().country, "Switzerland");
    assert.is(controller.getElementList(), countries);
    assert.is(controller.getFocusObject().column, 1);
    assert.is(controller.getChoiceBoxOpen(), false);
    assert.is(controller.getDebounceText(), "");

    assert.is(controller.getCategories().join(","), ["All", "Europe", "North America"].join(","));
    assert.is(controller.getElements().join(","), ["Germany", "Switzerland", "United States"].join(","));

    assert.is(controller.getFilteredElements().join(","), ["Germany", "Switzerland", "United States"].join(","));
    controller.setValue({ continent: "Europe" });
    assert.is(controller.getFilteredElements().join(","), ["Germany", "Switzerland"].join(","));

    let found = false;
    controller.onValueChanged(() => (found = true));
    assert.is(found, true); // callback is called when registering
    found = false;
    controller.setValue("other value");
    assert.is(found, true);

    controller.onFocusObjectChanged(() => (found = true));
    controller.setFocusObject({ column: -1 });
    assert.is(controller.getFocusObject().column, 0); // value from selection continent (column 0) taken

    controller.setChoiceBoxOpen(true);
    assert.is(controller.getChoiceBoxOpen(), true);

    // test delay of debounce
    controller.triggerDebounceInput("t");
    controller.triggerDebounceInput("est");
    assert.is(controller.getDebounceText(), "test");
    setTimeout(() => {
        controller.triggerDebounceInput("t");
        assert.is(controller.getDebounceText(), "t");
    }, 100);
});

choiceInputControllerSuite.run();
