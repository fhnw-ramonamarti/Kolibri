import { dom }                              from "../../kolibri/util/dom.js";
import { InputProjector }                   from "../../kolibri/projector/simpleForm/simpleInputProjector.js";
import { SimpleAttributeInputController }   from "../../kolibri/projector/simpleForm/simpleInputController.js";
import { SimpleInputModel }                 from "../../kolibri/projector/simpleForm/simpleInputModel.js";

export { projectListItem, selectListItemForModel, removeListItemForModel, projectSelectedValueOption,  masterClassName, pageCss }

/**
 * A name that serves multiple purposes as it allows setting up specific css styling by using a consistent
 * style class name. It also facilitates creating unique identifiers within the generated views.
 * It should be unique among all css class names that are used in the application.
 * Future developers might want this information to be passed in from the outside to allow more flexibility.
 * @type { String }
 */
const masterClassName = 'selection-instant-update-master';

/** @private */
const detailClassName = 'selection-instant-update-detail';

/**
 * Returns a unique id for the html element that is to represent the attribute such that we can create the
 * element in a way that allows later retrieval when it needs to be removed.
 * The resulting String should follow the constraints for properly formatted html ids, i.e. not dots allowed.
 * @template _T_
 * @private
 * @pure
 * @param  { _T_ }     model
 * @return { String }
 */
const elementId = (model) =>
    (masterClassName + "-" + model.getId()).replaceAll("\.","-");

/**
 * Returns a unique id for the html delete button that is to represent the model such that we can create the
 * element in a way that allows later retrieval when it needs to be removed.
 * The resulting String should follow the constraints for properly formatted html ids, i.e. not dots allowed.
 * @template _T_
 * @private
 * @pure
 * @param  { _T_ }    model
 * @return { String }
 */
const deleteButtonId = (model) => {
    return (masterClassName + "-delete-" + model.getId()).replaceAll("\.","-");
};

/**
 * When a selection changes, the change must become visible in the master view.
 * The old selected model must be deselected, the new one selected.
 * @template _T_
 * @param { HTMLElement } root
 * @return { (newModel:_T_, oldModel:_T_) => void}
 */
const selectListItemForModel = (root) => (newModel, oldModel) => {
    const oldItem = root.querySelector("#" + elementId(oldModel));
    if (oldItem) {
        oldItem.classList.remove("selected");
    }
    const newItem = root.querySelector("#" + elementId(newModel));
    if (newItem) {
        newItem.classList.add("selected");
    }
};

/**
 * When a model is removed from the master view, the respective view elements must be removed as well.
 * @template _T_
 * @param { HTMLElement } root
 * @return { (model:_T_) => void }
 */
const removeListItemForModel = (root) => model => {
    const deleteButton = root.querySelector("#" + deleteButtonId(model));
    if (deleteButton) {
        deleteButton.parentElement.removeChild(deleteButton);          // remove delete button
    }
    const id = elementId(model);
    const optionElement = root.querySelector(`[data-id=${id}]`);
    if (optionElement) {                                                // remove all input elements of this row
        optionElement.parentElement.removeChild(optionElement);
    }
};

/**
 * Creating the views and bindings for an item in the list view, binding for instant value updates.
 * @param { MasterSelectionControllerType } componentController
 * @param { OptionType }                    model
 * @return { HTMLElement[] }
 */
const projectListItem = (componentController, model) => {

    const deleteAction = (_) => {
        if(model.getColumn() === 0){
            componentController.removeValueOptionsModel(model);
        } else {
            componentController.removeCategoryOptionsModel(model);
        }
    };

    const deleteButton      = document.createElement("Button");
    deleteButton.setAttribute("class","delete");
    deleteButton.innerHTML  = "&times;";
    deleteButton.onclick    = deleteAction
    deleteButton.id         = deleteButtonId(model);

    const elements          = [];

    const item = document.createElement("div");
    item.setAttribute("data-id",elementId(model));
    item.setAttribute("data-value",model.getValue());
    item.setAttribute("data-column", `${model.getColumn()}`);
    item.classList.add("select-item"); // todo better name
    if (model.getColumn() > 0) {
        item.classList.add("category-option-item"); // todo better name
    } else {
        item.classList.add("value-option-item"); // todo better name
    }
    item.innerHTML = model.getLabel();
    item.id = elementId(model);
    item.onclick = e => {
        const option = componentController.getAllOptions().filter(i => elementId(i) === e.target.id)[0];
        if(model.getColumn() === 0){
            componentController.setSelectedOptionModel(option);
        } else {
            componentController.toggleSelectedCategoryOptionsModel(option);
        }
        //on mouse over hole options und dann options aufs highlighted setze setHighlightedOptionModel(option)
    };
    elements.push(item);
    
    return [ deleteButton, ...elements];
};



