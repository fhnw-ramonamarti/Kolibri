import { CategoryOption, ValueOption, nullOption }         from "./optionsModel.js";
import { SelectController }                                from "./selectController.js";
import { projectSelectViews, pageCss as pageComponentCss } from "./selectProjector.js";
import { pageCss as pageCssColumn }                        from "./columnOptionsProjector.js";

export { SelectComponent, pageCss };


/**
 * @typedef { String | { label: String, value: String } } CallbackReturnType
 */

/**
 * @typedef { (categories: ...String) => Array<CallbackReturnType>>} CallbackType
 */


/**
 * @typedef SelectComponentType
 * @property { () => SelectComponentType } getSelectController
 * @property { () => HTMLDivElement }      getComponentView
 * @property { () => HTMLDivElement }      getLabelViewPartOfComponent
 * @property { () => HTMLDivElement }      getInputViewPartOfComponent
 */

/**
 * SelectComponent maintains a {@link SelectController} and it creates the view.
 * It fills and filters the options columns with the callback functions.
 * The number of the functions in the {@link serviceCallbacks} define the number of columns.
 * A selection of a category leads to unselecting all sub categories and value
 * if they are not contained in the selected category. 
 * This component supports up to 3 columns where one contains the input values 
 * and the others may contain categories to filter the values or subcategories.
 * For a usefull performance the callback return array should not contain > 5_000 entries.
 * While the column values are loading a circular loader appears in the column.
 *
 * @param { SelectAttribute }                                             selectAttributes
 * @param { Array<CallbackType> } serviceCallbacks - list of callbacks to support data for the columns
 * @returns { SelectComponentType } 
 * @constructor
 * @example 
        const selectAttributes = { name: 'city', label: 'City' };
        const component = SelectComponent(
            selectAttributes,
            [ getCitiesForCountry, getCountries ]
        );
 */
const SelectComponent = (selectAttributes, serviceCallbacks) => {
    const selectController              = SelectController(selectAttributes, serviceCallbacks.length);
    const [componentView, selectionElement] = projectSelectViews(selectController);
    const [labelElement, inputElement]  = componentView.children;

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
    };

    // initial fill of options
    serviceCallbacks.forEach((cb, col) => {
        selectController.getColumnOptionsComponent(col).addOptions(cb().map(mapping(col)));
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
     */
    const filterOptions = (col, filterCategories) => {        
        const selectedOption = selectController.getColumnOptionsComponent(col).getSelectedOption();
        const searchCategories = filterCategories?.map(option => option.getLabel()) ?? [];
        const options = serviceCallbacks[col](...searchCategories).map(mapping(col));

        /**
         * @param { Array<OptionType> } oldOptions 
         * @param { Array<OptionType> } newOptions 
         * @returns { Boolean }
         */
        const areOptionsSame = (oldOptions, newOptions) =>
            oldOptions.map((opt, inx) => opt.equals(newOptions[inx])).filter((eq) => !eq) == 0 &&
            newOptions.map((opt, inx) => opt.equals(oldOptions[inx])).filter((eq) => !eq) == 0;

        if (areOptionsSame(selectController.getColumnOptionsComponent(col).getOptions(), options)) {
            return;
        }

        if (!options.some((option) => option.equals(selectedOption))) {
            selectController.getColumnOptionsComponent(col).clearSelectedOption();
        }
        selectController.getColumnOptionsComponent(col).clearOptions();
        selectController.getColumnOptionsComponent(col).addOptions(options);
        
        if (col !== 0) {
            const selectedOption = selectController
                .getColumnOptionsComponent(col)
                .getSelectedOption();
            const categories = selectedOption.getId() !== nullOptionId ? [selectedOption] : options;
            filterOptions(col - 1, categories);
        }
    };

    // define category option selection changes
    serviceCallbacks.forEach((_, col) => {
        if (col === 0) {
            return;
        }
        selectController.getColumnOptionsComponent(col)?.onOptionSelected((option) => {
            if (option.getId() === nullOptionId) {
                if (serviceCallbacks.length <= col + 1) {
                    // unselect most general category
                    filterOptions(col - 1, []);
                    return;
                }

                // unselect category
                const selectedSuperCategory = option;
                const allSuperCategories = selectController
                    .getColumnOptionsComponent(col)
                    .getOptions();
                const superCategories = selectedSuperCategory.getId() !== nullOptionId
                    ? [selectedSuperCategory]
                    : allSuperCategories;
                filterOptions(col - 1, superCategories);
                return;
            } 
            // select category
            filterOptions(col - 1, [option]);
        });
    });

    return {
        getSelectController        : () => selectController,
        getComponentView           : () => componentView,
        getLabelViewPartOfComponent: () => labelElement,
        getInputViewPartOfComponent: () => inputElement
    };
};

/**
 * CSS snippet to append to the head style when using the select component.
 * @type { String }
 * @example
        document.querySelector("head style").textContent += pageCss;
 */
const pageCss = pageCssColumn + "\n" + pageComponentCss;
