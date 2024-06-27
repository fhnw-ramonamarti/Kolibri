import { TestSuite }                                        from "../../kolibri/util/test.js";
import { projectColumnOptionsView, getHtmlElementByOption } from "./columnOptionsProjector.js";
import { OptionsController, SelectedOptionController }      from "./optionsController.js";
import { ValueOption, nullOption }                          from "./optionsModel.js";

const columnOptionsProjectorSuite = TestSuite("projector/simpleForm/columnOptionsProjector");

/**
 * The purpose of this binding spike is not to test all possible user interactions and their outcome 
 * but rather making sure that the view construction and the binding is properly set up.
 * Complex logic is to be tested against the controller (incl. model).
 */
columnOptionsProjectorSuite.add("binding-column-selection", (assert) => {
    // prepare
    const selectedOption           = ValueOption("selected value", "selected label");
    const option                   = ValueOption("option");
    const optionsController        = /** @type { OptionsControllerType } */ OptionsController();
    const selectedOptionController = SelectedOptionController();
    const cursorPositionController = SelectedOptionController();
    const [columnView]             = projectColumnOptionsView(
        optionsController,
        selectedOptionController,
        cursorPositionController,
        true
    );
    // console.log(columnView.innerHTML, columnView);

    // add options
    optionsController.addOption(/** @type { OptionType } */ selectedOption);
    optionsController.addOption(/** @type { OptionType } */ option);

    // get ui elements
    const selectedId      = selectedOption.getId().replace("\.", "-");
    const selectedElement = columnView.querySelector(`[data-id*="${selectedId}"]`);

    // test the binding
    assert.is(selectedOptionController.getSelectedOption().getId()   , nullOption.getId());
    selectedElement.click();
    assert.is(selectedOptionController.getSelectedOption().getValue(), selectedOption.getValue());

    // noinspection PointlessBooleanExpressionJS
    assert.is(null != selectedElement                       , true);
    assert.is(selectedElement.innerHTML                     , selectedOption.getLabel());
    assert.is(selectedElement.getAttribute("data-value")    , selectedOption.getValue());
    
    const optionWithId  = optionsController.getOptions()[0];
    const optionElement = getHtmlElementByOption(optionWithId, columnView);
    assert.is(optionElement?.getAttribute("data-value")     , optionWithId.getValue());
});

columnOptionsProjectorSuite.run();
