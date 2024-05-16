import { TestSuite }            from "../../kolibri/util/test.js";
import {
    OptionsController,
    SelectedOptionController
}                               from "./optionsController.js";
import { 
    ValueOption,
    reset
}                               from "./optionsModel.js";

const optionsControllerSuite = TestSuite("projector/simpleForm/optionsController");

optionsControllerSuite.add("Options controller", (assert) => {
    const controller = OptionsController();
    assert.is(controller.getOptions().length, 0);

    // check observable add
    const val = ValueOption("test");
    controller.addOption(val);
    assert.is(controller.getOptions().length, 1);
    assert.is(controller.getOptions()[0]    , val);

    // check adding duplicates
    controller.addOption(val);
    assert.is(controller.getOptions().length, 1);

    // check observable delete
    controller.delOption(val);
    assert.is(controller.getOptions().length, 0);
});

optionsControllerSuite.add("Selected option controller", (assert) => {
    const noSelectionId = reset().getId();
    const controller = SelectedOptionController();
    assert.is(controller.getSelectedOption().getId(), noSelectionId);

    // check setting new selection
    const val = ValueOption("value");
    controller.setSelectedOption(val);
    assert.is(controller.getSelectedOption()        , val);

    // check clearing selection
    controller.clearSelectedOption();
    assert.is(controller.getSelectedOption().getId(), noSelectionId);
});

optionsControllerSuite.run();
