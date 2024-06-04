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
    rootElement.setAttribute("data-id", selectController.getId());

    const selectedOptionContainer = document.createElement("div");
    const clearButton             = document.createElement("button");
    const toggleButton            = document.createElement("button");

    const togglePopover = (_) => {
        selectController.setOptionsVisibility(!selectController.isOptionsVisible());

        // popover preparing
        const selectElement = document.querySelector("#" + rootElement.id);
        const popoverElement = document.querySelector(
            `[id*="${selectController.getId()}"][popover]`
        );
        const openPopover = document.querySelector("[popover]:popover-open");
        if (openPopover?.id !== popoverElement.id) {
            openPopover?.hidePopover();
            document.querySelectorAll("button.toggleButton").forEach((toggle) => {
                toggle.innerHTML = closedIcon(selectController.getId() + "-closed-button");
            });
        }
        toggleButton.innerHTML = selectController.isOptionsVisible()
            ? openedIcon(selectController.getId() + "-opened-button")
            : closedIcon(selectController.getId() + "-closed-button");

        const { top, left, height, width } = selectElement.getBoundingClientRect();
        const { scrollTop, scrollLeft } = document.documentElement;
        const styleElement = document.createElement("style");
        styleElement.textContent = `
            #${popoverElement.id} {
                top: ${top + height + scrollTop - 1}px;
                left: ${left + scrollLeft}px; 
                width: ${width}px;
                flex-wrap: nowrap;

                .options-column {
                    flex: 1 1 auto;
                }
            }
            `;
            // flex-basis: ${100 / selectController.getNumberOfColumns()}%;
        selectElement.classList.toggle("opened", selectController.isOptionsVisible());
        popoverElement.classList.toggle("opened", selectController.isOptionsVisible());
        document.querySelector("head").append(styleElement);
        popoverElement.togglePopover();
    };
    
    document.onclick = (event) => {
        const input = event.target.closest("." + inputComponentClassName);
        if (null == input) {
            document.querySelectorAll("." + optionsClassName + "[popover]").forEach((popover) => {
                popover.hidePopover();
                document.querySelectorAll("button.toggleButton").forEach((toggle) => {
                    toggle.innerHTML = closedIcon(selectController.getId() + "-closed-button");
                });
            });
        }
    };

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
    toggleButton.innerHTML = selectController.isOptionsVisible()
        ? openedIcon(selectController.getId() + "-opened-button")
        : closedIcon(selectController.getId() + "-closed-button");
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
    const [selectedOptionElement, selectedOptionLabelElement, toggleButton] =
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
        toggleButton.innerHTML = value
            ? openedIcon(selectController.getId() + "-opened-button")
            : closedIcon(selectController.getId() + "-closed-button");
    });

    return [rootElement, selectedOptionLabelElement];
};

/**
 * Svg of opened status of the select component
 * @private
 */
const openedIcon = (id = "") => `
    <svg xmlns="http://www.w3.org/2000/svg" id="${id}" viewBox="0 0 24 24" fill="none" class="opened-button">
        <path d="M 5 16  L 12 9  L 19 16" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
`;

/**
 * Svg of closed status of the select component
 * @private
 */
const closedIcon = (id = "") => `
    <svg xmlns="http://www.w3.org/2000/svg" id="${id}" viewBox="0 0 24 24" fill="none" class="closed-button">
        <path d="M 5 9  L 12 16  L 19 9" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
`;


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
        align-items:    stretch;
      
        display:        none;
        padding:        0;
        margin:         0;
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
        .toggleButton {
            height:      100%;
            display:     flex;
            align-items: center;
            padding:     0;

            svg {
                height:       100%;
                aspect-ratio: 1;
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
    }
    
    .hidden {
        display:        none;
    }
`;
