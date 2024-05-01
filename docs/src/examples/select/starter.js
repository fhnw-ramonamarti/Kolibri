
import { ListController, SelectionController } from "./xController.js";
import { selectionMold }                       from "./xProjector.js";

import { pageCss }                              from "./instantUpdateProjector.js";
import { projectDetailView, projectMasterView } from "./xProjector.js";
import { Option }                               from "../../kolibri/projector/simpleForm/optionsModel.js";

const listController      = ListController();
const selectionController = SelectionController(selectionMold);

// create the sub-views, incl. binding

const master = projectMasterView(listController, selectionController, );
document.getElementById('masterContainer').append(...master);

const detailForm = projectDetailView(selectionController, document.getElementById('detailCard'));
document.getElementById('detailContainer').append(...detailForm);

document.querySelector("head style").textContent += pageCss;
// binding of the main view

[
    Option("Option 1"),
    Option("Option 2"),
    Option("Option 3"),
    Option("Option 4"),
    Option("Option 5"),
    Option("Option 6"),
    Option("Option 7"),
].forEach(e=>{
    listController.addModel(e);
});