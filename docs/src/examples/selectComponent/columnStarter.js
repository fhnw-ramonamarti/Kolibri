import { ColumnOptionsComponent }      from "../../kolibri/projector/selectComponent/columnOptionsComponent.js";
import { SelectedOptionController }    from "../../kolibri/projector/selectComponent/optionsController.js";
import { pageCss }                     from "../../kolibri/projector/selectComponent/columnOptionsProjector.js";
import { CategoryOption, ValueOption } from "../../kolibri/projector/selectComponent/optionsModel.js";


// value option example
const cursorPositionController = SelectedOptionController();
const component                = ColumnOptionsComponent(cursorPositionController);

const columnView = component.getColumnView();
document.getElementById("component").append(columnView);

const selectedValue = /** @type { OptionType } */ ValueOption("selected");
const options       = /** @type { Array<OptionType> } */ [
    selectedValue,
    ValueOption("val 1"),
    ValueOption("val 2"),
    ValueOption("val 3"),
    ValueOption("val 4"),
    ValueOption("val 5"),
    ValueOption("val 6"),
    ValueOption("val 7"),
    ValueOption("val 8"),
    ValueOption("val 9"),
];
component.addOptions(options);
component.setSelectedOption(selectedValue);

// category option example
const cursorPositionController2 = SelectedOptionController();
const component2                = ColumnOptionsComponent(cursorPositionController2);

const columnCatView = component2.getColumnView();
document.getElementById("componentCat").append(columnCatView);

const selectedCat = CategoryOption("selected");
const catOptions  = /** @type { Array<OptionType> } */ [
    selectedCat,
    CategoryOption("cat 1"),
    CategoryOption("cat 2"),
    CategoryOption("cat 3"),
];
component2.addOptions(catOptions);
component2.setSelectedOption(/** @type { OptionType } */ selectedCat);


document.querySelector("head style").textContent += pageCss;
