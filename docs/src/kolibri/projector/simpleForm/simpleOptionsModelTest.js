import { TestSuite }    from "../../util/test.js";
import { SimpleOptionsModel } from "./simpleOptionsModel.js";

const optionsModelSuite = TestSuite("projector/simpleForm/optionsModel");

optionsModelSuite.add("full", assert => {
    const model = SimpleOptionsModel();
    assert.is(model.getList().length    , 0);
    assert.is(model.getObsList().count(), 0);

    // check observable functions
    /** @type { SimpleOptionType } */
    const val = { value: "test" };
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

optionsModelSuite.run();
