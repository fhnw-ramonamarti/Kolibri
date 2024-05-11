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
 * @typedef ListControllerType
 * @property { (cb:ConsumerType<OptionType>) => void } onModelAdd
 * @property { (cb:ConsumerType<OptionType>) => void } onModelRemove
 * @property { (model:OptionType) => void }            removeModel
 * @property { (model:OptionType) => void }            addModel
 * @property { () => Array<OptionType> }               getList
 */

/**
 * ListController maintains an option model.
 * @return { ListControllerType }
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
 * @typedef SelectionControllerType
 * @property { (OptionType) => void } setSelectedModel
 * @property { ()  => OptionType }    getSelectedModel
 * @property { () => void }           clearSelection
 * @property { (cb: ValueChangeCallback<OptionType>) => void } onModelSelected
 */

/**
 * SelectionController takes a model that will serve as a representative of a selection.
 * Listeners to selection changes will react by synchronizing with the selection.
 * @param  { OptionType } model - the model that is to represent the selection
 * @return { SelectionControllerType }
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
 * @typedef MasterSelectionControllerType
 * @property { () => String }                   getLabel
 * @property { () => void }                     setLabel
 * @property { (cb: ConsumerType<String>) => void }            onLabelChange

 * @property { () => String }                   getName
 * @property { () => void }                     setName
 * @property { (cb: ConsumerType<String>) => void }            onNameChange

 * @property { () => Boolean }                  isOptionsVisible
 * @property { () => void }                     setOptionsVisibility
 * @property { (cb: ConsumerType<Boolean>) => void }           onOptionsVisibilityChange
 * @property { ()  => Array<OptionType> }       getAllOptions

 * @property { ()  => Array<OptionType> }       getValueOptions
 * @property { (OptionType) => void }           addValueOptionsModel
 * @property { (OptionType) => void }           removeValueOptionsModel
 * @property { (cb: ConsumerType<OptionType>) => void }        onValueOptionsModelAdd
 * @property { (cb: ConsumerType<OptionType>) => void }        onValueOptionsModelRemove

 * @property { (col: Number)  => Array<OptionType> }           getCategoryOptions
 * @property { (OptionType) => void }           addCategoryOptionsModel
 * @property { (OptionType) => void }           removeCategoryOptionsModel
 * @property { (cb: ConsumerType<OptionType>) => void }        onCategoryOptionsModelAdd
 * @property { (cb: ConsumerType<OptionType>) => void }        onCategoryOptionsModelRemove

 * @property { () => Boolean }                  isSelectedOptionVisible
 * @property { () => void }                     setSelectedOptionVisibility
 * @property { (cb: ConsumerType<Boolean>) => void }           onSelectedOptionVisibilityChange

 * @property { ()  => OptionType }              getSelectedOptionModel
 * @property { (OptionType) => void }           setSelectedOptionModel
 * @property { ()  => void }                    clearOptionSelection
 * @property { (cb: ValueChangeCallback<OptionType>) => void } onOptionModelSelected

 * @property { ()  => Array<OptionType> }       getSelectedCategoryOptions
 * @property { (OptionType) => void }           toggleSelectedCategoryOptionsModel
 * @property { ()  => void }                    clearSelectedCategoryOptions
 * @property { (cb: ConsumerType<OptionType>) => void }        onSelectedCategoryOptionsModelAdd
 * @property { (cb: ConsumerType<OptionType>) => void }        onSelectedCategoryOptionsModelRemove
 */

