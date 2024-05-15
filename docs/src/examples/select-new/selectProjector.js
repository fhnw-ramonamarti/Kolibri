export { projectOptionsView, projectSelectedValueOptionView, pageCss };

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
`;
