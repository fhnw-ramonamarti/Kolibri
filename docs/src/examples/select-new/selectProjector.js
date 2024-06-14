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
    optionsContainer.setAttribute("popover", "auto");

    optionsContainer.addEventListener("toggle", (event) => {
        if (event.newState === "open") {
            optionsContainer.classList.toggle("opened", true);
            selectController.setOptionsVisibility(true);
        } else {
            optionsContainer.classList.toggle("opened", false);
            selectController.setOptionsVisibility(false);
        }
    });

    [...Array(selectController.getNumberOfColumns()).keys()].reverse().forEach((col) => {
        const column = selectController.getColumnOptionsComponent(col).getColumnView();
        optionsContainer.append(...column);
    });

    return [optionsContainer];
};

/**
 * Create the selected option view of the select, bind against the controller, and return the view.
 * @param { SelectControllerType } selectController
 * @return { [HTMLDivElement, HTMLDivElement] } - selected option view
 */
const projectSelectedValueOptionView = (selectController) => {
    const rootElement = document.createElement("div");
    rootElement.id    = selectController.getId() + "-selected-option";
    rootElement.classList.add(selectedOptionClassName);
    rootElement.setAttribute("data-id", selectController.getId());

    const selectedOptionContainer = document.createElement("div");
    const clearButton             = document.createElement("button");
    const toggleButton            = document.createElement("button");

    const positionPopover = (selectElement, popoverElementId) => {
        const popoverStyle = selectController.getId() + "-style-popover";
        const { top, left, height, width } = selectElement.getBoundingClientRect();
        const styleElement =
            document.querySelector("#" + popoverStyle) ?? document.createElement("style");
        if(styleElement.textContent === ""){
            styleElement.id = popoverStyle;
            document.querySelector("head").append(styleElement);
        }
        styleElement.textContent = `
            #${popoverElementId} {
                top: ${top + height - 1}px;
                left: ${left}px; 
                width: ${width}px;
            }
        `;
    };

    const togglePopover = (_) => {

        // popover preparing
        const selectElement  = document.querySelector("#" + selectController.getId());
        const popoverElement = selectElement.querySelector(
            `[id*="${selectController.getId()}"][popover]`
        );
        selectElement.classList.toggle("opened", selectController.isOptionsVisible());
        rootElement.classList.toggle("opened", selectController.isOptionsVisible());

        positionPopover(selectElement, popoverElement.id);
        
        if(selectController.isOptionsVisible()){
            popoverElement.hidePopover();
        } else {
            popoverElement.showPopover();
        }
    };

    window.addEventListener("resize",() => {
        const popoverElement = document.querySelector(
            `[id*="${selectController.getId()}"][popover]:popover-open`
        );
        if(null != popoverElement){
            const selectElement  = popoverElement.closest("#" + selectController.getId());
            positionPopover(selectElement, popoverElement.id);
        }
    });

    window.addEventListener("scroll",() => {
        const popoverElement = document.querySelector(
            `[id*="${selectController.getId()}"][popover]:popover-open`
        );
        if(null != popoverElement){
            // popoverElement.hidePopover();
            // hide or move and leave opened
            const selectElement  = popoverElement.closest("#" + selectController.getId());
            positionPopover(selectElement, popoverElement.id);
        }
    });

    selectedOptionContainer.classList.add("toggleButton");
    selectedOptionContainer.classList.add("selected-value");
    selectedOptionContainer.innerHTML = selectController.getSelectedValueOption().getLabel();
    selectedOptionContainer.onclick = togglePopover;
    rootElement.append(selectedOptionContainer);

    clearButton.setAttribute("type", "button");
    clearButton.classList.add("clearButton");
    clearButton.classList.add("clear");
    clearButton.innerHTML = "&times;";
    clearButton.onclick = () => {
        selectController.clearSelectedValueOption();
    };
    rootElement.append(clearButton);

    toggleButton.setAttribute("type", "button");
    toggleButton.classList.add("toggleButton");
    toggleButton.onclick = togglePopover;
    rootElement.append(toggleButton);

    return [rootElement, selectedOptionContainer];
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
    const [selectedOptionElement, selectedOptionLabelElement] =
        projectSelectedValueOptionView(selectController);

    const rootElement = document.createElement("div");
    rootElement.id    = selectController.getId();
    rootElement.classList.add(selectClassName);

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
    @keyframes open {
        0% {
            transform: scaleY(0);
        }
        100% {
            transform: scaleY(1);
        }
    }

    @keyframes close {
        0% {
            transform: scaleY(1);
        }
        100% {
            transform: scaleY(0);
        }
    }

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
        align-items:    stretch;
        flex-wrap:      nowrap;
      
        display:        none;
        padding:        0;
        margin:         0;

        inset: unset;
        width: auto;
        position: fixed;
        top: 0px;
        left: 0px;
        pointer-events: none;

        animation:        open 300ms ease-in-out;
        transform-origin: top center;

        .options-column {
            flex: 1 1 auto;
        }
    }        

    /*   BEFORE-OPEN STATE   */
    @starting-style {
        .${optionsClassName}[popover]:popover-open {
            height:     0;
        }
    }

    /*   IS-OPEN STATE   */
    .${optionsClassName}[popover]:popover-open {
        display:        flex;
        height:         fit-content;
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

        border:         1px solid #ccc; /* todo */
        border-radius:  4px;

        &.opened {
            border-radius: 4px 4px 0 0;
        }

        .selected-value {
            width:      100%;
        }

        .clear {
            color:      var(--kolibri-color-accent);
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
        position:       relative;

        .toggleButton {
            height:      100%;
            display:     flex;
            align-items: center;
            padding:     0;

            button& {
                height:       100%;
                aspect-ratio: 1;
                background-image: url("../../../img/icons/kolibri-select-closed.svg");
                background-size: contain;
                background-repeat: no-repeat;
            }
        }

        .selected-value {
            min-height:  2rem;
            display:     flex;
            gap:         0.5em;
            align-items: center;
        }
    }
    .${selectClassName} {
        position:       relative;

        &:has(.${optionsClassName}[popover]:popover-open) button.toggleButton {
            background-image: url("../../../img/icons/kolibri-select-opened.svg");
        }
    }
    
    .hidden {
        display:        none;
    }
`;
