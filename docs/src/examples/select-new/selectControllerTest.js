import { TestSuite }            from "../../kolibri/util/test.js";
import { 
    ValueOption,
    CategoryOption,
    nullOption
}                               from "./optionsModel.js";
import { SelectController }     from "./selectController.js";

const selectControllerSuite = TestSuite("projector/simpleForm/selectController");

selectControllerSuite.add("Select controller - 1 column", (assert) => {
    const noSelectionId   = nullOption.getId();
    const selectAttribute = { name: "Name", label: "Label" };
    const controller      = SelectController(selectAttribute);
    const controller2     = SelectController({});
    assert.is(controller.getNumberOfColumns()            , 1);
    assert.is(controller.isOptionsVisible()              , false);
    assert.is(controller.isSelectedOptionVisible()       , true);
    assert.is(controller.getSelectedValueOption().getId(), noSelectionId);
    assert.is(controller.getId() !== controller2.getId() , true);

    const val = /** @type { OptionType } */ ValueOption("test");
    controller.getColumnOptionsComponent(0).addOptions([val]);
    assert.is(controller.getSelectedValueOption().getId(), noSelectionId);
    
    controller.setSelectedValueOption(val);
    assert.is(controller.getSelectedValueOption().getId(), val.getId());

    controller.clearSelectedValueOption();
    assert.is(controller.getSelectedValueOption().getId(), noSelectionId);

    controller.setSelectedValueOption(val);
    controller.getColumnOptionsComponent(0).delOptions([val]);
    assert.is(controller.getSelectedValueOption().getId(), val.getId());
});

selectControllerSuite.add("Select controller - 2 column", (assert) => {
    const noSelectionId   = nullOption.getId();
    const selectAttribute = { name: "Name", label: "Label", numberOfColumns: 2 };
    const controller      = SelectController(selectAttribute);
    assert.is(controller.getNumberOfColumns(), 2);

    // check select not existing/ contained option
    const val = /** @type { OptionType } */ ValueOption("test");
    const cat = /** @type { OptionType } */ CategoryOption("test");
    controller.getColumnOptionsComponent(0).addOptions([val]);
    controller.getColumnOptionsComponent(1).addOptions([cat]);
    controller.getColumnOptionsComponent(1).setSelectedOption(cat);
    assert.is(controller.getSelectedValueOption().getId()                        , noSelectionId);
    assert.is(controller.getColumnOptionsComponent(1).getSelectedOption().getId(), cat.getId());

    controller.setSelectedValueOption(val);
    controller.getColumnOptionsComponent(1).clearSelectedOption();
    assert.is(controller.getSelectedValueOption().getId()                        , val.getId());
    assert.is(controller.getColumnOptionsComponent(1).getSelectedOption().getId(), noSelectionId);

    controller.getColumnOptionsComponent(1).setSelectedOption(cat);
    controller.clearSelectedValueOption();
    assert.is(controller.getSelectedValueOption().getId()                        , noSelectionId);
    assert.is(controller.getColumnOptionsComponent(1).getSelectedOption().getId(), cat.getId());

    controller.setSelectedValueOption(cat);
    controller.getColumnOptionsComponent(1).delOptions([cat]);
    assert.is(controller.getColumnOptionsComponent(1).getSelectedOption().getId(), cat.getId());
});

selectControllerSuite.add("Select controller - required", (assert) => {
    const selectAttribute = { name: "Name", label: "Label", isRequired: true };
    const controller      = SelectController(selectAttribute);
    let isValid           = false;

    // set validity on change
    controller.getInputController().onValidChanged(valid => {
        isValid = valid;
    });

    // initial
    assert.is(controller.isRequired(), true);
    assert.is(isValid,                 false);

    // prepare column with option
    const val = /** @type { OptionType } */ ValueOption("test");
    controller.getColumnOptionsComponent(0).addOptions([val]);
    
    // set valid option
    controller.getColumnOptionsComponent(0).setSelectedOption(val);
    assert.is(isValid,                true);
    
    // clear selection
    controller.getColumnOptionsComponent(0).clearSelectedOption();
    assert.is(isValid,                false);
});

selectControllerSuite.add("Select controller - disabled", (assert) => {
    const noSelectionId   = nullOption.getId();
    const selectAttribute = { name: "Name", label: "Label", isDisabled: true };
    const controller      = SelectController(selectAttribute);

    // initial
    assert.is(controller.isDisabled()                         , true);
    assert.is(controller.getSelectedValueOption().getId()     , noSelectionId);

    // prepare column with option
    const val  = /** @type { OptionType } */ ValueOption("test");
    const val2 = /** @type { OptionType } */ ValueOption("test2");
    controller.getColumnOptionsComponent(0).addOptions([val, val2]);

    // set value over controller still works
    controller.getColumnOptionsComponent(0).setSelectedOption(val);
    assert.is(controller.getSelectedValueOption().getId()     , noSelectionId);
    
    // enable select controller
    controller.setDisabled(false);
    assert.is(controller.isDisabled()                         , false);

    // selection works
    controller.getColumnOptionsComponent(0).setSelectedOption(val2);
    assert.is(controller.getSelectedValueOption().equals(val2), true);
});

selectControllerSuite.run();
