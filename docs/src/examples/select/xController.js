/**
 * @module xController as shallow wrappers around observables.
 * For the moment, this might seem over-engineered - and it is.
 * We do it anyway to follow the canonical structure of classical MVC where
 * views only ever know the controller API, not the model directly.
 */

import { Observable }                                       from "../../kolibri/observable.js";
import { Option, OptionsModel, noSelection, selectionMold } from "../../kolibri/projector/simpleForm/optionsModel.js";

export { ListAndSelectionController }

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
 * @typedef MasterDetailSelectionControllerType<_T_>
 * @template _T_
 * @property { () => Boolean        }       isMasterVisible
 * @property { () => void           }       setMasterVisibility
 * @property { (cb: ConsumerType<Boolean>) => void       }       onMasterVisibilityChange
 * @property { ()  => Array<Option> }       getMasterListsInOne
 
 * @property { ()  => Array<Option> }       getMasterOptionsList
 * @property { (Option) => void     }       addMasterOptionModel
 * @property { (Option) => void     }       removeMasterOptionModel
 * @property { (cb: ConsumerType<Option>) => void        }       onMasterOptionModelAdd
 * @property { (cb: ConsumerType<Option>) => void        }       onMasterOptionModelRemove

 * @property { ()  => Array<Option> }       getMasterCategoriesList
 * @property { (Option) => void     }       addMasterCategoryModel
 * @property { (Option) => void     }       removeMasterCategoryModel
 * @property { (cb: ConsumerType<Option>) => void        }       onMasterCategoryModelAdd
 * @property { (cb: ConsumerType<Option>) => void        }       onMasterCategoryModelRemove

 * @property { () => Boolean        }       isDetailVisible
 * @property { () => void           }       setDetailVisibility
 * @property { (cb: ConsumerType<Boolean>) => void       }       onDetailVisibilityChange

 * @property { (Option) => void     }       setSelectedOptionModel
 * @property { ()  => Option        }       getSelectedOptionModel
 * @property { ()  => void          }       clearOptionSelection
 * @property { (cb: ValueChangeCallback<Option>) => void }       onOptionModelSelected
 */

/**
 * ListAndSelectionController maintains a list and a selection controller.
 * It also mantains observable states like the visibility.
 * @returns { MasterDetailSelectionControllerType }
 * @constructor
 */
const ListAndSelectionController = () => {
    const masterOptionController     = ListController();
    const masterCategoriesController = ListController();
    const detailController           = SelectionController(selectionMold);

    const detailVisibility = Observable(true);
    const masterVisibility = Observable(true); // todo change after development to false

    // todo add parameter to choose between jump/ search and filter with categories
    // todo maybe with observable of highlighted option
    // todo maybe add navigation controller 
    // todo add observable for label
    // todo maybe add observable for placeholder
    // todo add observable for valitiy
    // todo add observable for name of input in detail 

    /**
     * 
     * @param { {value: String, label: ?String} } option 
     */
    const addOptionModel = (option) => {
        const listOfValues = masterOptionController.getList().map(o => o.getValue());
        // values should be unique in the options
        if (!listOfValues.includes(option.value)) {
            masterOptionController.addModel(Option(option.value, option.label)());
        }
    }

    /**
     * 
     * @param { {label: String, column: Number} } category 
     */
    const addCategoryModel = (category) => {
        const listOfLabels = masterOptionController
            .getList()
            .filter((c) => c.getColumn() === category.column)
            .map((c) => c.label());
        // labels should be unique in the column category
        if (!listOfLabels.includes(category.label)) {
            masterCategoriesController.addModel(Option(category.label)(category.column))
        }
    }

    /**
     * 
     * @returns { Array<Option> }
     */
    const getCategoriesAndOptions = () => {
        return [...masterCategoriesController.getList(),...masterOptionController.getList()];
    }

    // reset selection on remove selected option
    masterOptionController.onModelRemove((model) => {
        if(model === detailController.getSelectedModel()){
            detailController.clearSelection();
        }
    });

    return {
        // master funtionality
        isMasterVisible             : masterVisibility.getValue,
        setMasterVisibility         : masterVisibility.setValue,
        onMasterVisibilityChange    : masterVisibility.onChange,
        getMasterListsInOne         : getCategoriesAndOptions,
        
        // master  funtionality
        getMasterOptionsList        : masterOptionController.getList,
        addMasterOptionModel        : addOptionModel,
        removeMasterOptionModel     : masterOptionController.removeModel,
        onMasterOptionModelAdd      : masterOptionController.onModelAdd,
        onMasterOptionModelRemove   : masterOptionController.onModelRemove,
        
        // master categories funtionality
        getMasterCategoriesList     : masterCategoriesController.getList,
        addMasterCategoryModel      : addCategoryModel,
        removeMasterCategoryModel   : masterCategoriesController.removeModel,
        onMasterCategoryModelAdd    : masterCategoriesController.onModelAdd,
        onMasterCategoryModelRemove : masterCategoriesController.onModelRemove,

        // detail funtionality
        isDetailVisible          : detailVisibility.getValue,
        setDetailVisibility      : detailVisibility.setValue,
        onDetailVisibilityChange : detailVisibility.onChange,
        
        setSelectedOptionModel   : detailController.setSelectedModel,
        getSelectedOptionModel   : detailController.getSelectedModel,
        onOptionModelSelected    : detailController.onModelSelected,
        clearOptionSelection     : detailController.clearSelection,
    };
};
