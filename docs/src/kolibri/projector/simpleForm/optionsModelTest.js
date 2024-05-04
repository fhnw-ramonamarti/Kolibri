import { TestSuite }                                from "../../util/test.js";
import { OptionsModel, Option, reset, noSelection } from "./optionsModel.js";

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

optionsModelSuite.add("Option", assert => {
    const option = Option("value", "label")();
    const option2 = Option("value2", "label2")(1);
    assert.is(option.getValue()  , "value");
    assert.is(option.getLabel()  , "label");
    assert.is(option.getColumn() , 0);
    assert.is(option2.getColumn(), 1);
    assert.is(option.getId() !== option2.getId(), true);
    
    // reset
    const resetOption = reset();
    assert.is(resetOption.getValue(), "");
    assert.is(resetOption.getLabel(), "");
    assert.is(resetOption.getColumn(), 0);
    assert.is(resetOption.getId().includes("none"), true);

    // no selection
    assert.is(noSelection.getValue(), resetOption.getValue());
    assert.is(noSelection.getLabel(), resetOption.getLabel());
    assert.is(noSelection.getColumn(), resetOption.getColumn());
});

optionsModelSuite.run();
