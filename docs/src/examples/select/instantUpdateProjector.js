import { dom }                              from "../../kolibri/util/dom.js";
import { InputProjector }                   from "../../kolibri/projector/simpleForm/simpleInputProjector.js";
import { SimpleAttributeInputController }   from "../../kolibri/projector/simpleForm/simpleInputController.js";
import { SimpleInputModel }                 from "../../kolibri/projector/simpleForm/simpleInputModel.js";

export { projectListItem, selectListItemForModel, removeListItemForModel, projectDetail,  masterClassName, pageCss }

/**
 * A name that serves multiple purposes as it allows setting up specific css styling by using a consistent
 * style class name. It also facilitates creating unique identifiers within the generated views.
 * It should be unique among all css class names that are used in the application.
 * Future developers might want this information to be passed in from the outside to allow more flexibility.
 * @type { String }
 */
const masterClassName = 'instant-update-master';

/** @private */
const detailClassName = 'instant-update-detail';

/**
 * Returns a unique id for the html element that is to represent the attribute such that we can create the
 * element in a way that allows later retrieval when it needs to be removed.
 * The resulting String should follow the constraints for properly formatted html ids, i.e. not dots allowed.
 * @template _T_
 * @private
 * @pure
 * @param  { _T_ }      model
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
 * @param  { _T_ }        model
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
    const oldDeleteButton = root.querySelector("#" + deleteButtonId(oldModel));
    if (oldDeleteButton) {
        oldDeleteButton.classList.remove("selected");
    }
    const newDeleteButton = root.querySelector("#" + deleteButtonId(newModel));
    if (newDeleteButton) {
        newDeleteButton.classList.add("selected");
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
        deleteButton.parentElement.removeChild(deleteButton);               // remove delete button
    }
    const id = elementId(model);
    const spanElement = root.querySelector(`span[data-id=${id}]`);
    if ( spanElement) {                                                // remove all input elements of this row
        spanElement.parentElement.removeChild(spanElement);
    }
    const labelElement = root.querySelector(`label[for="${id}"]`);
    if (labelElement ){
        labelElement.parentElement.removeChild(labelElement);           // remove all label elements of this row
    }
};

/**
 * Creating the views and bindings for an item in the list view, binding for instant value updates.
 * @template _T_
 * @param { MasterDetailSelectionControllerType<_T_> }    componentController
 * @param { _T_ }                             model
 * @return { HTMLElement[] }
 */
const projectListItem = (componentController, model) => {

    const deleteButton      = document.createElement("Button");
    deleteButton.setAttribute("class","delete");
    deleteButton.innerHTML  = "&times;";
    deleteButton.onclick    = _ => componentController.removeMasterModel(model);
    deleteButton.id         = deleteButtonId(model);

    const elements          = [];

    const item = document.createElement("div");
    item.setAttribute("data-value",model.getValue());
    item.setAttribute("data-column",model.getColumn());
    item.innerHTML = model.getLabel();
    item.id = model.getId();
    item.onclick = e => {
        const option = componentController.getMasterList().filter(i => i.getId() === e.target.id)[0];
        if(model.getColumn() == 0){
            componentController.setSelectedDetailModel(option);
        } else {
            // todo change filter / do jump
        }
    };
    elements.push(item);
    
    return [ deleteButton, ...elements];
};



/**
 * Creating the views and bindings for an item in the list view, binding for instant value updates.
 * @template _T_
 * @param {SelectionControllerType<_T_>}    detailController
 * @param { HTMLElement }                   detailCard
 * @param { _T_ }                           model
 * @return { HTMLDivElement[] }
 */
const projectDetail = (componentController, detailCard, model) => {

    // create view
    const elements = dom(`
        <div class="${detailClassName}"> </div>
    `);
    /** @type { HTMLDivElement } */ const div = elements[0];

    const simpleInputModel = SimpleInputModel({
        label: model.getLabel(),
        value: model.getValue(),
        name: "testTodo",
    });
    const inputController = SimpleAttributeInputController(simpleInputModel);
    div.append(...InputProjector.projectInstantInput(inputController, detailClassName));

    return [ div ];
};

/**
 * CSS snippet to append to the head style when using the instant update projector.
 * @type { String }
 * @example
 * document.querySelector("head style").textContent += pageCss;
 */
const pageCss = `
    .${masterClassName} {
        display:        flex;
        gap:            1rem;
        align-items:    baseline;
        margin-bottom:  0.5em ;
    }
    .${detailClassName} {
        display:            block;
        margin-bottom:      0.5em ;
    }  
    .delete {
        background-color:   transparent;
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
    button.selected::before {
        content:            '';
        position:           absolute;        
        inset:              0 0 0 0;       
        background:         var(--kolibri-color-select);
        transform:          translateX(-100%);
        clip-path:          polygon(0 0, 100% 50%, 0 100%);
    }
    .hidden {
        display: none;
    }
`;
