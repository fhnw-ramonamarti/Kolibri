import { TestSuite }            from "../../kolibri/util/test.js";
import { 
    ValueOption,
    CategoryOption,
    reset
}                               from "./optionsModel.js";
import { SelectController }     from "./selectController.js";

const selectControllerSuite = TestSuite("projector/simpleForm/selectController");

selectControllerSuite.add("Select controller - 1 column", (assert) => {
    const noSelectionId = reset().getId();
    const selectAttribute = {name: "Name", label: "Label"}
    const controller = SelectController(selectAttribute);
    const controller2 = SelectController({});
    assert.is(controller.getNumberColumns()              , 1);
    assert.is(controller.isOptionsVisible()              , false);
    assert.is(controller.isSelectedOptionVisible()       , true);
    assert.is(controller.getSelectedValueOption().getId(), noSelectionId);
    assert.is(controller.getLabel()                      , "Label");
    assert.is(controller.getName()                       , "Name");
    assert.is(controller.getId() !== controller2.getId() , true);
    assert.is(controller2.getLabel()                     , "");
    assert.is(controller2.getName()                      , "");

    const val = ValueOption("test");
    controller.getColumnOptionsComponent(0).addOption(val);
    assert.is(controller.getSelectedValueOption().getId(), noSelectionId);
    
    controller.setSelectedValueOption(val);
    assert.is(controller.getSelectedValueOption().getId(), val.getId());

    controller.clearSelectedValueOption();
    assert.is(controller.getSelectedValueOption().getId(), noSelectionId);

    controller.setSelectedValueOption(val);
    controller.getColumnOptionsComponent(0).delOption(val);
    assert.is(controller.getSelectedValueOption().getId(), val.getId());
});

selectControllerSuite.add("Select controller - 2 column", (assert) => { // todo
    const noSelectionId = reset().getId();
    const selectAttribute = {name: "Name", label: "Label", numberColumns: 2}
    const controller = SelectController(selectAttribute);
    assert.is(controller.getNumberColumns(), 2);

    // check select not existing/ contained option
    const val = ValueOption("test");
    const cat = CategoryOption("test");
    controller.getColumnOptionsComponent(0).addOption(val);
    controller.getColumnOptionsComponent(1).addOption(cat);
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
    controller.getColumnOptionsComponent(1).delOption(cat);
    assert.is(controller.getColumnOptionsComponent(1).getSelectedOption().getId(), cat.getId());
});

selectControllerSuite.run();
