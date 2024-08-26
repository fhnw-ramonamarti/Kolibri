import { InputProjector }           from "../simpleForm/simpleInputProjector.js";
import { 
    DAY_MONTH_YEAR, 
    MONTH_DAY_YEAR, 
    MONTH_NUMBER, 
    YEAR_MONTH_DAY 
}                                   from "./dateComponent.js";
import {
    CAT_CLASS,
    columnClass,
    optionClass,
    typedColumnClass,
    updateScrollbar,
}                                   from "./columnOptionsProjector.js";
import {
    openedClass,
    optionsClass,
    selectClass,
    inputComponentClass,
    selectedOptionClass,
    selectedValueClass,
    toggleButtonClass,
    clearButtonClass,
    disabledClass,
    invalidClass,
    alertInfoShown,
    pageCss as selectProjectorCss,
}                                   from "./selectProjector.js";

export { dateColumnClass, dateSplitterClass, projectDateView, positionClass, pageCss };


/** @type { String } */ const dateComponentClass = "date-component";
/** @type { String } */ const dateColumnClass    = "date-column";
/** @type { String } */ const dateSplitterClass  = "date-splitter";
/** @type { String } */ const placeholderClass   = "date-placeholder";
/** @type { String } */ const positionClass      = "current-position";

/**
 * Create the options view of the date select, bind against the controller, and return the view.
 * @private
 * @param { SelectControllerType } selectController
 * @param { DateFormatType }       dateFormat
 * @returns { [HTMLDivElement] } - [options view as a popover div]
 */
const projectOptionsView = (selectController, dateFormat) => {
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

    // prepare columns with titles
    const yearColumnView = selectController.getColumnOptionsComponent(2).getColumnView();
    const yearContainer  = document.createElement('div');
    const yearTitle      = document.createElement('h6');
    yearTitle.innerText  = "Year";
    if (selectController.getNumberOfColumns() > 3) {
        const decadeColumnView = selectController.getColumnOptionsComponent(3).getColumnView();
        const yearGroup        = document.createElement("div");
        yearGroup.classList.add("year-group");
        if (dateFormat === YEAR_MONTH_DAY) {
            yearGroup.append(decadeColumnView, yearColumnView);
        } else {
            yearGroup.append(yearColumnView, decadeColumnView);
        }
        yearContainer.append(yearTitle, yearGroup);
    } else {
        yearContainer.append(yearTitle, yearColumnView);
    }
    yearContainer.classList.add(dateColumnClass);

    const monthColumnView = selectController.getColumnOptionsComponent(1).getColumnView();
    const monthContainer  = document.createElement('div');
    const monthTitle      = document.createElement('h6');
    monthTitle.innerText  = "Month";
    monthContainer.append(monthTitle, monthColumnView);
    monthContainer.classList.add(dateColumnClass);

    const dayColumnView = selectController.getColumnOptionsComponent(0).getColumnView();
    const dayContainer  = document.createElement('div');
    const dayTitle      = document.createElement('h6');
    dayTitle.innerText  = "Day";
    dayContainer.append(dayTitle, dayColumnView);
    dayContainer.classList.add(dateColumnClass);
    
    // append date components to options container
    switch (dateFormat) {
        case DAY_MONTH_YEAR:
            optionsContainer.append(dayContainer, monthContainer, yearContainer);
            break;
        case MONTH_DAY_YEAR:
            optionsContainer.append(monthContainer, dayContainer, yearContainer);
            break;
        default: // YEAR_MONTH_DAY
            optionsContainer.append(yearContainer, monthContainer, dayContainer);
            break;
    }

    return [optionsContainer];
};

/**
 * Create the selected option view of the date select, bind against the controller, and return the view.
 * @private
 * @param { SelectControllerType } selectController
 * @param { HTMLDivElement }       popoverElement
 * @param { DateFormatType }       dateFormat
 * @returns { [HTMLDivElement, HTMLDivElement] } - [selected option view,
 *                                                 element with the selected option as content]
 */
