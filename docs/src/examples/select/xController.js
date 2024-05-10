/**
 * @module xController as shallow wrappers around observables.
 * For the moment, this might seem over-engineered - and it is.
 * We do it anyway to follow the canonical structure of classical MVC where
 * views only ever know the controller API, not the model directly.
 */

import { Observable }       from "../../kolibri/observable.js";
import {
    CategoryOption,
    OptionsModel,
    ValueOption,
    highlightMold,
    noSelection,
    selectionMold,
}                           from "../../kolibri/projector/simpleForm/optionsModel.js";

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
 * @property { () => String         }       getLabel
 * @property { () => void           }       setLabel
 * @property { (cb: ConsumerType<String>) => void        }       onLabelChange

 * @property { () => String         }       getName
 * @property { () => void           }       setName
 * @property { (cb: ConsumerType<String>) => void        }       onNameChange

* @property { () => Boolean        }       isOptionsVisible
 * @property { () => void           }       setOptionsVisibility
 * @property { (cb: ConsumerType<Boolean>) => void       }       onOptionsVisibilityChange
 * @property { ()  => Array<Option> }       getAllOptions
 
 * @property { ()  => Array<Option> }       getValueOptions
 * @property { (Option) => void     }       addValueOptionsModel 
 * @property { (Option) => void     }       removeValueOptionsModel
 * @property { (cb: ConsumerType<Option>) => void        }       onValueOptionsModelAdd
 * @property { (cb: ConsumerType<Option>) => void        }       onValueOptionsModelRemove

 * @property { (col: Number)  => Array<Option> }                 getCategoryOptions
 * @property { (Option) => void     }       addCategoryOptionsModel
 * @property { (Option) => void     }       removeCategoryOptionsModel
 * @property { (cb: ConsumerType<Option>) => void        }       onCategoryOptionsModelAdd
 * @property { (cb: ConsumerType<Option>) => void        }       onCategoryOptionsModelRemove

 * @property { () => Boolean        }       isSelectedOptionVisible
 * @property { () => void           }       setSelectedOptionVisibility
 * @property { (cb: ConsumerType<Boolean>) => void       }       onSelectedOptionVisibilityChange

 * @property { ()  => Option        }       getSelectedOptionModel
 * @property { (Option) => void     }       setSelectedOptionModel
 * @property { ()  => void          }       clearOptionSelection
 * @property { (cb: ValueChangeCallback<Option>) => void }       onOptionModelSelected

 * @property { ()  => Array<Option> }       getSelectedCategoryOptions
 * @property { (Option) => void     }       toggleSelectedCategoryOptionsModel
 * @property { ()  => void          }       clearSelectedCategoryOptions
 * @property { (cb: ConsumerType<Option>) => void        }       onSelectedCategoryOptionsModelAdd
 * @property { (cb: ConsumerType<Option>) => void        }       onSelectedCategoryOptionsModelRemove
 */

/**
 * MasterSelectionController maintains a list and a selection controller.
 * It also mantains observable states like the visibility.
 * @param { MasterSelectionAttribut } masterSelectionAttribut
 * @param { OptionDataType          } initOptions
 * @returns { MasterSelectionControllerType }
 * @constructor
 */
