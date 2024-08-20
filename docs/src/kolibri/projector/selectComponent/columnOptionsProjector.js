
export {
    CAT_CLASS, VALUE_CLASS, 
    typedColumnClass, typedOptionClass,
    columnClass, optionClass, 
    cursorPositionClass, selectedClass, disabledClass, 
    projectColumnOptionsView, pageCss, 
    getHtmlElementByOption, elementDataLabel, updateScrollbar,
};


/**
 * @typedef { 'category' | 'value' } OptionTypeClass
 */

/** @type { OptionTypeClass } */ const CAT_CLASS   = 'category';
/** @type { OptionTypeClass } */ const VALUE_CLASS = 'value';


/**
 * @param { OptionTypeClass } type - type of options
 * @returns { String }             - class name for column of option type
 */
const typedColumnClass = (type) => type + '-' + columnClass;

/**
 * @param { OptionTypeClass } type - type of option
 * @returns { String }             - class name for option of option type
 */
const typedOptionClass = (type) => type + '-' + optionClass;

/** @type { String } */ const columnClass         = 'options-column';
/** @type { String } */ const optionClass         = columnClass + '-item';

/** @type { String } */ const cursorPositionClass = 'cursor-position';
/** @type { String } */ const selectedClass       = 'selected';
/** @type { String } */ const disabledClass       = 'disabled';

/** @private */
const invisibleClass = 'invisible';

/** @private */
let id = 0;

/**
 * Height of the column box
 * @private
 */
const boxHeight = 240;


/**
 * Returns a unique id for the html element that is to represent the attribute such that 
 * we can create the element in a way that allows later retrieval when it needs to be removed.
 * The resulting String should follow the constraints for properly formatted html ids, i.e. no dots.
 * @private
 * @param  { OptionType } option
 * @returns { String }
 */
const elementId = (option) =>
    (columnClass + "-" + option.getId()).replaceAll("\.","-");

/**
 * Returns a data label for the html element that is to represent the attribute such that 
 * we can create the element in a way that allows later retrieval.
 * The resulting String should follow the constraints for properly formatted html data attribute.
 * @param  { OptionType } option
 * @returns { String }
 * @example
        const option = ValueOption("Switzerland");
        const dataLabel = elementDataLabel(option);
 */
const elementDataLabel = (option) => option?.getLabel().replaceAll(/[^a-zA-Z\d-_]/g, "_") ?? "";

/**
 * Returns an option html element fitting to the option. If no element exists null is returned.
 * @param { OptionType }     option 
 * @param { HTMLDivElement } rootElement 
 * @returns { HTMLDivElement | null }
 * @example
        const option = ValueOption("Switzerland");
        const selectContainer = document.querySelector(".select-container");
        const optionElement = getHtmlElementByOption(option, selectContainer);
 */
const getHtmlElementByOption = (option, rootElement) => {
    const id    = elementId(option);
    const label = elementDataLabel(option);

    const optionQuery      = `[data-id="${id}"]`;
    const queryAlternative = `[data-value="${option?.getValue()}"][data-label="${label}"]`;
    
    return (
        rootElement.querySelector(optionQuery) ??
        rootElement.querySelector(queryAlternative) ??
        null
    );
};

/**
 * @param { HTMLDivElement } columnContainer - container to update scrollbar style
 */
const updateScrollbar = (columnContainer) => {
    const styleId         = "columnStyle-" + columnContainer.getAttribute("data-id");
    const scrollTop       = columnContainer.scrollTop;
    const containerHeight =
        (columnContainer.getBoundingClientRect().height === 0
            ? boxHeight
            : columnContainer.getBoundingClientRect().height) - 10;
    const completeHeight = [...columnContainer.children]
        .map((child) =>
            child.getBoundingClientRect().height === 0 ? 0 : child.getBoundingClientRect().height
        )
        .reduce((a, b) => a + b, 0);

    const styleElement = document?.getElementById(styleId) ?? document.createElement("style");
    if(null == styleElement || completeHeight <= 0){
        return;
    }

    const barHeight = containerHeight / (completeHeight / containerHeight) + 10;
    if (containerHeight > completeHeight - 10) {
        styleElement.textContent = `
            #${columnContainer.id}::after {
                height: ${0}px;
                top: ${5}px;
            }
        `;
        return;
    }

    const top = Math.min(
        completeHeight - barHeight,
        scrollTop + (scrollTop / completeHeight) * containerHeight
    );
    styleElement.textContent = `
        #${columnContainer.id}::after {
            height: ${Math.floor(barHeight)}px;
            top: ${5 + Math.floor(top)}px;
        }
        #${columnContainer.id} {
            padding-right: 10px;
        }
    `;
}


/**
 * Create the column view, bind against the controller, and return the view.
 * @param { OptionsControllerType }        optionsController
 * @param { SelectedOptionControllerType } selectedOptionController
 * @param { SelectedOptionControllerType } cursorPositionController
 * @param { Number }                       columnNumber
 * @param { Boolean }                      isValueColumn
 * @returns { [HTMLDivElement] } - column view
 * @example
        const optionsController = OptionsController();
        const selectedOptionController = SelectedOptionController();
        const cursorPositionController = SelectedOptionController();

        const columnView = projectColumnOptionsView(
            optionsController,
            selectedOptionController,
            cursorPositionController
        );
 */
