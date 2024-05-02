
import { ListAndSelectionController, ListController, SelectionController } from "./xController.js";

import { pageCss }                              from "./instantUpdateProjector.js";
import { projectDetailView, projectMasterView } from "./xProjector.js";
import { Option, selectionMold }                from "../../kolibri/projector/simpleForm/optionsModel.js";

const listController      = ListController();
const selectionController = SelectionController(selectionMold);
const componentController = ListAndSelectionController(listController, selectionController);

// create the sub-views, incl. binding

const master = projectMasterView(componentController);
const masterContainer = document.getElementById('masterContainer')
masterContainer.append(...master);

const detail = projectDetailView(componentController, document.getElementById('detailCard'), masterContainer);
document.getElementById('detailContainer').append(...detail);

document.querySelector("head style").textContent += pageCss;
// binding of the main view

[
    Option("Option 1")(),
    Option("Option 2")(),
    Option("Option 3")(),
    Option("Option 4")(),
    Option("Option 5")(),
    Option("Option 6")(),
    Option("Option 7")(),
].forEach((e) => {
    componentController.addMasterModel(e);
});