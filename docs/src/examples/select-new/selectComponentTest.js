import { TestSuite }                                                from "../../kolibri/util/test.js";
import { SelectComponentByCallbacks, SelectComponentByTableValues } from "./selectComponent.js";

const selectComponentSuite = TestSuite("projector/simpleForm/selectComponent");

const test2ColumnUiClicks = (componentElement, assert, valueDataSize, categoryDataSize) => {
    const columnsContainer        = componentElement.querySelector(".options-component");
    const valueColumnContainer    = columnsContainer.lastChild;
    const categoryColumnContainer = columnsContainer.firstChild;
    assert.is(columnsContainer.childElementCount       , 2);
    assert.is(valueColumnContainer.childElementCount   , valueDataSize(null));
    assert.is(categoryColumnContainer.childElementCount, categoryDataSize);

    const valueToSelect    = componentElement.querySelector(`.value-options-column :first-child`);
    const categoryToSelect = componentElement.querySelector(`.category-options-column :first-child`);
    let selectedElementBefore, selectedElementAfter;

    // click on value option
    selectedElementBefore = componentElement.querySelector('.value-options-column .selected');
    assert.is(null == selectedElementBefore            , true);
    valueToSelect.click();
    selectedElementAfter  = componentElement.querySelector('.value-options-column .selected');
    assert.is(selectedElementAfter.innerHTML           , valueToSelect.innerHTML);

    // click on category option with value option in it
    selectedElementBefore = componentElement.querySelector('.category-options-column .selected');
    assert.is(null == selectedElementBefore            , true);
    categoryToSelect.click();
    selectedElementAfter  = componentElement.querySelector('.category-options-column .selected');
    assert.is(selectedElementAfter.innerHTML           , categoryToSelect.innerHTML);
    selectedElementAfter  = componentElement.querySelector('.value-options-column .selected');
    assert.is(selectedElementAfter.innerHTML           , valueToSelect.innerHTML);
    assert.is(valueColumnContainer.childElementCount   , valueDataSize(categoryToSelect.innerHTML));

    // click on category option selected to unselect category
    categoryToSelect.click();
    selectedElementAfter = componentElement.querySelector('.category-options-column .selected');
    assert.is(null == selectedElementAfter             , true);
    selectedElementAfter = componentElement.querySelector('.value-options-column .selected');
    assert.is(selectedElementAfter.innerHTML           , valueToSelect.innerHTML);
    assert.is(valueColumnContainer.childElementCount   , valueDataSize());

    // click on category option with value option not in it
    const categoryToSelect2 = componentElement.querySelector(`.category-options-column :last-child`);
    categoryToSelect2.click();
    selectedElementAfter   = componentElement.querySelector('.category-options-column .selected');
    assert.is(selectedElementAfter.innerHTML           , categoryToSelect2.innerHTML);
    selectedElementAfter   = componentElement.querySelector('.value-options-column .selected');
    assert.is(null == selectedElementAfter, true);
    assert.is(valueColumnContainer.childElementCount   , valueDataSize(categoryToSelect2.innerHTML));
}

selectComponentSuite.add("Select component callbacks - 1 column", (assert) => {
    const selectAttribute  = { name: "Name", label: "Label" };
    const getTestData      = () => ["Test 1", "Test 2", "Test 3"];
    const dataSize         = getTestData().length;
    const componentElement = SelectComponentByCallbacks(selectAttribute, [
        getTestData,
    ]).getComponentView();
    
    const columnsContainer     = componentElement.querySelector(".options-component");
    const valueColumnContainer = columnsContainer.firstChild;
    assert.is(columnsContainer.childElementCount    , 1);
    assert.is(valueColumnContainer.childElementCount, dataSize);
    
    const elementToSelect       = componentElement.querySelector(".options-column-item");
    const selectedElementBefore = componentElement.querySelector('.selected');
    assert.is(selectedElementBefore == null         , true);
    
    elementToSelect.click();
    const selectedElementAfter  = componentElement.querySelector('.selected');
    assert.is(
        selectedElementAfter.getAttribute("data-value"),
        elementToSelect.getAttribute("data-value")
    );
});

selectComponentSuite.add("Select component callbacks - 2 column", (assert) => {
    const selectAttribute    = { name: "Name", label: "Label" };
    const getTestValue       = (category) =>
        ["Test 1", "Test 2", "Test 11"].filter(e => 
            null == category || e.endsWith(category)
        );
    const getTestCategory  = () => ["1", "2"];
    const valueDataSize    = (category) => getTestValue(category).length;
    const categoryDataSize = getTestCategory().length;
    const componentElement = SelectComponentByCallbacks(selectAttribute, [
        getTestCategory,
        getTestValue,
    ]).getComponentView();

    test2ColumnUiClicks(componentElement, assert, valueDataSize, categoryDataSize);
});

selectComponentSuite.add("Select component callbacks - disabled", (assert) => {
    const selectAttribute  = { name: "Name", label: "Label", isDisabled: true };
    const getTestData      = () => ["Test 1", "Test 2", "Test 3"];
    const componentElement = SelectComponentByCallbacks(selectAttribute, [
        getTestData,
    ]).getComponentView();
    
    const elementToSelect       = componentElement.querySelector(".options-column-item");
    const selectedElementBefore = componentElement.querySelector('.selected');
    assert.is(null == selectedElementBefore, true);
    
    elementToSelect.click();
    const selectedElementAfter  = componentElement.querySelector('.selected');
    const selectionValue        = componentElement.querySelector('.selected-value')?.innerHTML;
    const inputValue            = componentElement.querySelector('input')?.value;
    assert.is(null == selectedElementAfter , true);
    assert.is("" == selectionValue         , true);
    assert.is("" == inputValue             , true);
});

selectComponentSuite.add("Select component table - 2 column", (assert) => {
    const selectAttribute = { name: "Name", label: "Label"};
    const table           = [
        ["Category 1", "Value 11"],
        ["Category 1", "Value 12"],
        ["Category 1", "Value 13"],
        ["Category 2", "Value 21"],
        ["Category 2", "Value 22"],
        [null        , "Value 31"],
    ];
    const valueDataSize = (category) =>
        category == null ? table.length : table.filter((row) => row[0] == category).length;
    const categoryDataSize = [
        ...new Set(table.map((row) => row[0]).filter((cateory) => null != cateory)),
    ].length;
    const componentElement = SelectComponentByTableValues(
        selectAttribute,
        table
    ).getComponentView();

    test2ColumnUiClicks(componentElement, assert, valueDataSize, categoryDataSize);
});

selectComponentSuite.run();
