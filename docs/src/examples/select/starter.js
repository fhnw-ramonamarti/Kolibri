
import { ListAndSelectionController, ListController, SelectionController } from "./xController.js";

import { pageCss }                              from "./instantUpdateProjector.js";
import { projectDetailView, projectMasterView } from "./xProjector.js";
import { Option, selectionMold }                from "../../kolibri/projector/simpleForm/optionsModel.js";

const listController      = ListController();
const selectionController = SelectionController(selectionMold);
const componentController = ListAndSelectionController(listController, selectionController);

// create the sub-views, incl. binding
const master = projectMasterView(componentController);
const detail = projectDetailView(componentController, master[0]);
document.getElementById('component').append(...detail,...master);

document.querySelector("head style").textContent += pageCss;

// add selection data // todo move to projector / conteroller
[
    Option("Option 1")(),
    Option("Option 2")(),
    Option("Option 3")(),
    Option("Option 4")(),
    Option("Option 5")(),
    Option("Option 6")(),
    Option("Option 7")(),
    Option("Option 8")(),
    Option("Option 9")(),
    Option("Option 10")(),
    Option("Option 11")(),
    Option("Option 12")(),
    Option("Option 13")(),
    Option("Option 14")(),
    Option("Option 15")(),
].forEach((e) => {
    componentController.addMasterModel(e);
});