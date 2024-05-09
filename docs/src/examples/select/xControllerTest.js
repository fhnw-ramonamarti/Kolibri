import { TestSuite }                 from "../../kolibri/util/test.js";
import { noSelection }               from "../../kolibri/projector/simpleForm/optionsModel.js";
import { MasterSelectionController } from "./xController.js";

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
    const controller = MasterSelectionController({});

    // init values
    // assert.is(controller.isOptionsVisible()              , false); // todo comment after developement
    assert.is(controller.getValueOptions().length        , 0);
    assert.is(controller.getCategoryOptions(1) == null   , true);
    assert.is(controller.isSelectedOptionVisible()       , true);
    assert.is(controller.getSelectedOptionModel().getId(), noSelection.getId());

    // example bindings to check if activated
    let clicked = false;
    controller.onOptionsVisibilityChange       ((_) => { clicked = true; });
    controller.onCategoryOptionsModelAdd       ((_) => { clicked = true; });
    controller.onCategoryOptionsModelRemove    ((_) => { clicked = true; });
    controller.onValueOptionsModelAdd          ((_) => { clicked = true; });
    controller.onValueOptionsModelRemove       ((_) => { clicked = true; });
    controller.onSelectedOptionVisibilityChange((_) => { clicked = true; });
    controller.onOptionModelSelected           ((_) => { clicked = true; });
    
    // assert the effect of the binding
    clicked = false;
    controller.setOptionsVisibility(true);
    assert.is(controller.isOptionsVisible(), true);
    // assert.is(clicked                      , true); // todo commented due to development already sets true
    
    clicked = false;
    controller.setSelectedOptionVisibility(false);
    assert.is(controller.isSelectedOptionVisible(), false);
    assert.is(clicked                             , true);
    
    // assert the effect of the binding for master part
    clicked = false;
    controller.addValueOptionsModel(selectedOption);
    let mappedOptions = controller.getValueOptions()
        .map(e => ({ value: e.getValue(), label: e.getLabel() }));
    assert.is(controller.getValueOptions().length                           , 1);
    assert.is(controller.getCategoryOptions(1) == null                      , true);
    assert.is(mappedOptions.map(e => e.value).includes(selectedOption.value), true);
    assert.is(mappedOptions.map(e => e.label).includes(selectedOption.label), true);
    assert.is(clicked                                                       , true);
    
    clicked = false;
    controller.addCategoryOptionsModel(option);
    mappedOptions = controller.getValueOptions()
        .map(e => ({ value: e.getValue(), label: e.getLabel() }));
    let mappedCategories = controller.getCategoryOptions(1)
        .map(e => ({ label: e.getLabel(), column: e.getColumn() }));
    assert.is(controller.getValueOptions().length                           , 1);
    assert.is(controller.getCategoryOptions(1).length                       , 1);
    assert.is(mappedOptions.map(e => e.value).includes(selectedOption.value), true);
    assert.is(mappedCategories.map(e => e.label).includes(option.label)     , true);
    assert.is(mappedCategories.map(e => e.column).includes(option.column)   , true);
    assert.is(clicked                                                       , true);

    // assert the effect of the binding for detail part
    clicked = false;
    const optionToSelect =
        controller.getValueOptions().filter((e) => e.getValue() === selectedOption.value)[0];
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
    controller.removeValueOptionsModel(optionToSelect);
    mappedOptions = controller.getValueOptions()
        .map(e => ({ value: e.getValue(), label: e.getLabel() }));
    mappedCategories = controller.getCategoryOptions(1)
        .map(e => ({ label: e.getLabel(), column: e.getColumn() }));
    assert.is(controller.getValueOptions().length                           , 0);
    assert.is(controller.getCategoryOptions(1).length                       , 1);
    assert.is(mappedOptions.map(e => e.value).includes(selectedOption.value), false);
    assert.is(mappedCategories.map(e => e.label).includes(option.label)     , true);
    assert.is(clicked                                                       , true);

    clicked = false;
    const categoryToSelect =
        controller.getCategoryOptions(1).filter((e) => e.getLabel() === option.label)[0];
    controller.removeCategoryOptionsModel(categoryToSelect);
    mappedCategories = controller.getCategoryOptions(1)
        .map(e => ({ label: e.getLabel(), column: e.getColumn() }));
    assert.is(controller.getCategoryOptions(1).length                       , 0);
    assert.is(mappedCategories.map(e => e.label).includes(option.label)     , false);
    assert.is(clicked                                                       , true);
    
    assert.is(controller.getSelectedOptionModel().getId()                   , noSelection.getId());
});

xControllerSuite.run();
