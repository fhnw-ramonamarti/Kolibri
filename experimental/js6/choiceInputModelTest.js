import { TestSuite } from "../../docs/src/kolibri/util/test.js";
import { ChoiceDetailModel, ChoiceMasterModel } from "./choiceInputModel.js";
import {
    VALUE,
    VALID,
    EDITABLE,
    LABEL,
    NAME,
    PLACEHOLDER,
    LIST_ELEMENTS,
    FOCUS_ELEMENT,
    DEBOUNCE_TEXT,
    CHOICEBOX_OPEN,
} from "../../docs/src/kolibri/presentationModel.js";

const choiceInputModelSuite = TestSuite("experimental/js6/choiceInputModel");
// const choiceInputModelSuite = TestSuite("projector/choiceInput/choiceInputModel");

// detail model tests
choiceInputModelSuite.add("full-detail", (assert) => {
    const model = ChoiceDetailModel({
        value: "Switzerland",
        placeholder: "Choose a country",
        label: "Country",
        name: "country",
    });
    assert.is(model.hasObs(VALUE), true);
    assert.is(model.hasObs(NAME), true);
    assert.is(model.hasObs(LABEL), true);
    assert.is(model.hasObs(VALID), true);
    assert.is(model.hasObs(PLACEHOLDER), true);
    assert.is(model.hasObs(EDITABLE), true);
});

choiceInputModelSuite.add("slim-detail", (assert) => {
    const model = ChoiceDetailModel({});
    assert.is(model.hasObs(VALUE), true);
    assert.is(model.hasObs(EDITABLE), true);
    assert.is(model.hasObs(NAME), false); // when name  is not given, no observable is created at construction time
    assert.is(model.hasObs(LABEL), false); // when label is not given, no observable is created at construction time
    assert.is(model.hasObs(PLACEHOLDER), false); // when placeholder is not given, no observable is created at construction time
});

// master model tests
choiceInputModelSuite.add("full-master", (assert) => {
    const model = ChoiceMasterModel({
        elementList: [
            { country: "Switzerland", continent: "Europe" },
            { country: "United States", continent: "North America" },
            { country: "Germany", continent: "Europe" },
        ],
        sectionElement: { continent: "All" },
        focusObject: { column: 1, value: "Germany" },
    });
    assert.is(model.hasObs(VALUE), true);
    assert.is(model.hasObs(LIST_ELEMENTS), true);
    assert.is(model.hasObs(FOCUS_ELEMENT), true);
    assert.is(model.hasObs(EDITABLE), true); // constructed with default value
    assert.is(model.hasObs(CHOICEBOX_OPEN), true); // constructed with default value
    assert.is(model.hasObs(DEBOUNCE_TEXT), true); // constructed with default value
});

choiceInputModelSuite.add("slim-master", (assert) => {
    const model = ChoiceMasterModel({
        elementList: [
            { country: "Switzerland", continent: "Europe" },
            { country: "United States", continent: "North America" },
            { country: "Germany", continent: "Europe" },
        ],
    });
    assert.is(model.hasObs(VALUE), true);
    assert.is(model.hasObs(LIST_ELEMENTS), true);
    assert.is(model.hasObs(FOCUS_ELEMENT), false); // when focus object is not given, no observable is created at construction time
});

choiceInputModelSuite.run();
