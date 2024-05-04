import { TestSuite }                                                       from "../../kolibri/util/test.js";
import { ListAndSelectionController, ListController, SelectionController } from "./xController.js";
import { Option, noSelection }                                             from "../../kolibri/projector/simpleForm/optionsModel.js";

const xControllerSuite = TestSuite("examples/select/xController");

xControllerSuite.add("full", assert => {
    // prepare
    const option = Option("value", "label")();
    const selectedOption = Option("selecte value", "selected label")();
    const masterController = ListController();
    const detailController = SelectionController(noSelection);
    const controller = ListAndSelectionController(masterController, detailController);

    // init values
    // assert.is(controller.isVisible()             , false); // todo comment after developement
    assert.is(controller.getMasterList().length  , 0);
    assert.is(controller.getSelectedDetailModel(), noSelection);
    
    // example bindings to check if activated
    let clicked = false;
    controller.onVisibleChange       ((val) => {clicked = true;console.log("test");});
    controller.onDetailModelSelected ((val) => {clicked = true;});
    controller.onMasterModelAdd      ((val) => {clicked = true;});
    controller.onMasterModelRemove   ((val) => {clicked = true;});
    
    // assert the effect of the binding
    clicked = false;
    controller.setVisible(true);
    assert.is(controller.isVisible(), true);
    // assert.is(clicked               , true); // todo not wotking why ??

    // assert the effect of the binding for detail part
    clicked = false;
    controller.setSelectedDetailModel(selectedOption);
    assert.is(controller.getSelectedDetailModel(), selectedOption);
    assert.is(clicked                            , true);

    clicked = false;
    controller.clearDetailSelection();
    assert.is(controller.getSelectedDetailModel(), noSelection);
    assert.is(clicked                            , true);

    // assert the effect of the binding for master part
    clicked = false;
    controller.addMasterModel(option);
    assert.is(controller.getMasterList().length          , 1);
    assert.is(controller.getMasterList().includes(option), true);
    assert.is(clicked                                    , true);
    
    controller.addMasterModel(selectedOption);
    assert.is(controller.getMasterList().length                  , 2);
    assert.is(controller.getMasterList().includes(option)        , true);
    assert.is(controller.getMasterList().includes(selectedOption), true);

    clicked = false;
    controller.removeMasterModel(option);
    assert.is(controller.getMasterList().length                  , 1);
    assert.is(controller.getMasterList().includes(option)        , false);
    assert.is(controller.getMasterList().includes(selectedOption), true);
    assert.is(clicked                                            , true);
});

xControllerSuite.run();
