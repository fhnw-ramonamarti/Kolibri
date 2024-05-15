import { getDecades, getYearsByDecade }                                from "./DataService.js";
import { CategoryOption, ValueOption, reset }                                 from "./optionsModel.js";
import { SelectController }                                            from "./selectController.js";
import { pageCss, projectOptionsView, projectSelectedValueOptionView } from "./selectProjector.js";
import { pageCss as pageCssColumn }                                    from "./columnOptionsProjector.js";

const selectAttribute = {
    name: "",
    label: "",
    numberColumns: 2
};
const selectController = SelectController(selectAttribute);
const allOptions       = projectOptionsView(selectController);
const selectedOption   = projectSelectedValueOptionView(selectController);
document.getElementById("component").append(...selectedOption, ...allOptions);

const dataCol0 = getYearsByDecade();
const dataCol1 = getDecades();

dataCol0.forEach(e => {
    const option = ValueOption(e);
    selectController.getColumnOptionsComponent(0).addOption(option);
});
dataCol1.forEach(e => {
    const option = CategoryOption(e);
    selectController.getColumnOptionsComponent(1).addOption(option);
});

selectController.getColumnOptionsComponent(0).onOptionSelected(option => {
    selectedOption[0].innerHTML = option.getLabel();
});

selectController.getColumnOptionsComponent(1).onOptionSelected(option => {
    const selectedOption = selectController.getColumnOptionsComponent(0).getSelectedOption();
    const options = getYearsByDecade(option.getLabel()).map(value => ValueOption(value));
    selectController.getColumnOptionsComponent(0).replaceOptions(options);
    if (!options.map(o => o.getValue()).includes(selectedOption.getValue())) {
        selectController.clearSelectedValueOption();
    }
});

document.querySelector("head style").textContent += pageCssColumn;
document.querySelector("head style").textContent += pageCss;
