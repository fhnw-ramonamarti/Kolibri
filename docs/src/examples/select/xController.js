/**
 * @module xController as shallow wrappers around observables.
 * For the moment, this might seem over-engineered - and it is.
 * We do it anyway to follow the canonical structure of classical MVC where
 * views only ever know the controller API, not the model directly.
 */

import { Observable }                                       from "../../kolibri/observable.js";
import { CategoryOption, OptionsModel, ValueOption, noSelection, selectionMold } from "../../kolibri/projector/simpleForm/optionsModel.js";

export { MasterSelectionController }

/**
 * @typedef ListControllerType<Option>
 * @template _T_
 * @property { (cb:ConsumerType<Option>) => void } onModelAdd
 * @property { (cb:ConsumerType<Option>) => void } onModelRemove
 * @property { (model:Option) => void }            removeModel
 * @property { (model:Option) => void }            addModel
 * @property { () => Array<Option> }               getList
 */

/**
 * ListController maintains an option model.
 * @return { ListControllerType<Option> }
 * @constructor
 */
const ListController = () => {

    const listModel = OptionsModel(); 

    return {
        getList       : listModel.getList,
        addModel      : listModel.getObsList().add,
        removeModel   : listModel.getObsList().del,
        onModelAdd    : listModel.getObsList().onAdd,
        onModelRemove : listModel.getObsList().onDel,
    }
};


/**
 * @typedef SelectionControllerType<_T_>
 * @template _T_
 * @property { (_T_) => void } setSelectedModel
 * @property { ()  => _T_    } getSelectedModel
 * @property { () => void  }   clearSelection
 * @property { (cb: ValueChangeCallback<_T_>) => void } onModelSelected
 */

/**
 * SelectionController takes a model that will serve as a representative of a selection.
 * Listeners to selection changes will react by synchronizing with the selection.
 * @template _T_
 * @param  { _T_ } model - the model that is to represent the selection
 * @return { SelectionControllerType<_T_>}
 * @constructor
 */
const SelectionController = model => {

    const selectedModelObs = Observable(model);

    return {
        setSelectedModel : selectedModelObs.setValue,
        getSelectedModel : selectedModelObs.getValue,
        onModelSelected  : selectedModelObs.onChange,
        clearSelection   : () => selectedModelObs.setValue(noSelection),
    }
};


/**
 * @typedef MasterSelectionControllerType<_T_>
 * @template _T_
 * @property { () => Boolean        }       isOptionsVisible
 * @property { () => void           }       setOptionsVisibility
 * @property { (cb: ConsumerType<Boolean>) => void       }       onOptionsVisibilityChange
 * @property { ()  => Array<Option> }       getAllOptions
 
 * @property { ()  => Array<Option> }       getValueOptions
 * @property { (Option) => void     }       addValueOptionsModel 
 * @property { (Option) => void     }       removeValueOptionsModel
 * @property { (cb: ConsumerType<Option>) => void        }       onValueOptionsModelAdd
 * @property { (cb: ConsumerType<Option>) => void        }       onValueOptionsModelRemove

 * @property { ()  => Array<Option> }       getCategoryOptions
 * @property { (Option) => void     }       addCategoryOptionsModel
 * @property { (Option) => void     }       removeCategoryOptionsModel
 * @property { (cb: ConsumerType<Option>) => void        }       onCategoryOptionsModelAdd
 * @property { (cb: ConsumerType<Option>) => void        }       onCategoryOptionsModelRemove

 * @property { () => Boolean        }       isSelectedOptionVisible
 * @property { () => void           }       setSelectedOptionVisibility
 * @property { (cb: ConsumerType<Boolean>) => void       }       onSelectedOptionVisibilityChange

 * @property { (Option) => void     }       setSelectedOptionModel
 * @property { ()  => Option        }       getSelectedOptionModel
 * @property { ()  => void          }       clearOptionSelection
 * @property { (cb: ValueChangeCallback<Option>) => void }       onOptionModelSelected
 */

