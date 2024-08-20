import { InputProjector }                                        from "../simpleForm/simpleInputProjector.js";
import { nullOption }                                            from "./optionsModel.js";
import { disabledClass as disabledOptionClass, updateScrollbar } from "./columnOptionsProjector.js";

export { 
    selectClass, inputComponentClass, selectedOptionClass, optionsClass, 
    selectedValueClass, toggleButtonClass, clearButtonClass, 
    disabledClass, openedClass, invalidClass, 
    alertInfoShown, projectSelectViews, pageCss
};

/** @type { String } */ const selectClass         = "select-component";
/** @type { String } */ const inputComponentClass = "select-input-component";
/** @type { String } */ const selectedOptionClass = "selected-option-component";
/** @type { String } */ const optionsClass        = "options-component";

/** @type { String } */ const selectedValueClass  = "selected-value";
/** @type { String } */ const toggleButtonClass   = "toggle-button";
/** @type { String } */ const clearButtonClass    = "clear-button";

/** @type { String } */ const disabledClass       = disabledOptionClass;
/** @type { String } */ const openedClass         = 'opened';
/** @type { String } */ const invalidClass        = 'invalid';

/** @type { Boolean } */ let alertInfoShown       = false;

/**
 * Create the options view of the select, bind against the controller, and return the view.
 * @param { SelectControllerType } selectController
 * @returns { [HTMLDivElement] } - [options view as a popover div]
 */
