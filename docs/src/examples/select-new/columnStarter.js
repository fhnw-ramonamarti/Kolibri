import { OptionsController, SelectedOptionController } from "./optionsController.js";
import { projectColumnOptionsView, pageCss }           from "./columnOptionsProjector.js";
import { CategoryOption, ValueOption }                 from "./optionsModel.js";


// value option example
const optionsController        = OptionsController();
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


// category option example
const optionsController2        = OptionsController();
const selectedOptionController2 = SelectedOptionController();
const cursorPositionController2 = SelectedOptionController();

const columnCatView = projectColumnOptionsView(
    optionsController2,
    selectedOptionController2,
    cursorPositionController2
);
document.getElementById("componentCat").append(...columnCatView);

const selectedCat = CategoryOption("selected");
optionsController2.addOption(selectedCat);
optionsController2.addOption(CategoryOption("cat 1"));
optionsController2.addOption(CategoryOption("cat 2"));
optionsController2.addOption(CategoryOption("cat 3"));

selectedOptionController2.setSelectedOption(selectedCat);

document.querySelector("head style").textContent += pageCss;