/**
 * MasterSelectionController maintains a list and a selection controller.
 * It also maintains observable states like the visibility.
 * @param { MasterSelectionAttribut } masterSelectionAttribut
 * @param { OptionDataType }          initOptions
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
    const supportTypeOfCategoryOptions = Observable(FILTER); // todo add functionality
    const valueOptionsSorted           = Observable(true);
    const categoryOptionsSorted        = Observable(true);

    // todo maybe add navigation controller
    // todo maybe add observable for placeholder
    // todo add observable for validity
    // todo maybe possibility for multi select

    /**
     *
     * @param { ValueOptionDataType } option
     */
    const addValueOptionsModel = option => {
        const valueOptionsController = optionControllerList[0];
        const listOfValues = valueOptionsController.getList().map(option => option.getValue());
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
            categoryCallbacks.add.forEach(cb => listController.onModelAdd(cb));
            categoryCallbacks.remove.forEach(cb => listController.onModelRemove(cb));
            optionControllerList.push(
                ...Array(category.column - optionControllerList.length + 1).fill(listController)
            );
        }
        const categoryOptionsController = optionControllerList[category.column];
        const listOfLabels = categoryOptionsController.getList().map(cat => cat.getLabel());
        // labels should be unique in the column category
        if (!listOfLabels.includes(category.label)) {
            categoryOptionsController.addModel(
                CategoryOption(category.label, category.column, category.categoryLabels)
            );
        }
    };

    const onCategoryOptionsModelAdd = (cb) => {
        categoryCallbacks.add.push(cb);
        optionControllerList.slice(1).forEach(controller => controller.onModelAdd(cb));
    };

    const onCategoryOptionsModelRemove = (cb) => {
        categoryCallbacks.remove.push(cb);
        optionControllerList.slice(1).forEach(controller => controller.onModelRemove(cb));
    };

    /**
     *
     * @returns { Array<OptionType> }
     */
    const getAllOptions = () => {
        const nestedOptions = optionControllerList.map(option => option.getList());
        return nestedOptions.flatMap(option => option);
    };

    // reset selection on remove selected option
    optionControllerList[0].onModelRemove(model => {
        if (model === selectedOptionController.getSelectedModel()) {
            selectedOptionController.clearSelection();
        }
    });

    /**
     *
     * @param { OptionType } toggleModel
     */
    const toggleSelectedCategoryOptionsModel = (toggleModel) => {
        selectedCategoryOptions.getList().forEach(option => {
            if (option.getColumn() < toggleModel.getColumn()) {
                selectedCategoryOptions.removeModel(option);
            }
        });
        if (selectedCategoryOptions.getList().includes(toggleModel)) {
            selectedCategoryOptions.removeModel(toggleModel);
        } else {
            const otherCategory = selectedCategoryOptions
                .getList()
                .filter(option => option.getColumn() === toggleModel.getColumn());
            if (otherCategory.length > 0) {
                // only one category is selected per column
                selectedCategoryOptions.removeModel(otherCategory[0]);
            }
            selectedCategoryOptions.addModel(toggleModel);
        }
    };

    const clearSelectedCategoryOptions = () => {
        selectedCategoryOptions.getList().forEach(option => {
            selectedCategoryOptions.removeModel(option);
        });
    };

    // fill initial options
    initOptions?.categories?.forEach(option => {
        addCategoryOptionsModel(option);
    });
    initOptions.values.forEach(option => {
        addValueOptionsModel(option);
    });

    // prepare selected value option
    const selectedOption = optionControllerList[0]
        .getList()
        .filter(option => option.getValue() === value)[0];
    if (  ""    !== value
        && null !=  selectedOption) {
        selectedOptionController.setSelectedModel(selectedOption);
    }

    return {
        // properties functionality // todo naming ok ?
        getLabel     : labelObs.getValue,
        setLabel     : labelObs.setValue,
        onLabelChange: labelObs.onChange,

        getName     : nameObs.getValue,
        setName     : nameObs.setValue,
        onNameChange: nameObs.onChange,

        // master functionality
        isOptionsVisible         : optionsVisibility.getValue,
        setOptionsVisibility     : optionsVisibility.setValue,
        onOptionsVisibilityChange: optionsVisibility.onChange,
        getAllOptions            : getAllOptions,

        // master  functionality
        getValueOptions          : optionControllerList[0].getList,
        addValueOptionsModel     : addValueOptionsModel,
        removeValueOptionsModel  : optionControllerList[0].removeModel,
        onValueOptionsModelAdd   : optionControllerList[0].onModelAdd,
        onValueOptionsModelRemove: optionControllerList[0].onModelRemove,

        // master categories functionality
        getCategoryOptions          : (col) => optionControllerList[col]?.getList() ?? null,
        addCategoryOptionsModel     : addCategoryOptionsModel,
        removeCategoryOptionsModel  : (o) => optionControllerList[o.getColumn()]?.removeModel(o),
        onCategoryOptionsModelAdd   : onCategoryOptionsModelAdd,
        onCategoryOptionsModelRemove: onCategoryOptionsModelRemove,

        // detail functionality
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
 * @property { Array<ValueOptionDataType> }     values
 * @property { ?Array<CategoryOptionDataType> } categories
 */

/**
 * @typedef CategoryOptionDataType
 * @property { String }         label          - unique in its column of the component
 * @property { ?Number }        column         - can be seen as the level of the category option
 * @property { ?Array<String> } categoryLabels - only labels of categories needed
 */

/**
 * @typedef ValueOptionDataType
 * @property { String }         value          - unique over the component
 * @property { ?String }        label          - visible part of the option
 * @property { ?Array<String> } categoryLabels - only labels of categories needed
 */

/**
 * @typedef MasterSelectionAttribut
 * @property { ?String } value
 * @property { ?String } label
 * @property { ?String } name
 */

/**
 * @typedef { 'filter' | 'jump' } SupportType
 */

/** @type { SupportType } */ const FILTER = 'filter';
/** @type { SupportType } */ const JUMP   = 'jump';
