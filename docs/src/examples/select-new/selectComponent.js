import { CategoryOption, ValueOption, reset }              from "./optionsModel.js";
import { SelectController }                                from "./selectController.js";
import { projectSelectViews, pageCss as pageComponentCss } from "./selectProjector.js";
import { pageCss as pageCssColumn }                        from "./columnOptionsProjector.js";

export { SelectComponent, pageCss };


/**
 * @typedef { String | { label: String, value: String } } CallbackReturnType
 */

/**
 * SelectComponent maintains a {@link SelectController} and it creates the view.
 * It fills and filters the options columns with the callback functions.
 * @param { SelectAttribute }                              selectAttribute
 * @param { Array<(String) => Array<CallbackReturnType>> } serviceCallbacks - list of functions to get the data for each column
 * @return { [HTMLElement] } - component view
 * @constructor
 * @example 
        const componentView = SelectComponent(
            { name: 'city', label: 'City', numberOfColumns: 2 },
            [ getCitiesForCountry, getCountries ]
        )
 */
const SelectComponent = (selectAttribute, serviceCallbacks) => {
    const selectController              = SelectController(selectAttribute);
    const [component, selectionElement] = projectSelectViews(selectController);

    serviceCallbacks.forEach((cb, col) => {
        cb().forEach(e => {
            const option = col !== 0 ? mapToCategoryOption(e) : mapToValueOption(e?.value ?? e, e?.label ?? e);
            selectController.getColumnOptionsComponent(col).addOption(option);
        });
    });

    selectController.getColumnOptionsComponent(0).onOptionSelected(option => {
        selectionElement.innerHTML = option.getLabel();
        component.querySelector(".clear").classList.toggle("hidden", "" === option.getLabel());
    });

    /**
     * @param { Number }     col 
     * @param { OptionType } option 
     */
    const filterOptions = (col, option) => {
        const selectedOption = selectController.getColumnOptionsComponent(col).getSelectedOption();
        const searchCategory = option.getLabel() === "" ? null : option.getLabel();
        const mapping = (e) => col !== 0 ? mapToCategoryOption(e) 
                                         : mapToValueOption(e?.value ?? e, e?.label ?? e);
        const options = serviceCallbacks[col](searchCategory).map(mapping);

        options.forEach((option) =>
            selectController.getColumnOptionsComponent(col).addOption(option)
        );
        if (col === 0) {
            selectController.clearSelectedValueOption();
            if (options.map((o) => o.getValue()).includes(selectedOption.getValue())) {
                selectController.setSelectedValueOption(selectedOption);
            }
        } else {
            if(selectedOption.getId() !== reset().getId()){
                selectController.getColumnOptionsComponent(col).clearSelectedOption();
                filterOptions(col - 1, selectedOption);
                selectController.getColumnOptionsComponent(col).setSelectedOption(selectedOption);
            } else {
                options.forEach((option) => {
                    filterOptions(col - 1, option);
                });
            }
        }
    };

    serviceCallbacks.forEach((_, col) => {
        if (col === 0) {
            return;
        }
        selectController.getColumnOptionsComponent(col)?.onOptionSelected((option) => {
            if(option.getId() === reset().getId()){
                if(serviceCallbacks.length <= col + 1){
                    selectController.clearColumnOptions(col - 1);
                    filterOptions(col - 1, option);
                    return;
                }
                const selectedCategory = selectController
                    .getColumnOptionsComponent(col + 1)
                    .getSelectedOption();
                selectController.clearColumnOptions(col);
                filterOptions(col, selectedCategory);
            } else {
                selectController.clearColumnOptions(col - 1);
                filterOptions(col - 1, option);
            }
        });
    });

    return [component];
}

/**
 * @param { String } value 
 * @param { String } label 
 * @returns { OptionType }
 */
const mapToValueOption = (value, label) => {
    return ValueOption(value, label);
}

/**
 * @param { String } label 
 * @returns { OptionType }
 */
const mapToCategoryOption = (label) => {
    return CategoryOption(label);
}

/**
 * CSS snippet to append to the head style when using the select component.
 * @type { String }
 * @example
        document.querySelector("head style").textContent += pageCss;
 */
const pageCss = pageCssColumn + "\n" + pageComponentCss;
