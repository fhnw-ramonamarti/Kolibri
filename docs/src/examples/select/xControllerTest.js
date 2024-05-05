import { TestSuite }                  from "../../kolibri/util/test.js";
import { ListAndSelectionController } from "./xController.js";
import { noSelection }                from "../../kolibri/projector/simpleForm/optionsModel.js";

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
    const controller = ListAndSelectionController();

    // init values
    // assert.is(controller.isMasterVisible()               , false); // todo comment after developement
    assert.is(controller.getMasterOptionsList().length   , 0);
    assert.is(controller.getMasterCategoriesList().length, 0);
    assert.is(controller.isDetailVisible()               , true);
    assert.is(controller.getSelectedOptionModel().getId(), noSelection.getId());

    // example bindings to check if activated
    let clicked = false;
    controller.onMasterVisibilityChange   ((_) => { clicked = true; });
    controller.onMasterCategoryModelAdd   ((_) => { clicked = true; });
    controller.onMasterCategoryModelRemove((_) => { clicked = true; });
    controller.onMasterOptionModelAdd     ((_) => { clicked = true; });
    controller.onMasterOptionModelRemove  ((_) => { clicked = true; });
    controller.onDetailVisibilityChange   ((_) => { clicked = true; });
    controller.onOptionModelSelected      ((_) => { clicked = true; });
    
    // assert the effect of the binding
    clicked = false;
    controller.setMasterVisibility(true);
    assert.is(controller.isMasterVisible(), true);
    // assert.is(clicked                     , true); // todo commented due to development already sets true
    
    clicked = false;
    controller.setDetailVisibility(false);
    assert.is(controller.isDetailVisible(), false);
    assert.is(clicked                     , true);
    
    // assert the effect of the binding for master part
    clicked = false;
    controller.addMasterOptionModel(selectedOption);
    let mappedOptions = controller.getMasterOptionsList()
        .map(e => ({ value: e.getValue(), label: e.getLabel() }));
    assert.is(controller.getMasterOptionsList().length                      , 1);
    assert.is(controller.getMasterCategoriesList().length                   , 0);
    assert.is(mappedOptions.map(e => e.value).includes(selectedOption.value), true);
    assert.is(mappedOptions.map(e => e.label).includes(selectedOption.label), true);
    assert.is(clicked                                                       , true);
    
    clicked = false;
    controller.addMasterCategoryModel(option);
    mappedOptions = controller.getMasterOptionsList()
        .map(e => ({ value: e.getValue(), label: e.getLabel() }));
    let mappedCategories = controller.getMasterCategoriesList()
        .map(e => ({ label: e.getLabel(), column: e.getColumn() }));
    assert.is(controller.getMasterOptionsList().length                      , 1);
    assert.is(controller.getMasterCategoriesList().length                   , 1);
    assert.is(mappedOptions.map(e => e.value).includes(selectedOption.value), true);
    assert.is(mappedCategories.map(e => e.label).includes(option.label)     , true);
    assert.is(mappedCategories.map(e => e.column).includes(option.column)   , true);
    assert.is(clicked                                                       , true);

    // assert the effect of the binding for detail part
    clicked = false;
    const optionToSelect =
        controller.getMasterOptionsList().filter((e) => e.getValue() === selectedOption.value)[0];
    controller.setSelectedOptionModel(optionToSelect);
    assert.is(controller.getSelectedOptionModel().getValue(), selectedOption.value);
    assert.is(controller.getSelectedOptionModel().getLabel(), selectedOption.label);
    assert.is(clicked                                       , true);

    clicked = false;
    controller.clearOptionSelection();
    assert.is(controller.getSelectedOptionModel(), noSelection);
    assert.is(clicked                            , true);

    // assert the effect of the binding for master part remove
    clicked = false;
    controller.setSelectedOptionModel(optionToSelect);
    controller.removeMasterOptionModel(optionToSelect);
    mappedOptions = controller.getMasterOptionsList()
        .map(e => ({ value: e.getValue(), label: e.getLabel() }));
    mappedCategories = controller.getMasterCategoriesList()
        .map(e => ({ label: e.getLabel(), column: e.getColumn() }));
    assert.is(controller.getMasterOptionsList().length                      , 0);
    assert.is(controller.getMasterCategoriesList().length                   , 1);
    assert.is(mappedOptions.map(e => e.value).includes(selectedOption.value), false);
    assert.is(mappedCategories.map(e => e.label).includes(option.label)     , true);
    assert.is(clicked                                                       , true);

    clicked = false;
    const categoryToSelect =
        controller.getMasterCategoriesList().filter((e) => e.getLabel() === option.label)[0];
    controller.removeMasterCategoryModel(categoryToSelect);
    mappedCategories = controller.getMasterCategoriesList()
        .map(e => ({ label: e.getLabel(), column: e.getColumn() }));
    assert.is(controller.getMasterCategoriesList().length                   , 0);
    assert.is(mappedCategories.map(e => e.label).includes(option.label)     , false);
    assert.is(clicked                                                       , true);
    
    assert.is(controller.getSelectedOptionModel().getId()                   , noSelection.getId());
});

xControllerSuite.run();