const MasterSelectionController = (
    { value = "", label = "", name = "" },
    initOptions = { values: [], categories: [] }
) => {
    const categoryCallbacks = {
        add: [],
        remove: [],
    };
    const optionControllerList      = [ListController()];
    const selectedOptionController  = SelectionController(selectionMold);
    const selectedCategoryOptions   = ListController(); // todo add sel cat tests also for model
    const highlightOptionController = SelectionController(highlightMold); // todo add tests

    const selectedOptionVisibility  = Observable(true);
    const optionsVisibility         = Observable(true); // todo change after development to false

    const nameObs  = Observable(name); // todo test name , label
    const labelObs = Observable(label);

    // at the moment fixed to these values
    const supportTypeOfCategroyOptions = Observable(FILTER); // todo add funtionality
    const valueOptionsSorted           = Observable(true);
    const categoryOptionsSorted        = Observable(true);

    // todo maybe add navigation controller
    // todo maybe add observable for placeholder
    // todo add observable for vadilitiy
    // todo maybe possibility for multi select

    /**
     *
     * @param { ValueOptionDataType } option
     */
    const addValueOptionsModel = (option) => {
        const valueOptionsController = optionControllerList[0];
        const listOfValues = valueOptionsController.getList().map((o) => o.getValue());
        // values should be unique in the options
        if (!listOfValues.includes(option.value)) {
            valueOptionsController.addModel(
                ValueOption(option.value, option.label, option.categoryLabels)
            );
        }
    };

    /**
     *
     * @param { CategoryOptionDataType } category
     */
    const addCategoryOptionsModel = (category) => {
        if (category.column < 1) {
            console.log("CategoryOption column has to be >= 1", category);
            return; // todo not allowed maybe error msg
        }
        if (!optionControllerList[category.column]) {
            const listController = ListController();
            categoryCallbacks.add.forEach((cb) => listController.onModelAdd(cb));
            categoryCallbacks.remove.forEach((cb) => listController.onModelRemove(cb));
            optionControllerList.push(
                ...Array(category.column - optionControllerList.length + 1).fill(listController)
            );
        }
        const categoryOptionsController = optionControllerList[category.column];
        const listOfLabels = categoryOptionsController.getList().map((c) => c.getLabel());
        // labels should be unique in the column category
        if (!listOfLabels.includes(category.label)) {
            categoryOptionsController.addModel(
                CategoryOption(category.label, category.column, category.categoryLabels)
            );
        }
    };

    const onCategoryOptionsModelAdd = (cb) => {
        categoryCallbacks.add.push(cb);
        optionControllerList.slice(1).forEach((controller) => controller.onModelAdd(cb));
    };

    const onCategoryOptionsModelRemove = (cb) => {
        categoryCallbacks.remove.push(cb);
        optionControllerList.slice(1).forEach((controller) => controller.onModelRemove(cb));
    };

    /**
     *
     * @returns { Array<Option> }
     */
    const getAllOptions = () => {
        const nestedOptions = optionControllerList.map((option) => option.getList());
        return nestedOptions.flatMap((option) => option);
    };

    // reset selection on remove selected option
    optionControllerList[0].onModelRemove((model) => {
        if (model === selectedOptionController.getSelectedModel()) {
            selectedOptionController.clearSelection();
        }
    });

    /**
     *
     * @param { Option } toggleModel
     */
    const toggleSelectedCategoryOptionsModel = (toggleModel) => {
        selectedCategoryOptions.getList().forEach((option) => {
            if (option.getColumn() < toggleModel.getColumn()) {
                selectedCategoryOptions.removeModel(option);
            }
        });
        if (selectedCategoryOptions.getList().includes(toggleModel)) {
            selectedCategoryOptions.removeModel(toggleModel);
        } else {
            const otherCategory = selectedCategoryOptions
                .getList()
                .filter((o) => o.getColumn() === toggleModel.getColumn());
            if (otherCategory.length > 0) {
                // only one category is selected per column
                selectedCategoryOptions.removeModel(otherCategory[0]);
            }
            selectedCategoryOptions.addModel(toggleModel);
        }
    };

    const clearSelectedCategoryOptions = () => {
        selectedCategoryOptions.getList().forEach((option) => {
            selectedCategoryOptions.removeModel(option);
        });
    };

    // fill initial options
    initOptions?.categories?.forEach((option) => {
        addCategoryOptionsModel(option);
    });
    initOptions.values.forEach((option) => {
        addValueOptionsModel(option);
    });

    // prepare selected value option
    const selectedOption = optionControllerList[0]
        .getList()
        .filter((option) => option.getValue() === value)[0];
    if (value !== "" && null != selectedOption) {
        selectedOptionController.setSelectedModel(selectedOption);
    }

    return {
        // properies funtionality // todo naming ok ?
        getLabel     : labelObs.getValue,
        setLabel     : labelObs.setValue,
        onLabelChange: labelObs.onChange,

        getName     : nameObs.getValue,
        setName     : nameObs.setValue,
        onNameChange: nameObs.onChange,

        // master funtionality
        isOptionsVisible         : optionsVisibility.getValue,
        setOptionsVisibility     : optionsVisibility.setValue,
        onOptionsVisibilityChange: optionsVisibility.onChange,
        getAllOptions            : getAllOptions,

        // master  funtionality
        getValueOptions          : optionControllerList[0].getList,
        addValueOptionsModel     : addValueOptionsModel,
        removeValueOptionsModel  : optionControllerList[0].removeModel,
        onValueOptionsModelAdd   : optionControllerList[0].onModelAdd,
        onValueOptionsModelRemove: optionControllerList[0].onModelRemove,

        // master categories funtionality
        getCategoryOptions          : (col) => optionControllerList[col]?.getList() ?? null,
        addCategoryOptionsModel     : addCategoryOptionsModel,
        removeCategoryOptionsModel  : (o) => optionControllerList[o.getColumn()]?.removeModel(o),
        onCategoryOptionsModelAdd   : onCategoryOptionsModelAdd,
        onCategoryOptionsModelRemove: onCategoryOptionsModelRemove,

        // detail funtionality
        isSelectedOptionVisible         : selectedOptionVisibility.getValue,
        setSelectedOptionVisibility     : selectedOptionVisibility.setValue,
        onSelectedOptionVisibilityChange: selectedOptionVisibility.onChange,

        setSelectedOptionModel: selectedOptionController.setSelectedModel,
        getSelectedOptionModel: selectedOptionController.getSelectedModel,
        onOptionModelSelected : selectedOptionController.onModelSelected,
        clearOptionSelection  : selectedOptionController.clearSelection,

        getSelectedCategoryOptions           : selectedCategoryOptions.getList,
        toggleSelectedCategoryOptionsModel   : toggleSelectedCategoryOptionsModel,
        clearSelectedCategoryOptionsSelection: clearSelectedCategoryOptions,
        onSelectedCategoryOptionsModelAdd    : selectedCategoryOptions.onModelAdd,
        onSelectedCategoryOptionsModelRemove : selectedCategoryOptions.onModelRemove,

        setHighlightOptionModel : highlightOptionController.setSelectedModel,
        getHighlightOptionModel : highlightOptionController.getSelectedModel,
        onOptionModelHighlighted: highlightOptionController.onModelSelected,
        clearOptionHighlight    : highlightOptionController.clearSelection,
    };
};

/**
 * @typedef OptionDataType
 * @property { Array<ValueOptionDataType>     } values
 * @property { ?Array<CategoryOptionDataType> } categories
 */

/**
 * @typedef CategoryOptionDataType
 * @property { String        } label          - unique in its column of the component
 * @property { ?Number       } column         - can be seen as the level of the category option
 * @property { Array<String> } categoryLabels - only labels of categories needed
 */

/**
 * @typedef ValueOptionDataType
 * @property { String        } value          - unique over the component
 * @property { ?String       } label          - visible part of the option
 * @property { Array<String> } categoryLabels - only labels of categories needed
 */

/**
 * @typedef MasterSelectionAttribut
 * @property { ?String } value
 * @property { ?String } label
 * @property { ?String } name
 * // @property { Array<*> } options 
 */

/**
 * @typedef { 'filter' | 'jump' } SupportType
 */

/** @type { SupportType } */ const FILTER = 'filter';
/** @type { SupportType } */ const JUMP   = 'jump';
