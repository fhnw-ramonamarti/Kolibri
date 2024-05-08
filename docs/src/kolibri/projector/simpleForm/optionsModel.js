import { ObservableList } from "../../observable.js";

export { OptionsModel, CategoryOption, ValueOption, reset, noSelection, selectionMold, highlightMold }
// todo new type category
/**
 * @typedef OptionType
 * @property { () => !String } getValue  - selectable value of the input
 * @property { () => ?String } getLabel  - visible label of the input
 * @property { () => !String } getId     - unique identifier of the option 
 * @property { () => !Number } getColumn - column of the option in the input
 * @property { () => Array<CategoryOption> } getCategories - categories the option belongs to
 */

/**
 * Internal, mutable, singleton state to make Option id unique.
 * @private
 */
let idCounter = 0;


/**
 * todo think about rename id to qualifier ??
 * @param { String } value 
 * @param { ?String } label - same as value if not defined
 * @param { Array<CategoryOption> } categories 
 * @constructor
 * column - 0 contains values to send in forms, other columns are filters or categories
 * @returns { (column: Number, isEmpty: Boolean) => OptionType }
 */
const Option = (value, label, categories = []) => (column = 0, isEmpty = false) => {
    if(isEmpty){ // todo change id when adding name to component
        const id = "Option.none" ;
        return {
            getValue: () => "",
            getLabel: () => "",
            getId: () => id,
            getColumn: () => 0,
            getCategories: () => [],
        }
    } else {
        const id = "Option.value" + idCounter++; // todo optimize idenitier 
        return {
            getValue: () => value,
            getLabel: () => (!label || label === "" ? value : label),
            getId: () => id,
            getColumn: () => column,
            getCategories: () => categories,
        }
    }
}

/**
 * for the moment value options are only in the column 0
 * @param { String } value 
 * @param { ?String } label
 * @param { Array<CategoryOption> } categories 
 * @returns { OptionType }
 */
const ValueOption = (value, label, categories) => {
    return Option(value, label, categories)(0);
};

/**
 * 
 * @param { String } label 
 * @param { ?Number } column - default 1
 * @param { Array<CategoryOption> } categories 
 * @returns { OptionType }
 */
const CategoryOption = (label, column = 1, categories = []) => {
    return Option("", label, categories)(column);
};

/**
 * @typedef OptionsModelType
 * @property { () => Array<OptionType>          } getList    - copy of inner list with all the options
 * @property { () => ObservableList<OptionType> } getObsList - observable list with all the options
 */

/**
 * Create a presentation model for the purpose of being used to bind against 
 * a single HTML Selection or Datalist Input.
 * For a single input, it does not need any parameters.
 * @constructor
 * @return { OptionsModelType }
 * @example
 *      const model = OptionsModel();
 */
const OptionsModel = () => {
    const list = [];
    const listObs = ObservableList(list);

    return {
        getList :   () => [...list],
        getObsList: () => listObs,
    };
};


/**
 * Creates a signle empty option
 * @returns { OptionType }
 */
const reset = () => {
    return Option("")(0, true);
};


/**
 * Representing a selection when no option selected.
 * @private
 */
const createNoSelection = () => {
    const result = reset();
    return result
};
const noSelection = createNoSelection(); // the value to pass around, its id might get changed


/**
 * Used for selection of a signle option
 */
const selectionMold = reset();

/**
 * Used for highlight of a signle option
 */
const highlightMold = reset();
