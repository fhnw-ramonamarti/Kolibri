import { CategoryOption, ValueOption }                        from "./optionsModel.js";
import { SelectController }                                   from "./selectController.js";
import { projectOptionsView, projectSelectedValueOptionView } from "./selectProjector.js";
import { pageCss as pageCssColumn }                           from "./columnOptionsProjector.js";
import { pageCss as pageComponentCss }                        from "./selectProjector.js";

export { SelectComponent, pageCss };


// todo type for service cb retrun string or object

/**
 * at the moment max 2 columns
 * @param { SelectAttribute } selectAttribute
 * @param { Array<(String) => Array<String>> } columnCbs
 * @return { SelectControllerType }
 * @constructor
 */
const SelectComponent = (selectAttribute, columnCbs) => {
    const selectController = SelectController(selectAttribute);
    const allOptions       = projectOptionsView(selectController);
    const selectedOption   = projectSelectedValueOptionView(selectController);
    document.getElementById("component").append(...selectedOption, ...allOptions);

    columnCbs.forEach((cb, col) => {
        cb().forEach(e => {
            console.log(e, cb(), col);
            const option = col ? mapToCategoryOption(e) : mapToValueOption(e, e);
            selectController.getColumnOptionsComponent(col).addOption(option);
        });
        console.log();
    });

    selectController.getColumnOptionsComponent(0).onOptionSelected(option => {
        selectedOption[0].innerHTML = option.getLabel();
    });

    selectController.getColumnOptionsComponent(1).onOptionSelected(option => {
        const selectedOption = selectController.getColumnOptionsComponent(0).getSelectedOption();
        const options = columnCbs[0](option.getLabel()).map(value => mapToValueOption(value));
        selectController.getColumnOptionsComponent(0).replaceOptions(options);
        if (!options.map(o => o.getValue()).includes(selectedOption.getValue())) {
            selectController.clearSelectedValueOption();
        }
    });
}

const mapToValueOption = (value, label) => {
    return ValueOption(value, label);
}

const mapToCategoryOption = (label) => {
    return CategoryOption(label);
}

/**
 * CSS snippet to append to the head style when using the instant update projector.
 * @type { String }
 * @example
 * document.querySelector("head style").textContent += pageCss;
 */
const pageCss = pageCssColumn + "\n" + pageComponentCss;