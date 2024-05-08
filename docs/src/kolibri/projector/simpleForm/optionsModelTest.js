import { TestSuite }                                from "../../util/test.js";
import { OptionsModel, reset, noSelection, ValueOption, CategoryOption } from "./optionsModel.js";

const optionsModelSuite = TestSuite("projector/simpleForm/optionsModel");

optionsModelSuite.add("full", assert => {
    const model = OptionsModel();
    assert.is(model.getList().length    , 0);
    assert.is(model.getObsList().count(), 0);
    
    // check observable functions
    const val = "test";
    model.getObsList().add(val);
    assert.is(model.getList().length    , 1);
    assert.is(model.getObsList().count(), 1);
    assert.is(model.getList()[0] === val, true);

    // check list
    const list = model.getList();
    list.push(val);
    assert.is(list.length           , 2);
    assert.is(model.getList().length, 1);
});

optionsModelSuite.add("Empty options", assert => {
    
    // reset
    const resetOption = reset();
    assert.is(resetOption.getValue()              , "");
    assert.is(resetOption.getLabel()              , "");
    assert.is(resetOption.getColumn()             , 0);
    assert.is(resetOption.getId().includes("none"), true);

    // no selection
    assert.is(noSelection.getValue() , resetOption.getValue());
    assert.is(noSelection.getLabel() , resetOption.getLabel());
    assert.is(noSelection.getColumn(), resetOption.getColumn());
});

optionsModelSuite.add("Option types", assert => {
    const valueOption = ValueOption("value", "label");
    assert.is(valueOption.getValue() , "value");
    assert.is(valueOption.getLabel() , "label");
    assert.is(valueOption.getColumn(), 0);

    const categoryOption = CategoryOption("label", 1);
    assert.is(categoryOption.getValue() , "");
    assert.is(categoryOption.getLabel() , "label");
    assert.is(categoryOption.getColumn(), 1);
});

optionsModelSuite.run();
