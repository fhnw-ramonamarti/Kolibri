import { InputProjector }  from "../simpleForm/simpleInputProjector.js";
import { updateScrollbar } from "./columnOptionsProjector.js";
import { nullOption }      from "./optionsModel.js";

export { projectSelectViews, pageCss };

/** @private */
const selectClassName         = "select-component";

/** @private */
const inputComponentClassName = "select-input-component";

/** @private */
const selectedOptionClassName = "selected-option-component";

/** @private */
const optionsClassName        = "options-component";

/** @private */
let alertInfoShowed           = false;

/**
 * Create the options view of the select, bind against the controller, and return the view.
 * @param { SelectControllerType } selectController
 * @returns { [HTMLDivElement] } - [options view as a popover div]
 */
const projectOptionsView = (selectController) => {
    const optionsContainer = document.createElement("div");
    optionsContainer.id    = selectController.getId() + "-options";
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
        for (let col = 0; col < selectController.getNumberOfColumns(); col++) {
            setTimeout(() => {
                const columnView = selectController.getColumnOptionsComponent(col).getColumnView();
                updateScrollbar(columnView);
            }, 301); // due to animation
        }
    });

    // map over columns from max colum to column 0
    [...Array(selectController.getNumberOfColumns()).keys()].reverse().forEach((col) => {
        const columnView = selectController.getColumnOptionsComponent(col).getColumnView();
        optionsContainer.append(columnView);
        selectController.getColumnOptionsComponent(col).onOptionSelected((newOption, oldOption) => {
            if (nullOption.getId() !== newOption.getId()) {
                selectController.setCursorPosition(newOption);
            }
            for (let i = col; i >= 0; i--) {
                setTimeout(() => {
                    const columnView = selectController
                        .getColumnOptionsComponent(col)
                        .getColumnView();
                    updateScrollbar(columnView);
                }, 100);
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
    styleElement.id    = selectController.getId() + "-popoverStyle";
    document.querySelector("head").append(styleElement);

    /**
     * @param { HTMLDivElement } selectElement 
     * @param { String }         popoverElementId 
     */
    const positionPopover = (selectElement, popoverElementId) => {
        const { top, left, height, width } = selectElement.getBoundingClientRect();
        const { scrollTop, scrollLeft }    = document.documentElement;
        styleElement.textContent = `
            #${popoverElementId} {
                top:   ${top + height + scrollTop}px;
                left:  ${left + scrollLeft}px; 
                width: ${width}px;
            }
        `;

        // popover not supported
        if (alertInfoShowed) {
            styleElement.textContent = `
                #${popoverElementId} {
                    width: ${width}px;
                }
            `;
        }
    };

    const togglePopover = (_) => {
        // popover preparing
        const selectElement = rootElement;
        selectElement.classList.toggle("opened", selectController.isOptionsVisible());
        rootElement.classList.toggle("opened", selectController.isOptionsVisible());

        positionPopover(selectElement, popoverElement.id);

        try {
            if (selectController.isOptionsVisible()) {
                popoverElement.hidePopover();
            } else {
                popoverElement.showPopover();
            }
        } catch (e) {
            // no popover support
            console.log("Popover not supported");
            selectController.setOptionsVisibility(!selectController.isOptionsVisible());
            selectElement.classList.toggle("opened", selectController.isOptionsVisible());
            popoverElement.classList.toggle("opened", selectController.isOptionsVisible());
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

    selectController.onOptionsVisibilityChange((newValue) => {
        if (newValue) {
            positionPopover(rootElement, popoverElement.id);
        }
    });

    selectedOptionContainer.classList.add("toggleButton");
    selectedOptionContainer.classList.add("selected-value");
    selectedOptionContainer.innerHTML = selectController.getSelectedValueOption().getLabel();
    selectedOptionContainer.onclick   = togglePopover;
    rootElement.append(selectedOptionContainer);

    clearButton.setAttribute("type", "button");
    clearButton.setAttribute("tabindex", "-1");
    clearButton.classList.add("clearButton");
    clearButton.classList.add("clear");
    clearButton.innerHTML = "&times;";
    clearButton.onclick   = () => {
        selectController.clearSelectedValueOption();
    };
    rootElement.append(clearButton);

    toggleButton.setAttribute("type", "button");
    toggleButton.setAttribute("tabindex", "-1");
    toggleButton.classList.add("toggleButton");
    toggleButton.onclick = togglePopover;
    rootElement.append(toggleButton);

    return [rootElement, selectedOptionContainer];
};

/**
 * Combine the options view and selected option view, and return the combined view.
 * For the html form a hidden input element is added to the combined view.
 * This projector supports browser with popover api and nestered css support.
 * Browsers: Chrome ≥ 114, Firefox ≥ 125, Safari ≥ 17 (for lower versions an alert infobox appears)
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
    labelElement.addEventListener("mousedown", (_) => {
        // move focus from hidden input to select component
        setTimeout(() => {
            componentContainer.focus();
        }, 5);
    });

    const inputElement = inputSpan.querySelector("input");
    inputElement.setAttribute("required", "" + selectController.isRequired());
    inputElement.setAttribute("tabindex", "-1");
    inputElement.setAttribute(
        "style",
        "all: unset !important;" +
            "z-index: -1 !important;" +
            "position: absolute !important;" +
            "inset: 5px !important;" +
            "color: transparent !important;" +
            "pointer-events: none !important;"
    );
    inputElement.addEventListener("keydown paste focus mousedown", (e) => {
        // read-only on input not working with required
        // for read-only functionality on input
        e.preventDefault();
    });
    inputElement.addEventListener("focus", (_) => {
        // move focus from hidden input to select component
        componentContainer.focus();
    });

    selectController.getInputController().onValidChanged((valid) => {
        selectedOptionElement.classList.toggle("invalid", !valid);
    });

    rootElement.append(labelElement);
    rootElement.append(componentContainer);
    componentContainer.append(inputElement);

    selectController.onDisabledChanged((disabled) => {
        componentContainer.classList.toggle("disabled", disabled);
        if (disabled) {
            selectController.setOptionsVisibility(false);
            inputElement.setAttribute("disabled", "true");
            componentContainer.removeAttribute("tabindex");
            componentContainer.setAttribute("aria-disabled", "true");
        } else {
            inputElement.removeAttribute("disabled");
            componentContainer.setAttribute("tabindex", "0");
            componentContainer.removeAttribute("aria-disabled");
        }
    });

    selectController.onOptionsVisibilityChange((visible) => {
        const isVisible = visible && !selectController.isDisabled();
        try {
            if (isVisible) {
                allOptionsElement.showPopover();
            } else {
                allOptionsElement.hidePopover();
            }
        } catch (e) {
            // no popover support
            if (!alertInfoShowed) {
                alertInfoShowed = true;
                console.log("Popover not supported in this browser / version");
                alert("Popover not supported in this browser \nSelect components may not work correctly");
            }
        }
        selectedOptionElement.classList.toggle("opened", isVisible);
    });

    selectedOptionElement.addEventListener("mousedown", (_) => {
        componentContainer.focus();
    });

    return [rootElement, selectionTextContentContainer];
};


/**
 * Svg of opened status of the select component
 * @private
 */
const arrowUpIcon =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">?` +
    `<path d="M 5 16  L 12 9  L 19 16" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />` +
    `</svg>`;

/**
 * Svg of closed status of the select component
 * @private
 */
const arrowDownIcon =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">` +
    `<path d="M 5 9  L 12 16  L 19 9" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />` +
    `</svg>`;

/**
 * Helper to create background url for svg element
 * @private
 * @param { String } svg
 * @returns { String }
 */
const svgToUrl = (svg) => `url('data:image/svg+xml,${svg}')`;

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
        z-index:        20;
        max-height:     ${boxHeight}px;
        border-radius:  0 0 4px 4px;
        border:         1px solid #ccc; 
        border-top:     none;
        background:     #fff;
        overflow:       hidden;
        align-items:    stretch;
        flex-wrap:      nowrap;

        padding:        0;
        margin:         0;

        box-shadow:     0px 5px 15px #0002;

        animation:        open 300ms ease-in-out;
        transform-origin: top center;

        /* styles for popover not supporting browsers */
        &:not(.opened) {
            display:      none;
        }

        &.opened {
            display:      flex;
            height:       fit-content;
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

        border:         1px solid #ccc; 
        border-radius:  4px;

        &.opened {
            border-radius: 4px 4px 0 0;
        }

        :focus & {
            outline:    var(--kolibri-color-select) solid 2px;
        }

        &.invalid {
            border:     var(--kb-rgb-danger-accent) 2px solid;
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
        width:          200px;

        &:focus {
            outline:    none;
        }

        &.disabled {
            background:     #eee;
            filter:         grayscale(0.9);
            pointer-events: none;

            * {
                pointer-events: none;
            }
        }

        .toggleButton {
            height:      100%;
            display:     flex;
            align-items: center;

            button& {
                background-image:    ${svgToUrl(arrowDownIcon)};
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

        &:has(.${optionsClassName}[popover]:popover-open) button.toggleButton {
            background-image: ${svgToUrl(arrowUpIcon)};
        }
    }
    .${selectClassName} {
        position:       relative;
        display:        flex;
        gap:            2em;

        label {
            min-width:  100px;
        }
    }
    
    .hidden.hidden {
        display:        none;
    }
`;
