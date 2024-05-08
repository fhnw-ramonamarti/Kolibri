
import { MasterSelectionController } from "./xController.js";

import { pageCss }                              from "./instantUpdateProjector.js";
import { projectDetailView, projectMasterView } from "./xProjector.js";

const componentController = MasterSelectionController();

// create the sub-views, incl. binding
const master = projectMasterView(componentController);
const detail = projectDetailView(componentController, master[0]);
document.getElementById('component').append(...detail,...master);

document.querySelector("head style").textContent += pageCss;

// add selection data // todo move to projector / conteroller
[
    {value: "Option 1", categoryLabels: ["Label 1", "Label 2"]},
    {value: "Option 2", categoryLabels: ["Label 1", "label 2"]},
    {value: "Option 3", categoryLabels: ["Label 1", "Label 3"]},
    {value: "Option 4", categoryLabels: ["Label 1"]},
    {value: "Option 5", categoryLabels: ["Label 2"]},
    {value: "Option 6", categoryLabels: ["Label 3"]},
    {value: "Option 7", categoryLabels: ["Label 2"]},
    {value: "Option 8", categoryLabels: ["Label 1"]},
    {value: "Option 9", categoryLabels: ["Label 2"]},
    {value: "Option 10"},
    {value: "Option 11"},
    {value: "Option 12"},
    {value: "Option 13"},
    {value: "Option 14"},
    {value: "Option 15"},
].forEach((e) => {
    componentController.addValueOptionsModel(e);
});
[
    {label: "Label 1", column: 1, categoryLabels: ["Label 3"]},
    {label: "Label 2", column: 1},
    // {label: "Label 3", column: 2},
].forEach((e) => {
    componentController.addCategoryOptionsModel(e);
});