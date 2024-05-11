import { ObservableList } from "../../observable.js";

export {
    OptionsModel,
    CategoryOption,
    ValueOption,
    reset,
    noSelection,
    selectionMold,
    highlightMold,
    cursorPositionMold,
};
// todo new type category
/**
 * @typedef OptionType
 * @property { () => !String } getValue  - selectable value of the input
 * @property { () => ?String } getLabel  - visible label of the input
 * @property { () => !String } getId     - unique identifier of the option 
 * @property { () => !Number } getColumn - column of the option in the input
 * @property { () => Array<String> } getCategoryLabels - labels of the categories the option belongs to
 */

/**
 * Internal, mutable, singleton state to make Option id unique.
 * @private
 */
let idCounter = 0;


/**
 * todo think about rename id to qualifier ??
 * @private
 * @constructor
 * @param { String }  value 
 * @param { ?String } label - same as value if not defined
 * @param { Array<String> } categoryLabels 
 * column - 0 contains values to send in forms, other columns are categories
 * @returns { (column: Number, isEmpty: Boolean) => OptionType }
 */
const Option = (value, label, categoryLabels = []) => (column = 0, isEmpty = false) => {
    if(isEmpty){ // todo change id when adding name to component
        const id = "Option.none" ;
        return {
            getValue         : () => "",
            getLabel         : () => "",
            getId            : () => id,
            getColumn        : () => 0,
            getCategoryLabels: () => [],
        }
    } else {
        const id = "Option.value" + idCounter++; // todo optimize identifier
        return {
            getValue         : () => value,
            getLabel         : () => (!label || label === "" ? value : label),
            getId            : () => id,
            getColumn        : () => column,
            getCategoryLabels: () => categoryLabels,
        }
    }
}

/**
 * for the moment value options are only in the column 0
 * @constructor
 * @param { String }  value 
 * @param { ?String } label
 * @param { ?Array<String> } categoryLabels
 * @returns { OptionType }
 * @example
 *      const model = ValueOption("pizza_fungi","Pizza Fungi", ["pizza"]);
 */
const ValueOption = (value, label, categoryLabels = []) => {
    return Option(value, label, categoryLabels)(0);
};

/**
 * @constructor
 * @param { String }  label 
 * @param { ?Number } column - default 1
 * @param { Array<String> } categoryLabels 
 * @returns { OptionType }
 * @example
 *      const model = CategoryOption("pizza", 1);
 */
const CategoryOption = (label, column = 1, categoryLabels = []) => {
    return Option("", label, categoryLabels)(column);
};

/**
 * @typedef OptionsModelType
 * @template _T_
 * @property { () => Array<_T_>           } getList    - copy of inner list with all the options
 * @property { () => IObservableList<_T_> } getObsList - observable list with all the options
 */

/**
 * Create a presentation model for the purpose of being used to bind against 
 * a single HTML Selection or Datalist Input.
 * For a single input, it does not need any parameters.
 * @constructor
 * @template _T_
 * @return { OptionsModelType<_T_> }
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
 * Creates a single empty option
 * @returns { OptionType }
 */
const reset = () => {
    return Option("", "")(0, true);
};


/**
 * Representing a selection when no option selected.
 * @private
 * @return { OptionType }
 */
const createNoSelection = () => {
    return reset()
};
const noSelection = createNoSelection(); // the value to pass around, its id might get changed


/**
 * Used for selection of a single option
 */
const selectionMold = reset();

/**
 * Used for highlight of a single option
 */
const highlightMold = reset();

/**
 * Used for current cursor position of a single option
 */
const cursorPositionMold = reset();
