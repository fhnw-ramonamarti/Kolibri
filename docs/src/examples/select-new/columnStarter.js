import { OptionsController, SelectedOptionController } from "./optionsController.js";
import { projectColumnOptionsView, pageCss }           from "./columnOptionsProjector.js";
import { ValueOption }                                 from "./optionsModel.js";

const optionsController = OptionsController();
const selectedOptionController = SelectedOptionController();
const cursorPositionController = SelectedOptionController();

const columnView = projectColumnOptionsView(
    optionsController,
    selectedOptionController,
    cursorPositionController
);
document.getElementById("component").append(...columnView);

const selectedValue = ValueOption("selected");
optionsController.addOption(selectedValue);
optionsController.addOption(ValueOption("val 1"));
optionsController.addOption(ValueOption("val 2"));
optionsController.addOption(ValueOption("val 3"));
optionsController.addOption(ValueOption("val 4"));
optionsController.addOption(ValueOption("val 5"));
optionsController.addOption(ValueOption("val 6"));
optionsController.addOption(ValueOption("val 7"));
optionsController.addOption(ValueOption("val 8"));
optionsController.addOption(ValueOption("val 9"));

selectedOptionController.setSelectedOption(selectedValue);

document.querySelector("head style").textContent += pageCss;
