import { SimpleAttributeInputController } from "../../kolibri/projector/simpleForm/simpleInputController.js";
import { SimpleInputModel }               from "../../kolibri/projector/simpleForm/simpleInputModel.js";
import { InputProjector }                 from "../../kolibri/projector/simpleForm/simpleInputProjector.js";

export { projectOptionsView, projectSelectedValueOptionView, projectSelectViews, pageCss };

/** @private */
const selectClassName = "select-component";

/** @private */
const inputComponentClassName = "select-input-component";

/** @private */
const optionsClassName = "options-component";

/** @private */
const selectedOptionClassName = "selected-option-component";

/**
 *
 * @param { SelectControllerType } selectController
 * @return { [HTMLDivElement] } - options view
 */
const projectOptionsView = (selectController) => {
    const optionsContainer = document.createElement("div");
    optionsContainer.id = selectController.getId() + "-options";
    optionsContainer.classList.add(optionsClassName);

    [...Array(selectController.getNumberColumns()).keys()].reverse().forEach((colIndex) => {
        const column = selectController.getColumnOptionsComponent(colIndex).getColumnView();
        optionsContainer.append(...column);
    });

    return [optionsContainer];
};

/**
 *
 * @param { SelectControllerType } selectController
 * @return { [HTMLDivElement] } - selected option view
 */
const projectSelectedValueOptionView = (selectController) => {
    const selectedOptionContainer = document.createElement("div");
    selectedOptionContainer.id = selectController.getId() + "-selected-option";
    selectedOptionContainer.classList.add(selectedOptionClassName);
    selectedOptionContainer.innerHTML = selectController.getSelectedValueOption().getLabel();
    return [selectedOptionContainer];
};

/**
 *
 * @param { SelectControllerType } selectController
 * @return { [HTMLDivElement, HTMLDivElement] } - combined views
 */
const projectSelectViews = (selectController) => {
    const allOptions       = projectOptionsView(selectController);
    const selectedOption   = projectSelectedValueOptionView(selectController);

    const rootElement = document.createElement('div');
    rootElement.classList.add(selectClassName);

    const componentContainer = document.createElement('div');
    componentContainer.classList.add(inputComponentClassName);
    componentContainer.append(...selectedOption);
    componentContainer.append(...allOptions);

    // input and label
    const simpleInputStructure = SimpleInputModel({
        label: selectController.getLabel(),
        value: selectController.getSelectedValueOption().getValue(),
        name: selectController.getName(),
        type: "hidden",
    });
    const inputController = SimpleAttributeInputController(simpleInputStructure);
    const [labelElement, inputSpan] = InputProjector.projectInstantInput(
        inputController,
        selectedOptionClassName
    );
    const inputElement = inputSpan.firstChild;
    rootElement.append(labelElement);
    rootElement.append(inputElement);
    rootElement.append(componentContainer);

    return [rootElement, selectedOption];
};


/** 
 * Height of the master list box
 * @private
 */
const boxHeight = 240;

/**
 * CSS snippet to append to the head style when using the instant update projector.
 * @type { String }
 * @example
 * document.querySelector("head style").textContent += pageCss;
 */
const pageCss = `
    .${optionsClassName} {
        display:        flex;
        gap:            5px;
        align-items:    baseline;
        margin-bottom:  0.5em;
        width:          100%;
        max-height:     ${boxHeight}px;
        border-radius:  0 0 4px 4px;
        border-top:     1px solid #ccc; /* todo */
    }
    .${selectedOptionClassName} {
        position:       relative;
        display:        flex;
        align-items:    center;
        padding:        0.5em;
        width:          100%;
        height:         2rem;
    }
    .${inputComponentClassName} {
        border:         1px solid #ccc; /* todo */
    }
`;
