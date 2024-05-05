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
 * Create the master view, bind against the controller, and return the view.
 * @impure - since we change the state of the controller. The DOM remains unchanged.
 * @template _T_
 * @param { MasterDetailSelectionControllerType<_T_> } componentController
 * @return { [HTMLDivElement] } - master view
 */
const projectMasterView = (componentController) => {

    /** @type HTMLDivElement */ const rootElement = document.createElement("div");
    rootElement.id = "masterContainer";
    
    const renderRow = (option) => {
        const column = option.getColumn();
        if (null == rootElement.querySelector(`[data-column="${option.getColumn()}"]`)) {
            // create new column if not existing
            const columnContainer = document.createElement("div");
            columnContainer.classList.add("master-column");
            columnContainer.classList.add("master-column-" + column);
            columnContainer.setAttribute("data-column", column);
            columnContainer.classList.add("select-column");
            rootElement.append(columnContainer);

            // order columns descending in DOM
            const sortedChildren = [...rootElement.children].sort(
                (a, b) => b.getAttribute("data-column") - a.getAttribute("data-column")
            )
            rootElement.replaceChildren(...sortedChildren);
        }
        // INFO: delete buttton / first element not in use yet
        const [_, rowElement] = projectListItem(componentController, option);
        rootElement.querySelector(`[data-column="${option.getColumn()}"]`).append(rowElement);
    };

    rootElement.classList.add(masterClassName);

    // binding
    componentController.onMasterCategoryModelAdd(renderRow);
    componentController.onMasterCategoryModelRemove( removedModel => {
        removeListItemForModel(rootElement)(removedModel);
        componentController.clearOptionSelection();
    });
    componentController.onMasterOptionModelAdd(renderRow);
    componentController.onMasterOptionModelRemove( removedModel => {
        removeListItemForModel(rootElement)(removedModel);
        componentController.clearOptionSelection();
    });
    componentController.onOptionModelSelected(selectListItemForModel(rootElement));

    return [rootElement];
};


/**
 * Create the detail view, bind against the controller, and return the view.
 * @template _T_
 * @impure - since we change the state of the controller. The DOM remains unchanged.
 * @param  { MasterDetailSelectionControllerType<_T_> } componentController
 * @param  { HTMLElement }                              masterListElement - master container element to toggle in view
 * @return { [HTMLDivElement] } - detail view
 */
const projectDetailView = (componentController, masterListElement) => {
    
    const detailElement = projectDetail(componentController, selectionMold); // only once, view is stable, binding is stable
    detailElement.id = "detailContainer";

    componentController.clearOptionSelection();

    // bindings
    componentController.onOptionModelSelected((selectedOptionModel) => {
        detailElement[0].querySelector("input").value = selectedOptionModel.getValue();
        // todo find better way
    });
    componentController.onMasterVisibilityChange(value => {
        masterListElement.classList.toggle("hidden", !value);
    });
    detailElement[0].onclick = e => {
        componentController.setMasterVisibility(!componentController.isVisible());
    };

    return detailElement;
};