/**
 * Creating the views and bindings for an item in the detail view, binding for instant value updates.
 * @template _T_
 * @param { MasterSelectionControllerType } componentController
 * @param { OptionType }                    model
 * @return { HTMLDivElement[] }
 */
const projectSelectedValueOption = (componentController, model) => {
    // todo make input hidden (think about aria) and show content in some container due for imgs
    // create view
    const elements = dom(`
        <div class="${detailClassName}"> </div>
    `);
    /** @type { HTMLDivElement } */ const div = elements[0];

    const simpleInputModel = SimpleInputModel({
        label: componentController.getLabel(),
        value: model.getValue(),
        name: componentController.getName(),
    });
    const inputController = SimpleAttributeInputController(simpleInputModel);
    div.append(...InputProjector.projectInstantInput(inputController, detailClassName));
    
    const clearButton = document.createElement("button");
    clearButton.setAttribute("class","clear");
    clearButton.innerHTML  = "&times;";
    clearButton.onclick = () => {
        componentController.clearOptionSelection();
        componentController.clearCategoryOptionsSelection();
    };
    div.querySelector("div > span").append(clearButton);

    return [ div ];
};

/** 
 * Height of the master list box
 * @private
 */
const boxHeight = 240;

/**
 * CSS snippet to append to the head style when using the instant update projector.
 * @type { String }
 * @example
 * document.querySelector("head style").textContent += pageCss;
 */ /* todo style border*/
const pageCss = `
    .${masterClassName} {
        display:        flex;
        gap:            5px;
        align-items:    baseline;
        margin-bottom:  0.5em;
        width:          100%;
        max-height:     ${boxHeight}px;
        border:         1px solid #ccc; /* todo */
        border-radius: 4px;
    }
    .${detailClassName} {
        position:       relative;
        display:        block;
        margin-bottom:  0.5em;
        width:          100%;

        > span {
            border:    1px solid #ccc; /* todo */
            border-radius: 4px;
        }

        input,
        > span {
            height:     2rem;
            width:      100%;
            display:    block;
            font-size:  1em;
        }
    }
    .select-column {
        width:          fit-content;
        overflow:       scroll;
        height:         ${boxHeight}px;
    }
    .select-item {
        width:          100%;
        padding:        0.2em 0.5em;
    }
    .selected {
        background-color:   var(--kolibri-color-select);
    }
    .highlighted {
        /*border-left: var(--kolibri-color-accent) solid 2px;*/
    }
    .clear {
        background-color:   transparent;
        position:           absolute;
        top:                0;
        right:              0;
        border:             none;
        color:              var(--kolibri-color-accent);
        font-size:          1.3em;
    }    
    .card h1 {
        font-family:        var(--font-sans-serif);
        margin-top:         0;
    }
    
    button.selected {
        position:           relative;
    }    
   
    .hidden {
        display: none;
    }
    .dropdown {
        position: relative;
        width: 100%;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        border-radius: 4px;
    }

    .dropdown .selected {
        padding: 10px;
        background: #fff;
        border: 1px solid #cccccc;
        cursor: pointer;
    }

    .dropdown .selected:hover {
        background-color: #f9f9f9;
    }

    .dropdown .options-container {
        position: absolute;
        top: 100%;
        left: 0;
        width: 100%;
        background: #fff;
        border: 4px solid #ccc;
        border-top: none;
        z-index: 2;
        display: none;
    }

    .dropdown.active .options-container {
        display: block;
    }

    .dropdown .option {
        padding: 10px;
        cursor: pointer;
    }

    .dropdown .option.selected {
        background-color: #ddd;
    }

    .select-item{
        position: relative;
    }

    .select-item.selected {
        background-color: #FFDB8E;
        border-radius: 4px;
    }
    .select-item.category-option-item:last-child {
        border-bottom: none;
    }

    .select-item:hover::after {
        content: '';
        position: absolute;
        left: 10px;
        bottom: 10px;
        top: 10px;
        transform: translateX(-50%);
        width: 2.5px;
        /*height: 20px;*/
        background-color: #E11161;
        border-radius: 1px;
    }
    .select-item{
        padding: 10px 20px;
        display: block;
        cursor: pointer;
        position: relative;
    }
`;
