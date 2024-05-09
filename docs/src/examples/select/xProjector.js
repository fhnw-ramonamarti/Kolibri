import { selectionMold }       from "../../kolibri/projector/simpleForm/optionsModel.js";
import {
    projectSelectedValueOption,
    projectListItem,
    masterClassName,
    removeListItemForModel,
    selectListItemForModel
}                              from "./instantUpdateProjector.js";

export { projectOptionsView, projectSelectedValueOptionView }

/**
 * Create the master view, bind against the controller, and return the view.
 * @impure - since we change the state of the controller. The DOM remains unchanged.
 * @template _T_
 * @param { MasterSelectionControllerType<_T_> } componentController
 * @return { [HTMLDivElement] } - master view
 */
const projectOptionsView = (componentController) => {

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
    componentController.onCategoryOptionsModelAdd(renderRow);
    componentController.onCategoryOptionsModelRemove( removedModel => {
        removeListItemForModel(rootElement)(removedModel);
        componentController.clearOptionSelection();
    });
    componentController.onValueOptionsModelAdd(renderRow);
    componentController.onValueOptionsModelRemove( removedModel => {
        removeListItemForModel(rootElement)(removedModel);
        componentController.clearOptionSelection();
    });
    componentController.onOptionModelHighlighted((highlightOption) => {
        if(!highlightOption.getId().includes("none")){
            rootElement.querySelector(`.highlighted`)?.classList?.remove("highlighted");
            rootElement.querySelector(`[id*="${highlightOption.getId().replace(".","-")}"]`).classList.add("highlighted");
        }
    });
    componentController.onOptionModelSelected((newSelectedModel, oldSelectedModel) => {
        selectListItemForModel(rootElement)(newSelectedModel, oldSelectedModel);
        componentController.setHighlightOptionModel(newSelectedModel);
    });
    componentController.onSelectedCategoryOptionsModelAdd(addModel => {
        componentController.setHighlightOptionModel(addModel);
        rootElement.querySelectorAll(`[data-column="${addModel.getColumn()}"].category-option-item`).forEach(element => {
            if(element.innerHTML.includes(addModel.getLabel())){
                element.classList.add('selected');
            }
        });
        componentController
            .getAllOptions()
            .filter((o) => o.getColumn() < addModel.getColumn())
            .forEach((option) => {
                if (!option.getCategories().includes(addModel.getLabel())) {
                    removeListItemForModel(rootElement)(option);
                    if(componentController.getSelectedOptionModel() === option){
                        componentController.clearOptionSelection();
                    }
                }
            });
    });
    componentController.onSelectedCategoryOptionsModelRemove((removeModel) => {
        componentController.setHighlightOptionModel(removeModel);
        rootElement.querySelectorAll(`[data-column="${removeModel.getColumn()}"].category-option-item.selected`).forEach(element => {
            element.classList.remove('selected');
        });
        componentController
            .getAllOptions()
            .filter((o) => o.getColumn() < removeModel.getColumn())
            .forEach((option) => {
                if (!option.getCategories().includes(removeModel.getLabel())) {
                    renderRow(option);
                }
            });
        // sort options as in ops list // todo later think about sorting
        const pos = (element) =>
            componentController
                .getAllOptions()
                .map((option) => option.getLabel())
                .indexOf(element.innerHTML);
        [...Array(removeModel.getColumn()).keys()].forEach((col) => {
            const container = rootElement.querySelector(`[data-column="${col}"]`);
            const content = [...container.childNodes].sort((a, b) =>
                (pos(a) < pos(b) ? -1 : (pos(a) > pos(b) ? 1 : 0))
            );
            container.innerHTML = "";
            container.append(...content);
        });
    });

    // project init 
    componentController.getAllOptions().forEach((option) => {
        renderRow(option);
    });

    return [rootElement];
};


/**
 * Create the detail view, bind against the controller, and return the view.
 * @template _T_
 * @impure - since we change the state of the controller. The DOM remains unchanged.
 * @param  { MasterSelectionControllerType<_T_> } componentController
 * @param  { HTMLElement }                              masterListElement - master container element to toggle in view
 * @return { [HTMLDivElement] } - detail view
 */
const projectSelectedValueOptionView = (componentController, masterListElement) => {
    
    const detailElement = projectSelectedValueOption(componentController, selectionMold); // only once, view is stable, binding is stable
    detailElement.id = "detailContainer";

    componentController.clearOptionSelection();
    componentController.clearSelectedCategoryOptionsSelection();

    // bindings
    componentController.onOptionModelSelected((selectedOptionModel) => {
        detailElement[0].querySelector("input").value = selectedOptionModel.getValue();
        // todo find better way
    });
    componentController.onOptionsVisibilityChange(value => {
        masterListElement.classList.toggle("hidden", !value);
    });
    detailElement[0].querySelector("span[data-id]").onclick = _ => {
        componentController.setOptionsVisibility(!componentController.isOptionsVisible());
    };

    return detailElement;
};
