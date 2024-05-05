import { TestSuite }                                                       from "../../kolibri/util/test.js";
import { ListAndSelectionController, ListController, SelectionController } from "./xController.js";
import { Option, noSelection }                                             from "../../kolibri/projector/simpleForm/optionsModel.js";

const xControllerSuite = TestSuite("examples/select/xController");

xControllerSuite.add("full", assert => {
    // prepare
    const option = { 
        label: "label", 
        column: 1 
    };
    const selectedOption = {
        value: "selected value", 
        label: "selected label",
    };
    const masterController = ListController();
    const detailController = SelectionController(noSelection);
    const controller = ListAndSelectionController(masterController, detailController);

    // init values
    // assert.is(controller.isVisible()             , false); // todo comment after developement
    assert.is(controller.getMasterList().length  , 0);
    assert.is(controller.getSelectedDetailModel(), noSelection);
    
    // example bindings to check if activated
    let clicked = false;
    controller.onVisibleChange       ((_) => { clicked = true; });
    controller.onDetailModelSelected ((_) => { clicked = true; });
    controller.onMasterModelAdd      ((_) => { clicked = true; });
    controller.onMasterModelRemove   ((_) => { clicked = true; });
    
    // assert the effect of the binding
    clicked = false;
    controller.setVisible(true);
    assert.is(controller.isVisible(), true);
    // assert.is(clicked               , true); // todo commented due to development already sets true
    
    // assert the effect of the binding for master part
    clicked = false;
    controller.addMasterValueModel(selectedOption);
    let mappedOptions = controller.getMasterList()
        .map(e => ({ value: e.getValue(), label: e.getLabel() }));
    assert.is(controller.getMasterList().length                             , 1);
    assert.is(mappedOptions.map(e => e.value).includes(selectedOption.value), true);
    assert.is(mappedOptions.map(e => e.label).includes(selectedOption.label), true);
    assert.is(clicked                                                       , true);
    
    clicked = false;
    controller.addMasterCategoryModel(option);
    mappedOptions = controller.getMasterList()
        .map(e => ({ value: e.getValue(), label: e.getLabel() }));
    let mappedCategories = controller.getMasterList()
        .map(e => ({ label: e.getLabel(), column: e.getColumn() }));
    assert.is(controller.getMasterList().length                             , 2);
    assert.is(mappedOptions.map(e => e.value).includes(selectedOption.value), true);
    assert.is(mappedCategories.map(e => e.label).includes(option.label)     , true);
    assert.is(mappedCategories.map(e => e.column).includes(option.column)   , true);
    assert.is(clicked                                                       , true);

    // assert the effect of the binding for detail part
    clicked = false;
    const optionToSelect =
        controller.getMasterList().filter((e) => e.getValue() === selectedOption.value)[0];
    controller.setSelectedDetailModel(optionToSelect);
    assert.is(controller.getSelectedDetailModel().getValue(), selectedOption.value);
    assert.is(controller.getSelectedDetailModel().getLabel(), selectedOption.label);
    assert.is(clicked                                       , true);

    clicked = false;
    controller.clearDetailSelection();
    assert.is(controller.getSelectedDetailModel(), noSelection);
    assert.is(clicked                            , true);

    // assert the effect of the binding for master part remove
    clicked = false;
    controller.setSelectedDetailModel(optionToSelect);
    controller.removeMasterModel(optionToSelect);
    mappedOptions = controller.getMasterList()
        .map(e => ({ value: e.getValue(), label: e.getLabel() }));
    mappedCategories = controller.getMasterList()
        .map(e => ({ label: e.getLabel(), column: e.getColumn() }));
    assert.is(controller.getMasterList().length                             , 1);
    assert.is(mappedOptions.map(e => e.value).includes(selectedOption.value), false);
    assert.is(mappedCategories.map(e => e.label).includes(option.label)     , true);
    assert.is(clicked                                                       , true);
    
    assert.is(controller.getSelectedDetailModel()                           , noSelection);
});

xControllerSuite.run();
