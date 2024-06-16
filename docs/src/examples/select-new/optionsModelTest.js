import { TestSuite }        from "../../kolibri/util/test.js";
import {
    OptionsModel,
    SelectedOptionModel,
    ValueOption,
    CategoryOption,
    nullOption,
}                           from "./optionsModel.js";

const optionsModelSuite = TestSuite("projector/simpleForm/optionsModel");

optionsModelSuite.add("Value option", (assert) => {
    const valueOption = ValueOption("value", "label");
    assert.is(valueOption.getValue(), "value");
    assert.is(valueOption.getLabel(), "label");

    // check undefined label
    const valueOption2 = ValueOption("value");
    assert.is(valueOption2.getValue(), "value");
    assert.is(valueOption2.getLabel(), "value");
    
    // id should be unique
    assert.is(valueOption.getId() !== valueOption2.getId(), true);
});

optionsModelSuite.add("Category option", (assert) => {
    const categoryOption = CategoryOption("label");
    assert.is(categoryOption.getValue(), "");
    assert.is(categoryOption.getLabel(), "label");
    
    // id should be unique over all types of options
    const valueOption = ValueOption("value");
    assert.is(categoryOption.getId() !== valueOption.getId(), true);
});

optionsModelSuite.add("Empty option", (assert) => {
    const resetOption = nullOption;
    assert.is(resetOption.getValue(), "");
    assert.is(resetOption.getLabel(), "");
    assert.is(resetOption.getId().includes("none"), true);
    
    // reset creates same null object option
    const resetOption2 = nullOption;
    assert.is(resetOption.getId() === resetOption2.getId(), true);
});

optionsModelSuite.add("Options model", (assert) => {
    const model = OptionsModel();
    assert.is(model.getList().length    , 0);
    assert.is(model.getObsList().count(), 0);

    // check observable add
    const val = ValueOption("test");
    model.getObsList().add(val);
    assert.is(model.getList().length    , 1);
    assert.is(model.getObsList().count(), 1);
    assert.is(model.getList()[0]        , val);

    // check referenced list
    const list = model.getList();
    list.push(val);
    assert.is(list.length           , 2);
    assert.is(model.getList().length, 1);

    // check observable delete
    model.getObsList().del(val);
    assert.is(model.getList().length    , 0);
    assert.is(model.getObsList().count(), 0);
});

optionsModelSuite.add("Selected option model", (assert) => {
    const noSelectionId = nullOption.getId();
    const model = SelectedOptionModel();
    assert.is(model.getSelectedOption().getId(), noSelectionId);

    // check setting new selection
    const val = ValueOption("value");
    model.setSelectedOption(val);
    assert.is(model.getSelectedOption()        , val);

    // check clearing selection
    model.clearSelectedOption();
    assert.is(model.getSelectedOption().getId(), noSelectionId);
});

optionsModelSuite.run();