const projectOptionsView = (selectController) => {
    const optionsContainer = document.createElement("div");
    optionsContainer.id    = selectController.getId() + "-options";
    optionsContainer.classList.add(optionsClass);
    optionsContainer.setAttribute("popover", "auto");

    optionsContainer.addEventListener("toggle", (event) => {
        if (event.newState === "open") {
            optionsContainer.classList.toggle(openedClass, true);
            selectController.setOptionsVisibility(true);
        } else {
            optionsContainer.classList.toggle(openedClass, false);
            selectController.setOptionsVisibility(false);
        }
        for (let col = 0; col < selectController.getNumberOfColumns(); col++) {
            setTimeout(() => {
                const columnView = selectController.getColumnOptionsComponent(col).getColumnView();
                updateScrollbar(columnView);
            }, 301); // due to animation
        }
    });

    // map over columns from max column to column 0
    [...Array(selectController.getNumberOfColumns()).keys()].reverse().forEach((col) => {
        const columnView = selectController.getColumnOptionsComponent(col).getColumnView();
        optionsContainer.append(columnView);
        selectController.getColumnOptionsComponent(col).onOptionSelected((newOption) => {
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
    rootElement.classList.add(selectedOptionClass);
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
        if (alertInfoShown) {
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
        selectElement.classList.toggle(openedClass, selectController.isOptionsVisible());
        rootElement.classList.toggle(openedClass, selectController.isOptionsVisible());

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
            selectElement.classList.toggle(openedClass, selectController.isOptionsVisible());
            popoverElement.classList.toggle(openedClass, selectController.isOptionsVisible());
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

    selectedOptionContainer.classList.add(toggleButtonClass);
    selectedOptionContainer.classList.add(selectedValueClass);
    selectedOptionContainer.innerHTML = selectController.getSelectedValueOption().getLabel();
    selectedOptionContainer.onclick   = togglePopover;
    rootElement.append(selectedOptionContainer);

    clearButton.setAttribute("type", "button");
    clearButton.setAttribute("tabindex", "-1");
    clearButton.classList.add(clearButtonClass);
    clearButton.innerHTML = "&times;";
    clearButton.onclick   = () => {
        selectController.clearSelectedValueOption();
    };
    rootElement.append(clearButton);

    toggleButton.setAttribute("type", "button");
    toggleButton.setAttribute("tabindex", "-1");
    toggleButton.classList.add(toggleButtonClass);
    toggleButton.onclick = togglePopover;
    rootElement.append(toggleButton);

    return [rootElement, selectedOptionContainer];
};

/**
 * Combine the options view and selected option view, and return the combined view.
 * For the html form a hidden input element is added to the combined view.
 *
 * This projector supports browser with popover api and nested css support.
 * Browsers: Chrome ≥ 114, Firefox ≥ 125, Safari ≥ 17 (for lower versions an alert infobox appears)
 *
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
    rootElement.classList.add(selectClass);

    const componentContainer = document.createElement("div");
    componentContainer.classList.add(inputComponentClass);
    componentContainer.setAttribute("tabindex", "0"); // focusable element
    componentContainer.append(selectedOptionElement);
    componentContainer.append(allOptionsElement);

    // label & input element
    const [labelElement, inputSpan] = InputProjector.projectInstantInput(
        selectController.getInputController(),
        selectedOptionClass
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
        selectedOptionElement.classList.toggle(invalidClass, !valid);
    });

    rootElement.append(labelElement);
    rootElement.append(componentContainer);
    componentContainer.append(inputElement);

    selectController.onDisabledChanged((disabled) => {
        componentContainer.classList.toggle(disabledClass, disabled);
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
            if (!alertInfoShown) {
                alertInfoShown = true;
                console.log("Popover not supported in this browser / version");
                alert("Popover not supported in this browser \nSelect components may not work correctly");
            }
        }
        selectedOptionElement.classList.toggle(openedClass, isVisible);
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

    .${optionsClass}[popover] {
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
    }

    /* styles for popover not supporting browsers */
    .${optionsClass}[popover]:not(.${openedClass}) {
        display:        none;
    }
    .${optionsClass}[popover].${openedClass} {
        display:        flex;
        height:         fit-content;
    }

    /*   BEFORE-OPEN STATE   */
    @starting-style {
        .${optionsClass}[popover]:popover-open {
            height:     0;
        }
    }

    /*   IS-OPEN STATE   */
    .${optionsClass}[popover]:popover-open {
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

    .${selectedOptionClass} {
        position:       relative;
        display:        flex;
        align-items:    center;
        padding:        0.5em;
        width:          100%;
        height:         2rem;

        border:         1px solid #ccc; 
        border-radius:  4px;
    }
    :focus .${selectedOptionClass} {
        outline:        var(--kolibri-color-select) solid 2px;
    }

    .${selectedOptionClass}.${openedClass} {
        border-radius:  4px 4px 0 0;
    }
    .${selectedOptionClass}.${invalidClass} {
        border:         var(--kb-rgb-danger-accent) 2px solid;
    }
    .${selectedOptionClass} .${selectedValueClass} {
        width:          100%;
    }
    .${selectedOptionClass} .${clearButtonClass} {
        color:          var(--kolibri-color-accent);
        font-size:      0.8em;
        margin-right:   0.3em
    }
    .${selectedOptionClass} button.${toggleButtonClass}, 
    .${selectedOptionClass} .${clearButtonClass} {
        background-color: transparent;
        border:           none;
        font-size:        1.1em;
        height:           100%;
        aspect-ratio:     10 / 9;
        padding:          0;
        line-height:      0.8;
        overflow:         hidden;
        display:          flex;
        align-items:      center;
        justify-content:  center;
    }
    .${selectedOptionClass} img {
        max-height:     100%;
        max-width:      100%;
        object-fit:     contain;
    }

    .${inputComponentClass} {
        position:       relative;
        width:          200px;
    }
    .${inputComponentClass}:focus {
        outline:        none;
    }
    .${inputComponentClass}.${disabledClass} {
        background:     #eee;
        filter:         grayscale(0.9);
        pointer-events: none;
    }
    .${inputComponentClass}.${disabledClass} * {
        pointer-events: none;
    }
    .${inputComponentClass} .${selectedValueClass} {
        min-height:     2rem;
        display:        flex;
        gap:            0.5em;
        align-items:    center;
    }
    .${inputComponentClass} .${toggleButtonClass} {
        height:         100%;
        display:        flex;
        align-items:    center;
    }
    .${inputComponentClass} button.${toggleButtonClass} {
        background-image:    ${svgToUrl(arrowDownIcon)};
        background-size:     1em;
        background-repeat:   no-repeat;
        background-position: center center;
    }

    .${selectedOptionClass}.${openedClass} button.${toggleButtonClass},
    .${inputComponentClass}:has(.${optionsClass}[popover]:popover-open) button.${toggleButtonClass} {
        background-image:    ${svgToUrl(arrowUpIcon)};
    }

    .${selectClass} {
        position:       relative;
        display:        flex;
        gap:            2em;
    }
    .${selectClass} label {
        min-width:      100px;
    }

    .hidden.hidden {
        display:        none;
    }
`;
