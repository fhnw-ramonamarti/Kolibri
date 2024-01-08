// noinspection JSValidateJSDoc

import {
    VALID,
    EDITABLE,
    LABEL,
    NAME,
    PLACEHOLDER,
    LIST_ELEMENTS,
    FOCUS_ELEMENT,
    DEBOUNCE_TEXT,
    CHOICEBOX_OPEN,
    Attribute,
} from "../../docs/src/kolibri/presentationModel.js";

export {ChoiceDetailModel, ChoiceMasterModel, ChoiceAttribute};


/**
 * @typedef { object } FocusObject
 * @property { ?String } value
 * @property { ?Number } column
 */

/**
 * @typedef { object } ChoiceDetailAttributes
 * @template _T_
 * @property { ?_T_ }     value        - optional value, will become the value sent in the form
 * @property { ?String }  placeholder  - optional placeholder that reflects the placeholder attribute of an input
 * @property { ?String }  label        - optional label, defaults to undefined
 * @property { ?String }  name         - optional name that reflects the name attribute of an input element, used in forms
 */

/**
 * @typedef { object } ChoiceMasterAttributes
 * @template { object } _T_ - object with category and element entry
 * @property { !Array<_T_> }    elementList    - mandatory list of elements, will become all possible input value, to be chosen from
 * @property { ?_T_ }           sectionElement - optional selected elements, will become the selected category & element
 * @property { ?FocusObject }   focusObject    - optional focus object, will become the active column and focused category or element, used in navigation
 */

/**
 * Create a presentation model for the purpose of being used to bind against the detail view of selection input element.
 * It provides a single readonly HTML text Input in combination with its pairing label element and
 * buttons to toggle and clear the selection component.
 * For a selection detail element, it only needs one attribute.
 * @constructor
 * @template _T_
 * @param  { ChoiceDetailModel<_T_> }
 * @return { AttributeType<_T_> }
 * @example
 *     const model = ChoiceDetailModel({
 *         value: "",
 *         placeholder: "Choose a country",
 *         label: "Country",
 *         name: "country"
 *     });
 */
const ChoiceDetailModel = ({value, placeholder, label, name}) => {
    const attr = Attribute(value);
    attr.getObs(EDITABLE).setValue(false);
    attr.getObs(VALID).setValue(true);

    if (null != placeholder) attr.getObs(PLACEHOLDER).setValue(placeholder);
    if (null != label) attr.getObs(LABEL).setValue(label);
    if (null != name) attr.getObs(NAME).setValue(name);

    return {...attr};
};

/**
 * Create a presentation model for the purpose of being used to bind against the master view of selection input element.
 * It provides a container with the given categories and elements in combination with the current
 * selection and position in focus to use for the navigation in the list.
 * For a selection master element, it only needs one attribute.
 * @constructor
 * @template { object } _T_ - object with category and element entry
 * @param  { ChoiceMasterAttributes<_T_> }
 * @return { AttributeType<_T_> }
 * @example
 *     const model = ChoiceMasterModel({
 *         elementList: [{country: "Switzerland", continent: "Europe"}, 
 *                      {country: "United States", continent:"North America"}, 
 *                      {country: "Germany", continent: "Europe"}],
 *         sectionElement: { continent: "All" },
 *         focusObject: {column: 1, value: "Germany"}
 *     });
 */
const ChoiceMasterModel = ({elementList, sectionElement, focusObject}) => {
    const multiAttr = ChoiceAttribute(elementList, focusObject, sectionElement);
    multiAttr.getObs(EDITABLE, false);
    multiAttr.getObs(DEBOUNCE_TEXT, "");
    multiAttr.getObs(CHOICEBOX_OPEN, false);

    return {...multiAttr};
};

// prepare for ip6 to implement the qualifier attribute
/** 
 * Constructor that creates a new choice attribute with a element list, focus object, value object and an optional qualifier.
 * @template { object } _T_ - object with category and element entry
 * @param  { Array<_T_> }       elementList    - the initial list of element objects
 * @param  { FocusObject }     focusObject     - the initial focus object with current column and current element
 * @param  { _T_ }             value           - the initial selection object
 * @param  { String? }         qualifier       - the optional qualifier. If provided and non-nullish it will put the attribute
 *          in the ModelWorld and all existing attributes with the same qualifier will be updated to the initial value.
 *          In case that the automatic update is to be omitted, consider using {@link QualifiedAttribute}.
 * @return { AttributeType<_T_> }
 * @constructor
 * @impure since it changes the ModelWorld in case of a given non-nullish qualifier.
 * @example
 *      const firstNameAttr = ChoiceAttribute([
 *                                 {continent: "North America", country: "United States"},
 *                                 {continent: "Europe", country: "Switzerland"},
 *                                 {continent: "Europe", country: "Germany"},
 *                             ], "Switzerland");
 */
const ChoiceAttribute = (elementList, focusObject, value, qualifier) => {
    const attr = Attribute(value, qualifier);
    attr.getObs(LIST_ELEMENTS, elementList);

    if (null != focusObject) attr.getObs(FOCUS_ELEMENT, focusObject);

    return {...attr};
};
