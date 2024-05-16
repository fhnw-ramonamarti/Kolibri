import { CategoryOption, ValueOption }                     from "./optionsModel.js";
import { SelectController }                                from "./selectController.js";
import { projectSelectViews, pageCss as pageComponentCss } from "./selectProjector.js";
import { pageCss as pageCssColumn }                        from "./columnOptionsProjector.js";

export { SelectComponent, pageCss };


// todo type for service cb rerun string or object

/**
 * at the moment max 2 columns
 * @param { SelectAttribute }                  selectAttribute
 * @param { Array<(String) => Array<String|{label: String, value: String}>> } columnCbs
 * @return { [HTMLElement] }
 * @constructor
 */
const SelectComponent = (selectAttribute, columnCbs) => {
    const selectController              = SelectController(selectAttribute);
    const [component, selectionElement] = projectSelectViews(selectController);

    columnCbs.forEach((cb, col) => {
        cb().forEach(e => {
            const option = col !== 0 ? mapToCategoryOption(e) : mapToValueOption(e?.value ?? e, e?.label ?? e);
            selectController.getColumnOptionsComponent(col).addOption(option);
        });
    });

    selectController.getColumnOptionsComponent(0).onOptionSelected(option => {
        selectionElement.innerHTML = option.getLabel();
        component.querySelector("[type='hidden']").value = option.getValue();
        component.querySelector(".clear").classList.toggle("hidden", "" === option.getLabel());
    });

    selectController.getColumnOptionsComponent(1)?.onOptionSelected(option => {
        const selectedOption = selectController.getColumnOptionsComponent(0).getSelectedOption();
        const searchCategory = option.getLabel() === "" ? null : option.getLabel();
        const options = columnCbs[0](searchCategory).map(e => mapToValueOption(e?.value ?? e, e?.label ?? e));
        selectController.getColumnOptionsComponent(0).replaceOptions(options);
        if (!options.map(o => o.getValue()).includes(selectedOption.getValue())) {
            selectController.clearSelectedValueOption();
        }
    });

    return [component];
}

/**
 * 
 * @param { String } value 
 * @param { String } label 
 * @returns { OptionType }
 */
const mapToValueOption = (value, label) => {
    return ValueOption(value, label);
}

/**
 * 
 * @param { String } label 
 * @returns { OptionType }
 */
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
