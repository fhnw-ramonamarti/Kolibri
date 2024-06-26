import { CategoryOption, ValueOption, nullOption }         from "./optionsModel.js";
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
 * A selection of a category leads to unselecting all sub categories
 * expect the selected value if it is contained in the selected category. 
 * This component supports up to 3 columns where one contains the input values 
 * and the other two may contain categories to filter the values or subcategories.
 * @param { SelectAttribute }                                             selectAttributes
 * @param { Array<(categories: ...String) => Array<CallbackReturnType>> } serviceCallbacks - list of functions to get the data for each column
 * @returns { [HTMLDivElement, HTMLLabelElement, HTMLDivElement] }   - [component container (all in one container), 
 *                                                                     label part of component, 
 *                                                                     selection input part of component]
 * @constructor
 * @example 
        const selectAttributes = { name: 'city', label: 'City', numberOfColumns: 2 };
        const componentView = SelectComponent(
            selectAttributes,
            [ getCitiesForCountry, getCountries ]
        );
 */
const SelectComponent = (selectAttributes, serviceCallbacks) => {
    const selectController              = SelectController(selectAttributes);
    const [component, selectionElement] = projectSelectViews(selectController);
    const [labelElement, inputElement]  = component.children;

    /**
     * @param { Number } col - defines if column is value or category type, 0 is value
     * @returns { (CallbackReturnType) => OptionType }
     */
    const mapping = (col) => (e) => {
        if (null != e?.label || null != e?.value) {
            // callback returns object
            return col !== 0
                ? CategoryOption(e?.label ?? e?.value)
                : ValueOption(e?.value ?? e, e?.label);
        }
        // callback returns string
        return col !== 0 ? CategoryOption(e) : ValueOption(e);
    }; // callbacks with array of categories

    // initial fill of options
    serviceCallbacks.forEach((cb, col) => {
        cb().forEach(e => {
            const option = mapping(col)(e);
            selectController.getColumnOptionsComponent(col).addOption(option);
        });
    });

    // define value options selection change
    selectController.getColumnOptionsComponent(0).onOptionSelected(option => {
        if (!selectController.isDisabled()) {
            selectionElement.innerHTML = option.getLabel();
        }
        inputElement
            .querySelector(".clear")
            .classList.toggle("hidden", "" === option.getLabel());
    });

    const nullOptionId = nullOption.getId();

    /**
     * @param { Number }            col 
     * @param { Array<OptionType> } filterCategories 
     * @returns { Boolean } - true if the value option is contained in selected categories
     */
    const filterOptions = (col, filterCategories) => {        
        const selectedOption = selectController.getColumnOptionsComponent(col).getSelectedOption();
        const searchCategories = filterCategories?.map(option => option.getLabel()) ?? [];

        const options = serviceCallbacks[col](...searchCategories).map(mapping(col));
        options.forEach((option) => {
            selectController.getColumnOptionsComponent(col).addOption(option);
        });
        
        if (col === 0) {
            return options.map((option) => option.getValue()).includes(selectedOption.getValue());
        } else {
            const categories = selectedOption.getId() !== nullOptionId ? [selectedOption] : options;
            return filterOptions(col - 1, categories);
        }
    };

    // define category option selection changes
    serviceCallbacks.forEach((_, col) => {
        if (col === 0) {
            return;
        }
        selectController.getColumnOptionsComponent(col)?.onOptionSelected((option) => {
            let isValueOptionSelected = false;
            const selectedColumn      = selectController
                .getSelectedOptionOfColumns(col)
                .findIndex((option) => option.getId() !== nullOptionId);
            if (option.getId() === nullOptionId) {
                if (serviceCallbacks.length <= col + 1) {
                    // unselect most general category
                    selectController.clearColumnOptions(col - 1, 0);
                    filterOptions(col, []);
                    return;
                }

                // unselect category
                const selectedSuperCategory = selectController
                    .getColumnOptionsComponent(col + 1)
                    .getSelectedOption();
                const allSuperCategories = selectController
                    .getColumnOptionsComponent(col + 1)
                    .getOptions();
                const superCategories = selectedSuperCategory.getId() !== nullOptionId
                    ? [selectedSuperCategory]
                    : allSuperCategories;
                selectController.clearColumnOptions(col, 0);
                filterOptions(col, superCategories);
            } else {
                // select category
                const minCol = selectedColumn <= col - 1 ? selectedColumn : 0;
                selectController.clearSelectedOptions(col - 1);
                selectController.clearColumnOptions(col - 1, minCol);
                isValueOptionSelected = filterOptions(col - 1, [option]);
                if (!isValueOptionSelected) {
                    selectController.clearSelectedValueOption();
                }
            }
        });
    });

    return [
        component,
        /** @type { HTMLLabelElement } */ labelElement,
        /** @type { HTMLDivElement } */ inputElement,
    ];
}

/**
 * CSS snippet to append to the head style when using the select component.
 * @type { String }
 * @example
        document.querySelector("head style").textContent += pageCss;
 */
const pageCss = pageCssColumn + "\n" + pageComponentCss;
