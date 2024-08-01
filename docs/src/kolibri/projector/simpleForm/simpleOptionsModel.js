import { ObservableList } from "../../observable.js";

export { SimpleOptionsModel }

/**
 * @typedef SimpleOptionType
 * @property { String } value             - selectable value of the input
 * @property { String | undefined } label - visible label of the input
 */

/**
 * @typedef { InputAttributes & { list: Array<SimpleOptionType> } } OptionsAttributes
 */

/**
 * @typedef { InputAttributes | OptionsAttributes } ExtendedInputAttributes
 */

/**
 * @typedef SimpleOptionsModelType
 * @property { () => Array<SimpleOptionType>          } getList     - copy of inner list with all the options
 * @property { () => IObservableList<SimpleOptionType> } getObsList - observable list with all the options
 */

/**
 * Create a presentation model for the purpose of being used to bind against 
 * a single HTML Selection or Datalist Input.
 * For a single input, it does not need any parameters.
 * @constructor
 * @return { SimpleOptionsModelType }
 * @example
 *      const model = OptionsModel();
 */
const SimpleOptionsModel = () => {
    const list = [];
    const listObs = ObservableList(list);

    return {
        getList :   () => [...list],
        getObsList: () => listObs,
    };
};