const projectSelectedValueOptionView = (selectController, popoverElement, dateFormat) => {
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
                top:       ${top + height + scrollTop - 1}px;
                left:      ${left + scrollLeft}px; 
                min-width: ${width}px;
            }
        `;

        // popover not supported
        if (alertInfoShown) {
            styleElement.textContent = `
                #${popoverElementId} {
                    min-width: ${width}px;
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
    selectedOptionContainer.onclick = togglePopover;
    rootElement.append(selectedOptionContainer);

    const getLabel     = (col) => {
        const label = selectController
            .getColumnOptionsComponent(col)
            .getSelectedOption()
            .getLabel();
        const monthLabel = dateFormat === MONTH_NUMBER ? "--" : "---";
        const defaultLabel = ["--", monthLabel, "----"];
        return "" === label ? defaultLabel[col] : label;
    };
    const dayLabel     = document.createElement('div');
    const monthLabel   = document.createElement('div');
    const yearLabel    = document.createElement('div');
    const splitter     = document.createElement('div');
    splitter.innerText = "/";
    splitter.classList.add(dateSplitterClass);
    dayLabel.id   = selectController.getId() + "-day";
    monthLabel.id = selectController.getId() + "-month";
    yearLabel.id  = selectController.getId() + "-year";
    dayLabel.setAttribute("data-field", "0");
    monthLabel.setAttribute("data-field", "1");
    yearLabel.setAttribute("data-field", "2");
    switch (dateFormat) {
        case DAY_MONTH_YEAR:
            selectedOptionContainer.append(
                dayLabel,
                splitter.cloneNode(true),
                monthLabel,
                splitter,
                yearLabel
            );
            break;
        case MONTH_DAY_YEAR:
            selectedOptionContainer.append(
                monthLabel,
                splitter.cloneNode(true),
                dayLabel,
                splitter,
                yearLabel
            );
            break;
        default: // YEAR_MONTH_DAY
            selectedOptionContainer.append(
                yearLabel,
                splitter.cloneNode(true),
                monthLabel,
                splitter,
                dayLabel
            );
            break;
    }
    selectedOptionContainer.classList.toggle(
        placeholderClass,
        selectedOptionContainer.innerText.includes("-")
    );

    // update selection change dependencies
    const updateAfterSelectionChange = () => {
        selectedOptionContainer.classList.toggle(
            placeholderClass,
            selectedOptionContainer.innerText.includes("-")
        );
        clearButton.classList.toggle(
            "hidden",
            "//" === selectedOptionContainer.innerText.replaceAll("\n", "").replaceAll("-", "")
        );
        selectController
            .getInputController()
            .setValid(
                !(
                    selectController.isRequired() ||
                    selectedOptionContainer.innerText.includes("-") &&
                    "//" !==
                        selectedOptionContainer.innerText.replaceAll("\n", "").replaceAll("-", "")
                )
            );
        selectController
            .getInputController()
            .setValue(selectedOptionContainer.innerText.replaceAll("\n", "").replaceAll("/", "."));
    }

    // fill value in input & view container
    selectController.getColumnOptionsComponent(0)?.onOptionSelected((_) => {
        dayLabel.innerText = getLabel(0);
        updateAfterSelectionChange();
    });
    selectController.getColumnOptionsComponent(1)?.onOptionSelected((_) => {
        monthLabel.innerText = getLabel(1);
        updateAfterSelectionChange();
    });
    selectController.getColumnOptionsComponent(2)?.onOptionSelected((_) => {
        yearLabel.innerText = getLabel(2);
        updateAfterSelectionChange();
    });

    clearButton.setAttribute("type", "button");
    clearButton.setAttribute("tabindex", "-1");
    clearButton.classList.add(clearButtonClass);
    clearButton.innerHTML = "&times;";
    clearButton.onclick   = () => {
        selectController.getColumnOptionsComponent(0).clearSelectedOption();
        selectController.getColumnOptionsComponent(1).clearSelectedOption();
        selectController.getColumnOptionsComponent(2).clearSelectedOption();
    };
    clearButton.classList.toggle(
        "hidden",
        "//" === selectedOptionContainer.innerText.replaceAll("\n", "").replaceAll("-", "")
    );
    rootElement.append(clearButton);

    toggleButton.setAttribute("type", "button");
    toggleButton.setAttribute("tabindex", "-1");
    toggleButton.classList.add(toggleButtonClass);
    toggleButton.onclick = togglePopover;
    rootElement.append(toggleButton);

    return [rootElement, selectedOptionContainer];
};

