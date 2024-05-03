/**
 * @module xController as shallow wrappers around observables.
 * For the moment, this might seem over-engineered - and it is.
 * We do it anyway to follow the canonical structure of classical MVC where
 * views only ever know the controller API, not the model directly.
 */

import { Observable }                from "../../kolibri/observable.js";
import { OptionsModel, noSelection } from "../../kolibri/projector/simpleForm/optionsModel.js";

export { ListController, SelectionController, ListAndSelectionController }

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
 * @property { () => Boolean  } isVisible
 * @property { () => void  }    setVisible
 * @property { (_T_) => void }  setSelectedDetailModel
 * @property { ()  => _T_    }  getSelectedDetailModel
 * @property { () => void  }    clearDetailSelection
 * @property { (cb: ValueChangeCallback<Option>) => void } onDetailModelSelected
 * @property { () => void  }    getMasterList
 * @property { () => void  }    addMasterModel
 * @property { () => void  }    removeMasterModel
 * @property { (cb: ConsumerType<Option>) => void }        onMasterModelAdd
 * @property { (cb: ConsumerType<Option>) => void }        onMasterModelRemove
 */

/**
 * ListAndSelectionController maintains a list and a selection controller.
 * It also mantains observable states like the visibility.
 * @param { ListControllerType }      masterConteroller 
 * @param { SelectionControllerType } detailController 
 * @returns { MasterDetailSelectionControllerType }
 * @constructor
 */
const ListAndSelectionController = (masterConteroller, detailController) => {
    const visibleObs = Observable(true); // todo change after development to false
    // todo add parameter to choose between jump/ search and filter with categories
    // todo maybe with observable of highlighted option
    // todo maybe add navigation controller 
    // todo add observable for label
    // todo maybe add observable for placeholder
    // todo add observable for valitiy
    // todo add observable for name of input in detail 

    return {
        isVisible               : visibleObs.getValue,
        setVisible              : visibleObs.setValue,
        onVisibleChange         : visibleObs.onChange,
        setSelectedDetailModel  : detailController.setSelectedModel,
        getSelectedDetailModel  : detailController.getSelectedModel,
        onDetailModelSelected   : detailController.onModelSelected,
        clearDetailSelection    : detailController.clearSelection,
        getMasterList           : masterConteroller.getList,
        addMasterModel          : masterConteroller.addModel,
        removeMasterModel       : masterConteroller.removeModel,
        onMasterModelAdd        : masterConteroller.onModelAdd,
        onMasterModelRemove     : masterConteroller.onModelRemove,
    };
};
