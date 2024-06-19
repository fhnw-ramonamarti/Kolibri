import { InputProjector } from "../../kolibri/projector/simpleForm/simpleInputProjector.js";
import { iProjector }     from "./iProjector.js";
import { nullOption }     from "./optionsModel.js";

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
 * @returns { [HTMLDivElement] } - [options view as a popover div]
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

    // map over columns from max colum to column 0
    [...Array(selectController.getNumberOfColumns()).keys()].reverse().forEach((col) => {
        const column = selectController.getColumnOptionsComponent(col).getColumnView();
        optionsContainer.append(...column);
        selectController.getColumnOptionsComponent(col).onOptionSelected((newOption, oldOption) => {
            if (nullOption.getId() !== newOption.getId()) {
                selectController.setCursorPosition(newOption);
            } else if (nullOption.getId() !== oldOption.getId()) {
                selectController.setCursorPosition(oldOption);
            }
        });
    });

    return [optionsContainer];
};

/**
 * Create the selected option view of the select, bind against the controller, and return the view.
 * @param { SelectControllerType } selectController
 * @param { HTMLDivElement }       popoverElement
 * @returns { [HTMLDivElement, HTMLDivElement] } - [selected option view,
 *                                                 element with the selected option as content]
 */
const projectSelectedValueOptionView = (selectController, popoverElement) => {
    const rootElement = document.createElement("div");
    rootElement.id    = selectController.getId() + "-selected-option";
    rootElement.classList.add(selectedOptionClassName);
    rootElement.setAttribute("data-id", selectController.getId());

    const selectedOptionContainer = document.createElement("div");
    const clearButton             = document.createElement("button");
    const toggleButton            = document.createElement("button");

    // specific positioning styles for popover
    const styleElement = document.createElement("style");
    styleElement.id    = "popoverStyle";
    document.querySelector("head").append(styleElement);

    const positionPopover = (selectElement, popoverElementId) => {
        const { top, left, height, width } = selectElement.getBoundingClientRect();
        const { scrollTop, scrollLeft } = document.documentElement;
        styleElement.textContent = `
            #${popoverElementId} {
                top: ${top + height + scrollTop - 1}px;
                left: ${left + scrollLeft}px; 
                width: ${width}px;
            }
        `;
    };

    const togglePopover = (_) => {
        // popover preparing
        const selectElement = rootElement;
        selectElement.classList.toggle("opened", selectController.isOptionsVisible());
        rootElement.classList.toggle("opened", selectController.isOptionsVisible());

        positionPopover(selectElement, popoverElement.id);

        if (selectController.isOptionsVisible()) {
            popoverElement.hidePopover();
        } else {
            popoverElement.showPopover();
        }
    };

    window.addEventListener("resize", () => {
        const selectElement = rootElement;
        if (null != popoverElement && null != selectElement) {
            positionPopover(selectElement, popoverElement.id);
        }
    });

    window.addEventListener("scroll", () => {
        const selectElement = rootElement;
        if (null != popoverElement && null != selectElement) {
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
 * @returns { [HTMLDivElement, HTMLDivElement] } - [whole selected option element,
 *                                                 text content container element]
 * @example
        const selectController = SelectController({});
        const selectView = projectSelectViews(
            selectController
        );
*/
const projectSelectViews = (selectController) => {
    const [allOptionsElement] = projectOptionsView(selectController);
    const [selectedOptionElement, selectionTextContentContainer] = projectSelectedValueOptionView(
        selectController,
        allOptionsElement
    );

    const rootElement = document.createElement("div");
    rootElement.id    = selectController.getId();
    rootElement.classList.add(selectClassName);

    const componentContainer = document.createElement("div");
    componentContainer.classList.add(inputComponentClassName);
    componentContainer.setAttribute("tabindex", "0"); // focusable element
    componentContainer.append(selectedOptionElement);
    componentContainer.append(allOptionsElement);

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
        if (value) {
            allOptionsElement.showPopover();
        } else {
            allOptionsElement.hidePopover();
        }
        allOptionsElement.classList.toggle("hidden", !value);
        selectedOptionElement.classList.toggle("opened", value);
    });

    selectedOptionElement.addEventListener("mousedown", (_) => {
        componentContainer.focus();
    });

    iProjector(rootElement, selectController);

    return [rootElement, selectionTextContentContainer];
};


/**
 * Height of the master list box
 * @private
 */
const boxHeight = 240;

/**
 * Link to the folder with the svg icons 
 * @private
 */
// const iconFolderUrl = "../../../img/icons/";
const iconFolderUrl = "https://fhnw-ramonamarti.github.io/Kolibri/img/icons/";

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
        z-index:        50;
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

        box-shadow: 0px 5px 15px #0002;

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

        :focus & {
            border-color: var(--kolibri-color-output);
        }

        .selected-value {
            width:      100%;
        }

        .clear {
            color:        var(--kolibri-color-accent);
            font-size:    0.8em;
            margin-right: 0.3em
        }
        
        button.toggleButton, 
        .clear {
            background-color:   transparent;
            border:             none;
            font-size:          1.1em;
            height:             100%;
            aspect-ratio:       10 / 9;
            padding:            0;
            line-height:        0.8;
            overflow:           hidden;
            display:            flex;
            align-items:        center;
            justify-content:    center;
        }

        img {
            max-height: 100%;
            max-width:  100%;
            object-fit: contain;
        }
    }
    .${inputComponentClassName} {
        position:       relative;

        &:focus {
            outline:    none;
        }

        .toggleButton {
            height:      100%;
            display:     flex;
            align-items: center;

            button& {
                background-image:    url("${iconFolderUrl}kolibri-select-closed.svg");
                background-size:     1em;
                background-repeat:   no-repeat;
                background-position: center center;
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
            background-image: url("${iconFolderUrl}kolibri-select-opened.svg");
        }
    }
    
    .hidden.hidden {
        display:        none;
    }
`;