/**
 * Combine the options view and selected option view, and return the combined view for dates.
 * For the html form a hidden input element is added to the combined view.
 *
 * This projector supports browser with popover api and nested css support.
 * Browsers: Chrome ≥ 114, Firefox ≥ 125, Safari ≥ 17 (for lower versions an alert infobox appears)
 *
 * @param { SelectControllerType } selectController
 * @param { DateFormatType }       dateFormat
 * @returns { [HTMLDivElement, HTMLDivElement] } - [whole selected option element,
 *                                                 text content container element]
 * @example
        const selectController = SelectController({});
        const selectView = projectDateView(
            selectController
        );
*/
const projectDateView = (selectController, dateFormat) => {
    const [allOptionsElement] = projectOptionsView(selectController, dateFormat);
    const [selectedOptionElement, selectionTextContentContainer] = projectSelectedValueOptionView(
        selectController,
        allOptionsElement,
        dateFormat
    );

    const rootElement = document.createElement("div");
    rootElement.id    = selectController.getId();
    rootElement.classList.add(selectClass);

    const componentContainer = document.createElement("div");
    componentContainer.classList.add(inputComponentClass);
    componentContainer.classList.add(dateComponentClass);
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
 * Height of the master list box
 * @private
 */
const boxHeight = 240;

/**
 * CSS snippet to append to the head style when using the select component.
 * @type { String }
 * @example
        document.querySelector("head style").textContent += pageCss;
 */
const pageCss = `
    ${selectProjectorCss}

    .${optionsClass}[popover] {
        border:           var(--kolibri-select-border);
        max-height:       ${boxHeight}px;
    }

    .${optionClass} {
        justify-content:  center;
        padding:          6px 12px;
    }

    .${inputComponentClass} {
        min-width:        15rem;
    }

    .${columnClass} {
        min-height:       calc(100% - 25px);
        max-height:       ${boxHeight - 25}px;
    }
    .${columnClass}:not(:last-child) {
        border-right:     none;
        width:            100%;
    }
    .${columnClass}::after {
        width:            3px;
        right:            1px;
        border-radius:    3px;
    }

    .${dateColumnClass} .${typedColumnClass(CAT_CLASS)} {
        color:            var(--kb-color-rgb-label);
        font-size:        0.8em;
    }
    .${dateColumnClass} .${typedColumnClass(CAT_CLASS)}:not(:last-child) {
        border-right:     var(--kolibri-select-border);
    }
    .${dateColumnClass}:not(:last-child) {
        border-right:     var(--kolibri-select-border);
        flex-grow:        1;
    }
    .${dateColumnClass} h6 {
        padding:          5px;
        margin:           0;
        font-size:        0.6em;
        font-weight:      normal;
        background:       var(--kb-color-hsl-bg-light);
        width:            100%;
        text-align:       center;
    }
    .${dateColumnClass} .year-group {
        display:          flex;
    }

    .${selectedValueClass}.${placeholderClass} {
        color:            var(--kb-color-rgb-placeholder);
    }
    .${selectedValueClass}.${placeholderClass} .${dateSplitterClass} {
        color:            black;
    }

    .${selectedValueClass} > div:nth-child(2n-1) {
        padding:          2px;
    }

    :focus .${positionClass} {
        background:       var(--kolibri-color-select);
    }
`;
