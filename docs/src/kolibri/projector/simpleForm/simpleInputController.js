import {SimpleInputModel}                                   from "./simpleInputModel.js";
import {EDITABLE, LABEL, NAME, TYPE, VALID, VALUE} from "../../presentationModel.js";
import {InputOptionsModel} from "./InputOptionsModel";

export { SimpleInputController, SimpleAttributeInputController }

/**
 * @typedef { object } SimpleInputControllerType
 * @template _T_
 * @property { ()  => _T_ }                 getValue
 * @property { (_T_) => void }              setValue
 * @property { ()  => String}               getType
 * @property { (valid: !Boolean) => void }  setValid
 * @property { (converter: Converter<_T_>)        => void } setConverter
 * @property { (cb: ValueChangeCallback<String>)  => void } onLabelChanged
 * @property { (cb: ValueChangeCallback<Boolean>) => void } onValidChanged
 * @property { (cb: ValueChangeCallback<_T_>)     => void } onValueChanged
 * @property { (cb: ValueChangeCallback<String>)  => void } onNameChanged
 * @property { (cb: ValueChangeCallback<Boolean>) => void } onEditableChanged
 */

/**
 * The SimpleInputController gives access to a {@link SimpleInputModel} but in a limited fashion.
 * It does not expose the underlying {@link Attribute} but only those functions that a user of this
 * controller needs to see.
 * While controllers might contain business logic, this basic controller does not contain any.
 * @constructor
 * @template _T_
 * @param  { OptionAttributes } args
 * @return { SimpleInputControllerType<_T_> }
 * @example
 *     const controller = SimpleInputController({
         value:  "Dierk",
         label:  "First Name",
         name:   "firstname",
         type:   "text",
     });
 */
const SimpleInputController = args => SimpleAttributeInputController(SimpleInputModel(args), InputOptionsModel(args));

// todo case unterscheidung options notwendig od nicht?
const SimpleAttributeInputController = (inputAttribute, optionAttribute) => ( {
    setValue:          inputAttribute.setConvertedValue,
    getValue:          inputAttribute.getObs(VALUE).getValue,
    setValid:          inputAttribute.getObs(VALID).setValue,
    getType:           inputAttribute.getObs(TYPE).getValue,
    onValueChanged:    inputAttribute.getObs(VALUE).onChange,
    onValidChanged:    inputAttribute.getObs(VALID).onChange,
    onLabelChanged:    inputAttribute.getObs(LABEL).onChange,
    onNameChanged:     inputAttribute.getObs(NAME).onChange,
    onEditableChanged: inputAttribute.getObs(EDITABLE).onChange,
    setConverter:      inputAttribute.setConverter,
    getOptions:        () => [...optionAttribute.list],
    addOption:         optionAttribute.obsList.add,
    delOption:         optionAttribute.obsList.del,
    onAddOption:       optionAttribute.obsList.onAdd,
    onDelOption:       optionAttribute.obsList.onDel,
    //setOptions:        (v) => optionAttribute.obsList, //todo
} );
