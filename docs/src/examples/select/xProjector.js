import { reset }                from "../../kolibri/projector/simpleForm/simpleInputModel.js";
import {
    projectForm,
    projectListItem,
    masterClassName,
    removeListItemForModel,
    selectListItemForModel
}                              from "./instantUpdateProjector.js";

export { projectMasterView, projectDetailView, selectionMold }

/**
 * Create the master view, bind against the controllers, and return the view.
 * @impure - since we change the state of the controller. The DOM remains unchanged.
 * @template _T_
 * @param { ListControllerType<_T_> }      listController
 * @param { SelectionControllerType<_T_> } selectionController
 * @return { [HTMLDivElement] }          - master view
 */
const projectMasterView = (listController, selectionController) => {

    /** @type HTMLDivElement */ const rootElement = document.createElement("div");

    const renderRow = option => {
        const rowElements = projectListItem(listController, selectionController, option);
        rootElement.append(rowElements[1]);
        // selectionController.setSelectedModel(option);
    };

    rootElement.classList.add(masterClassName);
    // rootElement.style['grid-template-columns'] = '2em repeat(' + 1 + ', auto);';

    // binding
    listController.onModelAdd(renderRow);
    listController.onModelRemove( removedModel => {
        removeListItemForModel(rootElement)(removedModel);
        removedModel.setQualifier(undefined); // remove model attributes from model world
        selectionController.clearSelection();
    });
    selectionController.onModelSelected(selectListItemForModel(rootElement));

    return [rootElement];
};


/**
 * Create the detail view, bind against the detail controller, and return the view.
 * @template _T_
 * @impure - since we change the state of the controller. The DOM remains unchanged.
 * @param  { SelectionControllerType<_T_> } selectionController
 * @param  { HTMLElement }                detailCard - element that holds the detail view and can be folded away
 * @return { [HTMLFormElement] }          - master view
 */
const projectDetailView = (selectionController, detailCard) => {

    const form = projectForm(selectionController, detailCard, selectionMold); // only once, view is stable, binding is stable

    selectionController.onModelSelected((selectedPersonModel) => {
        console.log(selectedPersonModel.getValue());
        form[0].querySelector("input").value = selectedPersonModel.getValue();
    });

    selectionController.clearSelection();

    return form;
};


/**
 * Used for selection input
 */
const selectionMold = reset();