const projectColumnOptionsView = (
    optionsController,
    selectedOptionController,
    cursorPositionController,
    columnNumber = 0,
    isValueColumn = columnNumber === 0,
) => {
    const columnId        = id++;
    const columnContainer = document.createElement("div");
    columnContainer.id    = columnClass + "-" + columnId;
    columnContainer.classList.add(columnClass);
    columnContainer.classList.add(columnClass + "-" + columnNumber);
    columnContainer.setAttribute("data-column", `${columnNumber}`);
    columnContainer.setAttribute("data-id", `${columnId}`);

    if (isValueColumn) {
        columnContainer.classList.add(typedColumnClass(VALUE_CLASS));
    } else {
        columnContainer.classList.add(typedColumnClass(CAT_CLASS));
    }

    /**
     * @param { OptionType } option 
     */
    const renderRow = (option) => {
        const optionType = isValueColumn ? VALUE_CLASS : CAT_CLASS;
        const [rowElement] = projectOption(
            selectedOptionController,
            option,
            optionType,
            cursorPositionController
        );
        // hide options initially not visible in column
        if (optionsController.getOptions().length > 150) {
            rowElement.classList.toggle(invisibleClass, true);
        }
        columnContainer.append(rowElement);
        if (selectedOptionController.getSelectedOption().equals(option)) {
            selectOptionItem(columnContainer)(option, option);
        }
        if (cursorPositionController?.getSelectedOption().equals(option)) {
            cursorPositionItem(columnContainer)(option, option);
        }
    };

    // specific positioning styles for scrollbar
    const styleElement = document.createElement("style");
    styleElement.id    = "columnStyle-" + columnId;
    document.querySelector("head").append(styleElement);
    updateScrollbar(columnContainer);

    let oldScrollPosition = 0;

    // show options on scroll
    const scroll = (_) => {
        const newScrollPosition = columnContainer.scrollTop;

        updateScrollbar(columnContainer);

        for (let i = 0; i < 20; i++) {
            if (newScrollPosition > oldScrollPosition) {
                // scrolling down
                const nextItem = columnContainer.querySelector(
                    `:not(.${invisibleClass}) + .${invisibleClass}`
                );
                if (null != nextItem) {
                    nextItem.classList.toggle(invisibleClass, false);
                }
            } else if (newScrollPosition < oldScrollPosition) {
                // scrolling up
                const prevItem = columnContainer.querySelector(
                    `.${invisibleClass}:has(+ :not(.${invisibleClass})`
                );
                if (null != prevItem) {
                    prevItem.classList.toggle(invisibleClass, false);
                }
            }
        }
        
        oldScrollPosition = newScrollPosition <= 0 ? 0 : newScrollPosition;
    }
    columnContainer.addEventListener("scroll", scroll);
    columnContainer.addEventListener("mousewheel", scroll);
    columnContainer.addEventListener("DOMMouseScroll", scroll); // firefox

    optionsController.onOptionAdd(renderRow);
    optionsController.onOptionDel(removeOptionItem(columnContainer));
    selectedOptionController.onOptionSelected(selectOptionItem(columnContainer));
    cursorPositionController?.onOptionSelected(cursorPositionItem(columnContainer));

    return [columnContainer];
};


/**
 * Creating the views and bindings for an item in the list view, binding for instant value updates.
 * @private
 * @param { SelectedOptionControllerType } selectedOptionController
 * @param { SelectedOptionControllerType } cursorPositionController
 * @param { OptionType }                   option
 * @param { String }                       optionType
 * @returns { Array<HTMLElement> } - single option item view
 */
const projectOption = (selectedOptionController, option, optionType, cursorPositionController) => {

    const item = document.createElement("div");
    item.setAttribute("data-id", elementId(option));
    item.setAttribute("data-value", option.getValue());
    item.setAttribute("data-label", elementDataLabel(option));
    item.classList.add(optionClass);
    item.classList.add(typedOptionClass(optionType));
    item.innerHTML = option.getLabel();
    item.onclick = (_) => {
        if(selectedOptionController.isDisabled()){
            return;
        }
        if (VALUE_CLASS !== optionType && selectedOptionController.getSelectedOption().equals(option)) {
            // unselect categories & select cursor position
            selectedOptionController.clearSelectedOption();
            cursorPositionController?.setSelectedOption(option);
            return;
        }
        selectedOptionController.setSelectedOption(option);
        cursorPositionController?.setSelectedOption(option);
    };

    selectedOptionController.onDisabledChanged(disabled => {
        item.classList.toggle(disabledClass, disabled);
    });
    
    return [item];
};

/**
 * When the cursor position changes, the change must become visible in the column view.
 * The old cursor position must be deselected, the new one selected.
 * @private
 * @param { HTMLElement } root
 * @returns { (newOption: OptionType, oldOption: OptionType) => void }
 */
