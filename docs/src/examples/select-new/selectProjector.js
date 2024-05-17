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
 * Create the options view of the select, bind against the controller, and return the view.
 * @param { SelectControllerType } selectController
 * @return { [HTMLDivElement] } - options view
 */
const projectOptionsView = (selectController) => {
    const optionsContainer = document.createElement("div");
    optionsContainer.id = selectController.getId() + "-options";
    optionsContainer.classList.add(optionsClassName);
    optionsContainer.setAttribute(
        "style",
        "z-index:" + Math.max(50, 90 - Number(selectController.getId().replace(/\D*/, "")))
    );

    [...Array(selectController.getNumberColumns()).keys()].reverse().forEach((col) => {
        const column = selectController.getColumnOptionsComponent(col).getColumnView();
        optionsContainer.append(...column);
    });

    return [optionsContainer];
};

/**
 * Create the selected option view of the select, bind against the controller, and return the view.
 * @param { SelectControllerType } selectController
 * @return { [HTMLDivElement, HTMLDivElement, HTMLButtonElement] } - selected option view
 */
const projectSelectedValueOptionView = (selectController) => {
    const rootElement = document.createElement("div");
    rootElement.classList.add(selectedOptionClassName);
    rootElement.id = selectController.getId() + "-selected-option";
    
    const selectedOptionContainer = document.createElement("div");
    selectedOptionContainer.classList.add("toggleButton");
    selectedOptionContainer.classList.add("selected-value");
    selectedOptionContainer.innerHTML = selectController.getSelectedValueOption().getLabel();
    selectedOptionContainer.onclick = (_) => {
        selectController.setOptionsVisibility(!selectController.isOptionsVisible());
    };
    rootElement.append(selectedOptionContainer);

    const clearButton = document.createElement("button");
    clearButton.classList.add("clearButton");
    clearButton.classList.add("clear");
    clearButton.innerHTML  = "&times;";
    clearButton.onclick = () => {
        selectController.clearSelectedValueOption();
    };
    rootElement.append(clearButton);

    const toggleButton = document.createElement("button");
    toggleButton.classList.add("toggleButton");
    toggleButton.innerHTML  = "&varr;";
    toggleButton.onclick = (_) => {
        selectController.setOptionsVisibility(!selectController.isOptionsVisible());
    };
    rootElement.append(toggleButton);

    return [rootElement, selectedOptionContainer, toggleButton];
};

/**
 * Combine the options view and selected option view, and return the combined view.
 * For the html form a hidden input element is added to the combined view.
 * @param { SelectControllerType } selectController
 * @return { [HTMLDivElement, HTMLDivElement] } - combined views
 */
const projectSelectViews = (selectController) => {
    const allOptionsElement = projectOptionsView(selectController);
    const [selectedOptionElement, selectedOptionLabelElement, toggleButton] =
        projectSelectedValueOptionView(selectController);

    const rootElement = document.createElement('div'); // baseline 2024 popover api (dialog show-modal element)
    rootElement.classList.add(selectClassName);

    const componentContainer = document.createElement('div');
    componentContainer.classList.add(inputComponentClassName);
    componentContainer.append(selectedOptionElement);
    componentContainer.append(...allOptionsElement);

    // input and label - // todo think about moving input controller to component or select controller
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
    const inputElement = inputSpan.querySelector("input");
    rootElement.append(labelElement);
    rootElement.append(inputElement);
    rootElement.append(componentContainer);

    selectController.onOptionsVisibilityChange(value => {
        allOptionsElement[0].classList.toggle("hidden", !value);
        selectedOptionElement.classList.toggle("opened", value);
        // toggleButton.innerHTML = value ? "^" : "v";
    });

    return [rootElement, selectedOptionLabelElement];
};


/** 
 * Height of the master list box
 * @private
 */
const boxHeight = 240;

/**
 * CSS snippet to append to the head style when using the select component.
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
        border:         1px solid #ccc; /* todo */
        position:       absolute;
        left:           0;
        background:     #fff;
        z-index:        50;
        overflow:       hidden;
    }
    .${selectedOptionClassName} {
        position:       relative;
        display:        flex;
        align-items:    center;
        padding:        0.5em;
        width:          100%;
        height:         2rem;

        .selected-value {
            width:      100%;
        }

        .clear {
            color:              var(--kolibri-color-accent);
        }
        
        button.toggleButton, 
        .clear {
            background-color:   transparent;
            border:             none;
            font-size:          1.3em;
        }

        img {
            max-height: 100%;
            max-width:  100%;
            object-fit: contain;
        }
    }
    .${inputComponentClassName} {
        border:         1px solid #ccc; /* todo */
        border-radius:  4px;
        
        &.opened {
            border-radius: 4px 4px 0 0;
        }
    }
    .${selectClassName} {
        position:       relative;
        
        .selected-value {
            min-height: 2rem;
            display:    flex;
            gap:        0.5em;
            align-items:center;
        }
    }
    .hidden {
        display:        none;
    }
`;
