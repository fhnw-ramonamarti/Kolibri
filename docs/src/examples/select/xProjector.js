import { selectionMold }       from "../../kolibri/projector/simpleForm/optionsModel.js";
import {
    projectDetail,
    projectListItem,
    masterClassName,
    removeListItemForModel,
    selectListItemForModel
}                              from "./instantUpdateProjector.js";

export { projectMasterView, projectDetailView }

/**
 * Create the master view, bind against the controllers, and return the view.
 * @impure - since we change the state of the controller. The DOM remains unchanged.
 * @template _T_
 * @param { MasterDetailSelectionControllerType<_T_> }      listController
 * @return { [HTMLDivElement] }          - master view
 */
const projectMasterView = (componentController) => {

    /** @type HTMLDivElement */ const rootElement = document.createElement("div");
    
    const renderRow = (option) => {
        const column = option.getColumn();
        if (null == rootElement.querySelector(`[data-column="${option.getColumn()}"]`)) {
            const columnContainer = document.createElement("div");
            columnContainer.classList.add("master-column");
            columnContainer.classList.add("master-column-" + column);
            columnContainer.setAttribute("data-column", column);
            rootElement.append(columnContainer);

            const sortedChildren = [...rootElement.children].sort(
                (a, b) => b.getAttribute("data-column") - a.getAttribute("data-column")
            )
            rootElement.replaceChildren(...sortedChildren);
        }
        const rowElements = projectListItem(componentController, option);
        rootElement.querySelector(`[data-column="${option.getColumn()}"]`).append(rowElements[1]);
        // componentController.setSelectedDetailModel(option);
    };

    rootElement.classList.add(masterClassName);
    // rootElement.style['grid-template-columns'] = '2em repeat(' + 1 + ', auto);';

    // binding
    componentController.onMasterModelAdd(renderRow);
    componentController.onMasterModelRemove( removedModel => {
        removeListItemForModel(rootElement)(removedModel);
        removedModel.setQualifier(undefined); // remove model attributes from model world
        componentController.clearDetailSelection();
    });
    componentController.onDetailModelSelected(selectListItemForModel(rootElement));

    return [rootElement];
};


/**
 * Create the detail view, bind against the detail controller, and return the view.
 * @template _T_
 * @impure - since we change the state of the controller. The DOM remains unchanged.
 * @param  { MasterDetailSelectionControllerType<_T_> } selectionController
 * @param  { HTMLElement }                detailCard - element that holds the detail view and can be folded away
 * @param  { HTMLElement }                masterListElement - element that holds the detail view and can be folded away
 * @return { [HTMLDivElement] }          - master view
 */
const projectDetailView = (componentController, detailCard, masterListElement) => {
    
    const detailElement = projectDetail(componentController, detailCard, selectionMold); // only once, view is stable, binding is stable

    componentController.onDetailModelSelected((selectedOptionModel) => {
        detailElement[0].querySelector("input").value = selectedOptionModel.getValue();
        // todo find better way
    });

    componentController.onVisibleChange(value => {
        masterListElement.classList.toggle("hidden", !value);
    });

    componentController.clearDetailSelection();

    detailElement[0].onclick = e => {
        componentController.setVisible(!componentController.isVisible());
    };

    return detailElement;
};
