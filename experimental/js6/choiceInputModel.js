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

export { ChoiceDetailModel, ChoiceMasterModel, ChoiceAttribute };

/**
 * @typedef { object } Country
 * @property { String } country
 * @property { String } continent
 */

/**
 * @typedef { object } FocusObject
 * @property { String } value
 * @property { Number } column
 */

const ChoiceDetailModel = ({ value, placeholder, label, name }) => {
    const attr = Attribute(value);
    attr.getObs(EDITABLE).setValue(false);
    attr.getObs(VALID).setValue(true);

    if (null != placeholder) attr.getObs(PLACEHOLDER).setValue(placeholder);
    if (null != label) attr.getObs(LABEL).setValue(label);
    if (null != name) attr.getObs(NAME).setValue(name);

    return { ...attr };
};

const ChoiceMasterModel = ({ valueList, sectionValue, focusObject }) => {
    const multiAttr = ChoiceAttribute(valueList, focusObject)(sectionValue);
    multiAttr.getObs(EDITABLE).setValue(false);
    multiAttr.getObs(DEBOUNCE_TEXT, "");
    multiAttr.getObs(CHOICEBOX_OPEN, false);

    return { ...multiAttr };
};

/*
 * @typedef { object } ChoiceInputAttributes
 * @template _T_
 * @property { !List<Map<String,_T_>> } listObjects - mandatory list of value objects, will become the possible input values, to be chosen from
 * @property { !List<String> }      colNames        - mandatory names of the map elements, used to extract the values from the objects
 * @property { ?Map<String,_T_> }   selcectedObject - optional selected value object, will become the selected category & value
 * @property { ?_T_ }               focusedObject    - optional focused value, will become the focused category or value for navigation
 * @property { ?_T_ }               filledValue     - optional filled value, will become the value sent in the form
 * @property { ?String }            placeholder     - optional placeholder that reflects the placeholder attribute of an input of no element is selected
 * @property { ?String }            label           - optional label, defaults to undefined
 * @property { ?String }            name            - optional name that reflects the name attribute of an input element, used in forms
 */

/*
 * Create a presentation model for the purpose of being used to bind against a single readonly HTML Input in
 * combinations with its pairing Label element and the content of the possible selections.
 * For a selection element, it only needs one attribute.
 * @constructor
 * @template _T_
 * @param  { ChoiceInputAttributes<_T_> }
 * @return { AttributeType<_T_> } 
 * @example
 *     const model = SimpleInputModel({
            listObjects :   [{country: "Switzerland", continent: "Europe"}, 
                                {country: "United States", continent:"North America"}, 
                                {country: "Germany", continent: "Europe"}],
            selcectedObject :  {continent: "Europe"},
            focusedObject : {column: 1, value: "Switzerland"},
            filledValue :   "",
            placeholder:    "Choose Country",
            label:          "Country",
            name:           "country",
            colNames:       ["continent","country"],
     });
 */
// const ChoiceInputModel = ({ listObjects, selcectedObject, focusedObject, filledValue, placeholder, label, name }) => {
    
// };

/**
 * Constructor that creates a new choice attribute with a value and an optional qualifier.
 * @template _T_
 * @param  { List<Map<String,_T_>> }    listValues     - the initial list of value objects
 * @param  { Map<String,_T_> }          selcectedObject - the initial selected value object
 * @param  { _T_ }                      focusedObject    - the initial focused end value 
 * @param  { _T_ }                      filledValue        - the initial selected end value
 * @param  { String? }                  qualifier       - the optional qualifier. If provided and non-nullish it will put the attribute
 *          in the ModelWorld and all existing attributes with the same qualifier will be updated to the initial value.
 *          In case that the automatic update is to be omitted, consider using {@link QualifiedAttribute}.
 * @return { AttributeType<_T_> }
 * @constructor
 * @impure since it changes the ModelWorld in case of a given non-nullish qualifier.
 * @example
 * const firstNameAttr = ChoiceAttribute([
                                {continent: "North America", country: "United States"},
                                {continent: "Europe", country: "Switzerland"},
                                {continent: "Europe", country: "Germany"},
                            ])("Switzerland", "Country.Living");
 */
const ChoiceAttribute = (valueList, focusObject) => (value, qualifier) => {
    const attr = Attribute(value, qualifier);
    attr.getObs(LIST_ELEMENTS, valueList);
    attr.getObs(FOCUS_ELEMENT, focusObject);
    return { ...attr };
};
