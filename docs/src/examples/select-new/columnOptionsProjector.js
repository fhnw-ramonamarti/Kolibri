export { projectColumnOptionsView, pageCss };

/** @private */
const columnClassName = 'options-column';

/** @private */
const optionClassName = columnClassName + '-item';


/**
 * Returns a unique id for the html element that is to represent the attribute such that we can create the
 * element in a way that allows later retrieval when it needs to be removed.
 * The resulting String should follow the constraints for properly formatted html ids, i.e. not dots allowed.
 * @private
 * @param  { OptionType } option
 * @return { String }
 */
const elementId = (option) =>
    (columnClassName + "-" + option.getId()).replaceAll("\.","-");


/**
 * Create the column view, bind against the controller, and return the view.
 * @param { OptionsControllerType }        optionsController
 * @param { SelectedOptionControllerType } selectedOptionController
 * @param { SelectedOptionControllerType } cursorPositionController
 * @param { Number }                       columnNumber
 * @return { [HTMLDivElement] } - column view
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

    const renderRow = (option) => {
        const optionType = columnNumber === 0 ? "value" : "category";
        const [rowElement] = projectOption(selectedOptionController, option, optionType);
        columnContainer.append(rowElement);
        if(selectedOptionController.getSelectedOption().getLabel() === option.getLabel() &&
            selectedOptionController.getSelectedOption().getValue() === option.getValue()) {
            selectOptionItem(columnContainer)(option, option);
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
 * @param { SelectedOptionControllerType } selectedOptionController
 * @param { OptionType }                   option
 * @param { String }                       optionType
 * @return { Array<HTMLElement> } - single option item view
 */
const projectOption = (selectedOptionController, option, optionType) => {

    const item = document.createElement("div");
    item.setAttribute("data-id", elementId(option));
    item.setAttribute("data-value", option.getValue());
    item.classList.add(optionClassName);
    item.classList.add(optionType + "-" + optionClassName);
    item.innerHTML = option.getLabel();
    item.onclick = (_) => {
        if ("value" !== optionType &&
            option.getId() === selectedOptionController.getSelectedOption().getId()
        ) {
            selectedOptionController.clearSelectedOption();
            return;
        }
        selectedOptionController.setSelectedOption(option);
    };
    
    return [item];
};

/**
 * When the cursor position changes, the change must become visible in the column view.
 * The old cursor position must be deselected, the new one selected.
 * @param { HTMLElement } root
 * @return { (newOption: OptionType, oldOption: OptionType) => void }
 */
const cursorPositionItem = (root) => (newOption, oldOption) => {
    const oldId = elementId(oldOption);
    const oldItem = root.querySelector(`[data-id=${oldId}]`);
    if (oldItem) {
        oldItem.classList.remove("cursor-position");
    }
    const newId = elementId(newOption);
    const newItem = root.querySelector(`[data-id=${newId}]`);
    if (newItem) {
        newItem.classList.add("cursor-position");
    }
};

/**
 * When a selection changes, the change must become visible in the column view.
 * The old selected option must be deselected, the new one selected.
 * The cursor position is updated too.
 * @param { HTMLElement } root
 * @return { (newOption: OptionType, oldOption: OptionType) => void }
 */
const selectOptionItem = (root) => (newOption, oldOption) => {
    cursorPositionItem(root)(newOption, oldOption);
    const oldId = elementId(oldOption);
    const oldItem = root.querySelector(`[data-id=${oldId}]`);
    if (oldItem) {
        oldItem.classList.remove("selected");
    }
    const newId = elementId(newOption);
    const newItem = root.querySelector(`[data-id=${newId}]`);
    if (newItem) {
        newItem.classList.add("selected");
    }
};

/**
 * When a model is removed from the column view, the respective view elements must be removed as well.
 * @param { HTMLElement } root
 * @return { (option: OptionType) => void }
 */
const removeOptionItem = (root) => option => {
    const id = elementId(option);
    const optionElement = root.querySelector(`[data-id=${id}]`);
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
        width:          100%;
        overflow-y:     scroll;
        overflow-x:     hidden;
        max-height:     ${boxHeight}px;
        min-height:     100%;

        &:not(:last-child) {
            border-right: 1px solid #ccc; /* todo */
        }

        /* styling for scroll bar */
        scrollbar-color: #ccc #fff;
        scrollbar-width: thin;
        
        &::-webkit-scrollbar {
            width: 8px;
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
        padding:        0.2em 1em;
        display:        flex;
        align-items:    center;

        img {
            height:     2rem;
            margin:     0 .5rem;
        }
    }
    .${optionClassName}.selected {
        background:     #FFDB8E;
        border-radius:  4px;
    }
    .${optionClassName}.highlighted {
    }
    .${optionClassName}.category-${optionClassName}:last-child {
        border-bottom:  none;
    }
    .${optionClassName}:hover::after {
        content:        '';
        position:       absolute;
        left:           10px;
        transform:      translateX(-50%);
        width:          2.5px;
        background:     #E11161;
        border-radius:  1px;
        height:         1em;
    }
`;
