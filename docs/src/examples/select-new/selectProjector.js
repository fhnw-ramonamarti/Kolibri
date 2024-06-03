import { InputProjector } from "../../kolibri/projector/simpleForm/simpleInputProjector.js";

export { projectSelectViews, pageCss };

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
    optionsContainer.setAttribute("popover", "on");
    optionsContainer.setAttribute(
        "style",
        "z-index:" + Math.max(50, 90 - Number(selectController.getId().replace(/\D*/, "")))
    );

    [...Array(selectController.getNumberOfColumns()).keys()].reverse().forEach((col) => {
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

    const togglePopover = (event) => {
        selectController.setOptionsVisibility(!selectController.isOptionsVisible());

        // popover preparing
        const selectElement = event.target.closest("#" + selectController.getId());
        const popoverElement = selectElement.querySelector("[popover]");
        const openPopover = document.querySelector("[popover]:popover-open");
        if (openPopover?.id !== popoverElement.id) {
            openPopover?.hidePopover();
        }
        const { top, left, height, width } = selectElement.getBoundingClientRect();
        const styleElement = document.createElement("style");
        styleElement.textContent = `
            #${popoverElement.id} {
                top: ${top + height}px;
                left: ${left}px; 
                width: ${width}px;
            }
        `;
        document.querySelector("head").append(styleElement);
        popoverElement.togglePopover();
    };
    
    document.onclick = (event) => {
        if (null == event.target.closest("." + selectClassName)?.querySelector( " [popover]")) {
            document.querySelectorAll("." + selectClassName + " [popover]").forEach((popover) => {
                popover.hidePopover();
            });
        }
    };

    const selectedOptionContainer = document.createElement("div");
    selectedOptionContainer.classList.add("toggleButton");
    selectedOptionContainer.classList.add("selected-value");
    selectedOptionContainer.innerHTML = selectController.getSelectedValueOption().getLabel();
    selectedOptionContainer.onclick = togglePopover;
    rootElement.append(selectedOptionContainer);

    const clearButton = document.createElement("button");
    clearButton.classList.add("clearButton");
    clearButton.classList.add("clear");
    clearButton.innerHTML = "&times;";
    clearButton.onclick = () => {
        selectController.clearSelectedValueOption();
    };
    rootElement.append(clearButton);

    const toggleButton = document.createElement("button");
    toggleButton.classList.add("toggleButton");
    toggleButton.innerHTML = "&varr;";
    toggleButton.onclick = togglePopover;
    rootElement.append(toggleButton);

    return [rootElement, selectedOptionContainer, toggleButton];
};

/**
 * Combine the options view and selected option view, and return the combined view.
 * For the html form a hidden input element is added to the combined view.
 * @param { SelectControllerType } selectController
 * @return { [HTMLDivElement, HTMLDivElement] } - combined views
 * @example
        const selectController = SelectController({});
        const selectView = projectSelectViews(
            selectController
        );
*/
const projectSelectViews = (selectController) => {
    const allOptionsElement = projectOptionsView(selectController);
    const [selectedOptionElement, selectedOptionLabelElement, _] =
        projectSelectedValueOptionView(selectController);

    const rootElement = document.createElement("div");
    rootElement.classList.add(selectClassName);
    rootElement.id = selectController.getId();

    const componentContainer = document.createElement("div");
    componentContainer.classList.add(inputComponentClassName);
    componentContainer.append(selectedOptionElement);
    componentContainer.append(...allOptionsElement);

    // label & input element
    const [labelElement, inputSpan] = InputProjector.projectInstantInput(
        selectController.getInputController(),
        selectedOptionClassName
    );
    const inputElement = inputSpan.querySelector("input");
    rootElement.append(labelElement);
    rootElement.append(componentContainer);
    componentContainer.append(inputElement);

    selectController.onOptionsVisibilityChange((value) => {
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
 * Styles popover depending properties
 * @private
 */
const popoverStyle = `
    .${optionsClassName}[popover] {
        position:       absolute;
        left:           0;
        z-index:        50;
        margin-bottom:  0.5em;
        gap:            5px;
        align-items:    baseline;
        max-height:     ${boxHeight}px;
        border-radius:  0 0 4px 4px;
        border:         1px solid #ccc; /* todo */
        background:     #fff;
        overflow:       hidden;

        display:        none;
        height:         0;
        padding:        0;
        margin:         0;

        transition:     translate 0.7s ease-out, display 0.7s ease-out allow-discrete;
    }

    /*   IS-OPEN STATE   */
    .${optionsClassName}[popover]:popover-open {
        display:        flex;
        height:         auto;
    }

    /*   BEFORE-OPEN STATE   */
    @starting-style {
        .${optionsClassName}[popover]:popover-open {
 
        }
    }
`;

/**
 * CSS snippet to append to the head style when using the select component.
 * @type { String }
 * @example
        document.querySelector("head style").textContent += pageCss;
 */
const pageCss = `
    ${popoverStyle}
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