/**
 * MasterSelectionController maintains a list and a selection controller.
 * It also mantains observable states like the visibility.
 * @returns { MasterSelectionControllerType }
 * @constructor
 */
const MasterSelectionController = () => {
    const valueOptionsController    = ListController(); // todo list of column controller
    const categoryOptionsController = ListController();
    const selectedOptionController  = SelectionController(selectionMold);

    const selectedOptionVisibility  = Observable(true);
    const optionsVisibility         = Observable(true); // todo change after development to false

    // todo add parameter to choose between jump/ search and filter with categories
    // todo maybe with observable of highlighted option
    // todo maybe add navigation controller 
    // todo add observable for label
    // todo maybe add observable for placeholder
    // todo add observable for valitiy
    // todo add observable for name of input in detail 

    /**
     * 
     * @param { ValueOptionDataType } option 
     */
    const addValueOptionsModel = (option) => {
        const listOfValues = valueOptionsController.getList().map(o => o.getValue());
        // values should be unique in the options
        if (!listOfValues.includes(option.value)) {
            valueOptionsController.addModel(ValueOption(option.value, option.label));
        }
    }

    /**
     * 
     * @param { CategoryOptionDataType } category 
     */
    const addCategoryOptionsModel = (category) => {
        const listOfLabels = valueOptionsController
            .getList()
            .filter((c) => c.getColumn() === category.column)
            .map((c) => c.label());
        // labels should be unique in the column category
        if (!listOfLabels.includes(category.label)) {
            categoryOptionsController.addModel(CategoryOption(category.label, category.column))
        }
    }

    /**
     * 
     * @returns { Array<Option> }
     */
    const getCategoriesAndOptions = () => {
        return [...categoryOptionsController.getList(),...valueOptionsController.getList()];
    }

    // reset selection on remove selected option
    valueOptionsController.onModelRemove((model) => {
        if(model === selectedOptionController.getSelectedModel()){
            selectedOptionController.clearSelection();
        }
    });

    return {
        // master funtionality
        isOptionsVisible             : optionsVisibility.getValue,
        setOptionsVisibility         : optionsVisibility.setValue,
        onOptionsVisibilityChange    : optionsVisibility.onChange,
        getAllOptions                : getCategoriesAndOptions,
        
        // master  funtionality
        getValueOptions             : valueOptionsController.getList,
        addValueOptionsModel        : addValueOptionsModel,
        removeValueOptionsModel     : valueOptionsController.removeModel,
        onValueOptionsModelAdd      : valueOptionsController.onModelAdd,
        onValueOptionsModelRemove   : valueOptionsController.onModelRemove,
        
        // master categories funtionality
        getCategoryOptions           : categoryOptionsController.getList,
        addCategoryOptionsModel      : addCategoryOptionsModel,
        removeCategoryOptionsModel   : categoryOptionsController.removeModel,
        onCategoryOptionsModelAdd    : categoryOptionsController.onModelAdd,
        onCategoryOptionsModelRemove : categoryOptionsController.onModelRemove,

        // detail funtionality
        isSelectedOptionVisible          : selectedOptionVisibility.getValue,
        setSelectedOptionVisibility      : selectedOptionVisibility.setValue,
        onSelectedOptionVisibilityChange : selectedOptionVisibility.onChange,
        
        setSelectedOptionModel   : selectedOptionController.setSelectedModel,
        getSelectedOptionModel   : selectedOptionController.getSelectedModel,
        onOptionModelSelected    : selectedOptionController.onModelSelected,
        clearOptionSelection     : selectedOptionController.clearSelection,
    };
};

/**
 * @typedef CategoryOptionDataType
 * @property { String } label
 * @property { ?Number } column
 */

/**
 * @typedef ValueOptionDataType
 * @property { String } value
 * @property { ?String } label
 */