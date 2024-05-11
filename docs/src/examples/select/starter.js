
import { MasterSelectionController }                          from "./xController.js";
import { projectSelectedValueOptionView, projectOptionsView } from "./xProjector.js";
import { pageCss }                                            from "./instantUpdateProjector.js";

/** @type { MasterSelectionAttribut } */
const masterSelectionAttributes = {
    name : "menu",
    label: "Menu",
    value: "",
};
/** @type { OptionDataType } */
const options = {
    values: [
        {value: "green salad", categoryLabels: ["salad","vegetarian","vegan","glutenfree",]},
        {value: "mixed salad", categoryLabels: ["salad","vegetarian","glutenfree",]},
        {value: "noodles bolognese", categoryLabels: ["pasta",]},
        {value: "spaghetti pesto", categoryLabels: ["pasta","vegetarian",]},
        {value: "spaghetti napoli", categoryLabels: ["pasta","vegetarian",]},
        {value: "penne carbonarra", categoryLabels: ["pasta",]},
        {value: "pizza margarita", categoryLabels: ["pizza","vegetarian",]},
        {value: "pizza salami", categoryLabels: ["pizza",]},
        {value: "pizza fungi", categoryLabels: ["pizza","vegetarian",]},
        {value: "pizza quarto formagi", categoryLabels: ["pizza","vegetarian",]},
        {value: "french fries", categoryLabels: ["vegetarian","vegan",]},
        {value: "egg sandwich", categoryLabels: ["vegetarian",]},
        {value: "ham sandwich"},
        {value: "salami sandwich"},
    ],
    categories: [
        {label: "salad", column: 1},
        {label: "pizza", column: 1},
        {label: "pasta", column: 1},
        {label: "vegetarian", column: 1},
        {label: "vegan", column: 1},
        {label: "glutenfree", column: 1},
    ],
}
const componentController = MasterSelectionController(masterSelectionAttributes, options);

// create the sub-views, incl. binding
const allOptions     = projectOptionsView(componentController);
const selectedOption = projectSelectedValueOptionView(componentController, allOptions[0]);
document.getElementById('component').append(...selectedOption,...allOptions);

document.querySelector("head style").textContent += pageCss;
