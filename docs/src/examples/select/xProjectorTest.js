import { TestSuite }                                          from "../../kolibri/util/test.js";
import { noSelection }                                        from "../../kolibri/projector/simpleForm/optionsModel.js";
import { projectSelectedValueOptionView, projectOptionsView } from "./xProjector.js";
import { MasterSelectionController }                          from "./xController.js";

const xProjectorSuite = TestSuite("examples/select/xProjector");

/**
 * The purpose of this binding spike is not to test all possible user interactions and their outcome but rather
 * making sure that the view construction and the binding is properly set up.
 * Complex logic is to be tested against the controller (incl. model).
 */
xProjectorSuite.add("binding-master", (assert) => {
    // prepare
    const option = {
        label: "label",
        column: 1
    };
    const selectedOption = {
        value: "selected value",
        label: "selected label"
    };
    const controller = MasterSelectionController({});
    
    const [masterContainer] = projectOptionsView(controller);
    controller.addValueOptionsModel(selectedOption);
    controller.addCategoryOptionsModel(option);
    const optionElement     = masterContainer.querySelector(`[data-value="${selectedOption.value}"]`);

    const [viewContainer] = projectSelectedValueOptionView(controller, masterContainer);
    const labelElement    = viewContainer.querySelector("label");
    const inputElement    = viewContainer.querySelector("input");

    // for later when label comes
    // assert.is(labelElement.getAttribute("for"),     inputElement.getAttribute("id"));
    // assert.is(spanElement .getAttribute("data-id"), inputElement.getAttribute("id"));

    // test the binding
    assert.is(controller.getSelectedOptionModel(), noSelection);
    assert.is(inputElement.value                 , noSelection.getValue());
    optionElement.click();
    assert.is(controller.getSelectedOptionModel().getValue(), selectedOption.value);
    assert.is(inputElement.value                            , selectedOption.value);
});

xProjectorSuite.run();
