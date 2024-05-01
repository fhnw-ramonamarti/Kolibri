import { ObservableList } from "../../observable.js";

export { OptionsModel, Option }

/**
 * @typedef OptionType
 * @property { () => !String } getValue - selectable value of the input
 * @property { () => ?String } getLabel - visible label of the input
 * @property { () => !String } getId - unique identifier of the option
 */

/**
 * Internal, mutable, singleton state to make Person qualifiers unique.
 * @private
 */
let idCounter = 0;


/**
 * 
 * @param { String } value 
 * @param { ?String } label 
 * @param { Boolean } isEmpty 
 * @constructor
 * @returns { OptionType }
 */
const Option = (value, label, isEmpty = false) => {
    const id = "Option." + (isEmpty ? "none" : idCounter++);
    return {
        getValue: () => value,
        getLabel: () => (!label || label === "" ? value : label),
        getId: () => id,
    }
}

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