const cursorPositionItem = (root) => (newOption, oldOption) => {
    const oldItem = getHtmlElementByOption(oldOption, root);
    if (oldItem) {
        oldItem.classList.remove(cursorPositionClass);
    }

    const newItem = getHtmlElementByOption(newOption, root);
    if (newItem) {
        newItem.classList.add(cursorPositionClass);

        if (newItem.classList.contains(invisibleClass)) {
            newItem.classList.remove(invisibleClass);
            let prevElement = newItem, nextElement = newItem;
            for (let i = 0; i < 50; i++) {
                if (prevElement) {
                    prevElement = prevElement.previousElementSibling;
                    prevElement?.classList.remove(invisibleClass);
                }
                if (nextElement) {
                    nextElement = nextElement.nextElementSibling;
                    nextElement?.classList.remove(invisibleClass);
                }
            }
        }
    }
};

/**
 * When a selection changes, the change must become visible in the column view.
 * The old selected option must be deselected, the new one selected.
 * The cursor position is updated too.
 * @private
 * @param { HTMLElement } root
 * @returns { (newOption: OptionType, oldOption: OptionType) => void }
 */
const selectOptionItem = (root) => (newOption, oldOption) => {
    const oldItem = getHtmlElementByOption(oldOption, root);
    if (oldItem) {
        oldItem.classList.remove(selectedClass);
    }

    const newItem = getHtmlElementByOption(newOption, root);
    if (newItem) {
        newItem.classList.add(selectedClass);
    }
};

/**
 * When a model is removed from the column view, the respective view elements must also be removed.
 * @private
 * @param { HTMLElement } root
 * @returns { (option: OptionType) => void }
 */
const removeOptionItem = (root) => option => {
    const optionElement = getHtmlElementByOption(option, root);
    if (optionElement) {
        optionElement.parentElement.removeChild(optionElement);
    }
};


/**
 * CSS snippet to append to the head style when using the component.
 * @type { String }
 * @example
        document.querySelector("head style").textContent += pageCss;
 */
const pageCss = `
    @keyframes spin {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }

    .${columnClass} {
        position:         relative;
        width:            100%;
        overflow-y:       scroll;
        overflow-x:       hidden;
        max-height:       ${boxHeight}px;
        min-height:       100%;
        padding:          5px;
        flex-grow:        2;
        flex-shrink:      1;
    }
    .${columnClass}:not(:last-child) {
        border-right:     var(--kolibri-select-border);
        flex-grow:        1;
    }
    .${columnClass}::after {
        content:          " ";
        width:            5px;
        right:            2px;
        background-color: var(--kolibri-color-neutral);
        border-radius:    5px;
        position:         absolute;
        z-index:          3;
    }
    .${columnClass} .column-holder {
        display:          flex;
        justify-content:  center;
        align-items:      center
    }
    .${columnClass} .column-loader {
        border:           4px solid transparent;
        border-left:      4px solid var(--kolibri-color-neutral);
        border-top:       4px solid var(--kolibri-color-neutral);
        border-radius:    50%;
        width:            40px;
        aspect-ratio:     1 / 1;
        animation:        spin 1.5s linear infinite;
    }

    /* styling for scroll bar */
    .${columnClass} {
        scrollbar-color:  transparent transparent;
        scrollbar-width:  thin;
    }
    .${columnClass}::-webkit-scrollbar {
        width:            0;
    }
    .${columnClass}::-webkit-scrollbar-thumb {
        background-color: transparent;
    }
    .${columnClass}::-webkit-scrollbar-track {
    }
    
    .${optionClass} {
        position:       relative;
        padding:        10px 20px;
        display:        block;
        cursor:         pointer;
        position:       relative;
        width:          100%;
        padding:        0.3em 1em;
        display:        flex;
        align-items:    center;
        line-height:    1.2;
        overflow:       hidden;
        text-overflow:  ellipsis;
    }
    .${optionClass} img {
        height:         2rem;
        margin:         0 .5rem;
    }
    .${optionClass}.${invisibleClass} {
        display:            none;
        content-visibility: auto;
    }
    .${optionClass}.${selectedClass} {
        background:     var(--kolibri-color-select);
        border-radius:  4px;
    }
    .${optionClass}.${disabledClass} {
        filter:         grayscale(0.9);
    }
    .${optionClass}.${typedOptionClass(CAT_CLASS)}:last-child {
        border-bottom:  none;
    }
    .${optionClass}:not(.${disabledClass}):hover::after {
        content:        '';
        position:       absolute;
        left:           10px;
        top:            0.5em;
        bottom:         0.4em;
        transform:      translateX(-50%);
        
        width:          2px;
        background:     var(--kolibri-color-accent);
        border-radius:  1px;
    }

    .${optionClass}.${cursorPositionClass} {
        color:          var(--kb-hsla-warning-dark);
    }
    .${optionClass}.${cursorPositionClass}:not(.${disabledClass})::before {
        content:        '';
        position:       absolute;
        left:           7px;
        top:            0.5em;
        bottom:         0.4em;
        transform:      translateX(-50%);

        width:          2px;
        background:     var(--kb-hsla-warning-dark);
        border-radius:  1px;
    }
`;
