
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
    {value: "Option 1"},
    {value: "Option 2"},
    {value: "Option 3"},
    {value: "Option 4"},
    {value: "Option 5"},
    {value: "Option 6"},
    {value: "Option 7"},
    {value: "Option 8"},
    {value: "Option 9"},
    {value: "Option 10"},
    {value: "Option 11"},
    {value: "Option 12"},
    {value: "Option 13"},
    {value: "Option 14"},
    {value: "Option 15"},
].forEach((e) => {
    componentController.addValueOptionsModel(e);
});
// [
//     {label: "Label 1", column: 1},
//     {label: "Label 2", column: 1},
//     {label: "Label 3", column: 1},
//     {label: "Label 4", column: 2},
//     {label: "Label 5", column: 2},
// ].forEach((e) => {
//     componentController.addCategoryOptionsModel(e);
// });