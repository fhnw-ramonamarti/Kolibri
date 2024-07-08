
export {
    projectColumnOptionsView,
    pageCss,
    getHtmlElementByOption,
    elementDataLabel,
    updateScrollbar,
};

/** @private */
const columnClassName = 'options-column';

/** @private */
const optionClassName = columnClassName + '-item';

/** @private */
const notVisibleClass = "invisible";

/** 
 * Height of the column box
 * @private
 */
const boxHeight = 240;

/** @private */
let id = 0;


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
    const columnId        = id++;
    const columnContainer = document.createElement("div");
    columnContainer.id    = columnClassName + "-" + columnId;
    columnContainer.classList.add(columnClassName);
    columnContainer.classList.add(columnClassName + "-" + columnNumber);
    columnContainer.setAttribute("data-column", `${columnNumber}`);
    columnContainer.setAttribute("data-id", `${columnId}`);

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
        // hide options initially not visible in column
        if (optionsController.getOptions().length > 150) {
            rowElement.classList.toggle(notVisibleClass, true);
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
                    `:not(.${notVisibleClass}) + .${notVisibleClass}`
                );
                if (null != nextItem) {
                    nextItem.classList.toggle(notVisibleClass, false);
                }
            } else if (newScrollPosition < oldScrollPosition) {
                // scrolling up
                const prevItem = columnContainer.querySelector(
                    `.${notVisibleClass}:has(+ :not(.${notVisibleClass})`
                );
                if (null != prevItem) {
                    prevItem.classList.toggle(notVisibleClass, false);
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
        if (newItem.classList.contains(notVisibleClass)) {
            newItem.classList.remove(notVisibleClass);
            let prevElement = newItem, nextElement = newItem;
            for (let i = 0; i < 50; i++) {
                if (prevElement) {
                    prevElement = prevElement.previousElementSibling;
                    prevElement?.classList.remove(notVisibleClass);
                }
                if (nextElement) {
                    nextElement = nextElement.nextElementSibling;
                    nextElement?.classList.remove(notVisibleClass);
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
 * CSS snippet to append to the head style when using the component.
 * @type { String }
 * @example
        document.querySelector("head style").textContent += pageCss;
 */
const pageCss = `    
    .column-holder {
        display:         flex;
        justify-content: center;
        align-items:     center
    }

    .column-loader {
        border: 4px solid transparent;
        border-left: 4px solid #ccc;
        border-top: 4px solid #ccc;
        border-radius: 50%;
        width: 40px;
        aspect-ratio: 1 / 1;
        animation: spin 1.5s linear infinite;
    }

    @keyframes spin {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }

    .${columnClassName} {
        position:       relative;
        width:          100%;
        /* max-width:      100%; */
        overflow-y:     scroll;
        overflow-x:     hidden;
        max-height:     ${boxHeight}px;
        min-height:     100%;
        padding:        5px;
        flex-grow:      2;
        flex-shrink:    1;

        &:not(:last-child) {
            border-right: 1px solid #ccc;
            flex-grow:      1;
        }
        
        &::after {
            content:             " ";
            width:              5px;
            right:              2px;
            background-color:   #ccc;
            border-radius:      5px;
            position:           absolute;
            z-index:            3;
        }

        /* styling for scroll bar */
        /* scrollbar-color: #ccc #fff; */
        scrollbar-color: transparent transparent;
        scrollbar-width: thin;
        
        &::-webkit-scrollbar {
            /* width:      4px; */
            width:      0;
        }

        &::-webkit-scrollbar-track {
        }
    
        &::-webkit-scrollbar-thumb {
            /* background-color: #ccc; */
            background-color: transparent;
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

        &.invisible {
            display:    none;
            content-visibility: auto;
        }

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
