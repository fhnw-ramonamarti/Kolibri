
export { projectColumnOptionsView, pageCss, getHtmlElementByOption, elementDataLabel };

/** @private */
const columnClassName = 'options-column';

/** @private */
const optionClassName = columnClassName + '-item';


/**
 * Returns a unique id for the html element that is to represent the attribute such that 
 * we can create the element in a way that allows later retrieval when it needs to be removed.
 * The resulting String should follow the constraints for properly formatted html ids, i.e. no dots.
 * @private
 * @param  { OptionType } option
 * @returns { String }
 */
const elementId = (option) =>
    (columnClassName + "-" + option.getId()).replaceAll("\.","-");

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
 * Create the column view, bind against the controller, and return the view.
 * @param { OptionsControllerType }        optionsController
 * @param { SelectedOptionControllerType } selectedOptionController
 * @param { SelectedOptionControllerType } cursorPositionController
 * @param { Number }                       columnNumber
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
    columnNumber = 0
) => {
    const columnContainer = document.createElement("div");
    columnContainer.classList.add(columnClassName);
    columnContainer.classList.add(columnClassName + "-" + columnNumber);
    columnContainer.setAttribute("data-column", `${columnNumber}`);

    if (columnNumber === 0) {
        columnContainer.classList.add("value-" + columnClassName);
    }
    if (columnNumber > 0) {
        columnContainer.classList.add("category-" + columnClassName);
    }

    /**
     * @param { OptionType } option 
     */
    const renderRow = (option) => {
        const optionType = columnNumber === 0 ? "value" : "category";
        const [rowElement] = projectOption(
            selectedOptionController,
            option,
            optionType,
            cursorPositionController
        );
        // sort with append is problem// operate on shadow dom no rendering
        columnContainer.append(rowElement);
        if (selectedOptionController.getSelectedOption().equals(option)) {
            selectOptionItem(columnContainer)(option, option);
        }
        if (cursorPositionController?.getSelectedOption().equals(option)) {
            cursorPositionItem(columnContainer)(option, option);
        }
    };

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
    item.classList.add(optionClassName);
    item.classList.add(optionType + "-" + optionClassName);
    item.innerHTML = option.getLabel();
    item.onclick = (_) => {
        if(selectedOptionController.isDisabled()){
            return;
        }
        if ("value" !== optionType && selectedOptionController.getSelectedOption().equals(option)) {
            // unselect categories & select cursor position
            cursorPositionController?.setSelectedOption(option);
            selectedOptionController.clearSelectedOption();
            return;
        }
        if ("value" === optionType) {
            cursorPositionController?.setSelectedOption(option);
        }
        selectedOptionController.setSelectedOption(option);
    };

    selectedOptionController.onDisabledChanged(disabled => {
        item.classList.toggle("disabled", disabled);
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
        oldItem.classList.remove("cursor-position");
    }
    const newItem = getHtmlElementByOption(newOption, root);
    if (newItem) {
        newItem.classList.add("cursor-position");
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
        oldItem.classList.remove("selected");
    }
    const newItem = getHtmlElementByOption(newOption, root);
    if (newItem) {
        newItem.classList.add("selected");
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
 * Height of the column box
 * @private
 */
const boxHeight = 240;

/**
 * CSS snippet to append to the head style when using the component.
 * @type { String }
 * @example
        document.querySelector("head style").textContent += pageCss;
 */
const pageCss = `
    .hidden {
        display: none;
    }
    .${columnClassName} {
        /* width:          100%; */
        /* max-width:      100%; */
        overflow-y:     scroll;
        overflow-x:     hidden;
        max-height:     ${boxHeight}px;
        min-height:     100%;
        padding:        5px;
        flex-grow:      2;
        flex-shrink:    1;

        &:not(:last-child) {
            border-right: 1px solid #ccc; /* todo */
            flex-grow:      1;
        }

        /* styling for scroll bar */
        scrollbar-color: #ccc #fff;
        scrollbar-width: thin;
        
        &::-webkit-scrollbar {
            /* width:      4px; */
        }

        &::-webkit-scrollbar-track {
        }
    
        &::-webkit-scrollbar-thumb {
            background-color: #ccc; /* todo */
        }
    }
    .${optionClassName} {
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
        /* overflow-wrap:  anywhere; */
        overflow:       hidden;
        text-overflow:  ellipsis;

        img {
            height:     2rem;
            margin:     0 .5rem;
        }

        &.selected {
            background:     var(--kolibri-color-select);
            border-radius:  4px;
        }

        &.disabled {
            filter:     grayscale(0.9);
        }

        &.category-${optionClassName}:last-child {
            border-bottom:  none;
        }

        &:not(.disabled):hover::after {
            content:        '';
            position:       absolute;
            left:           10px;
            transform:      translateX(-50%);
            width:          2.5px;
            background:     var(--kolibri-color-accent);
            border-radius:  1px;
            top:            0.5em;
            bottom:         0.4em;
        }
    }

    .cursor-position {
        color:          var(--kb-hsla-warning-dark);
        
        &:not(.disabled)::before {
            content:        '';
            position:       absolute;
            left:           7px;
            transform:      translateX(-50%);
            width:          2.5px;
            background:     var(--kb-hsla-warning-dark);
            border-radius:  1px;
            top:            0.5em;
            bottom:         0.4em;
        }
    }
`;
