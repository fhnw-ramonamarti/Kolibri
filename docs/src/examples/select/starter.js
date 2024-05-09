
import { MasterSelectionController }                          from "./xController.js";
import { projectSelectedValueOptionView, projectOptionsView } from "./xProjector.js";
import { pageCss }                                            from "./instantUpdateProjector.js";

const masterSelectionAttributes = {
    name : "",
    label: "",
    value: "",
};
const options = {
    values: [
        {value: "val1", label: "Label 1", categoryLabels: ["Cat 1", "Cat 2"]},
        {value: "val2", label: "Label 2", categoryLabels: ["Cat 1", "Cat 3"]},
        {value: "val3", label: "Label 3", categoryLabels: ["Cat 2"]},
        {value: "val4", label: "Label 4", categoryLabels: ["Cat 2"]},
        {value: "val5", label: "Label 5", categoryLabels: ["Cat 3"]},
        {value: "val6", label: "Label 6"},
    ],
    categories: [
        {label: "Cat 1", column: 1},
        {label: "Cat 2", column: 1},
        {label: "Cat 3", column: 1},
    ],
}
const componentController = MasterSelectionController(masterSelectionAttributes, options);

// create the sub-views, incl. binding
const allOptions     = projectOptionsView(componentController);
const selectedOption = projectSelectedValueOptionView(componentController, allOptions[0]);
document.getElementById('component').append(...selectedOption,...allOptions);

document.querySelector("head style").textContent += pageCss;
