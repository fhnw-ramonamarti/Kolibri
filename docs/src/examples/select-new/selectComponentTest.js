import { TestSuite }       from "../../kolibri/util/test.js";
import { SelectComponent } from "./selectComponent.js";

const selectComponentSuite = TestSuite("projector/simpleForm/selectComponent");

selectComponentSuite.add("Select component - 1 column", (assert) => {
    const selectAttribute    = {name: "Name", label: "Label", numberOfColumns: 1};
    const getTestData        = () => ["Test 1", "Test 2", "Test 3"];
    const dataSize           = getTestData().length;
    const [componentElement] = SelectComponent(selectAttribute, [getTestData]);
    
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

selectComponentSuite.add("Select component - 2 column", (assert) => {
    const selectAttribute    = {name: "Name", label: "Label", numberOfColumns: 2};
    const getTestValue       = (category) =>
        ["Test 1", "Test 2", "Test 11"].filter(e => 
            null == category || e.endsWith(category)
        );
    const getTestCategory    = () => ["1", "2"];
    const valueDataSize      = (category) => getTestValue(category).length;
    const categoryDataSize   = getTestCategory().length;
    const [componentElement] = SelectComponent(selectAttribute, [getTestValue, getTestCategory]);
    
    const columnsContainer        = componentElement.querySelector(".options-component");
    const valueColumnContainer    = columnsContainer.lastChild;
    const categoryColumnContainer = columnsContainer.firstChild;
    assert.is(columnsContainer.childElementCount       , 2);
    assert.is(valueColumnContainer.childElementCount   , valueDataSize(null));
    assert.is(categoryColumnContainer.childElementCount, categoryDataSize);
    
    const valueToSelect    = componentElement.querySelector(`[data-value*="Test 1"]`);
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
    assert.is(selectedElementAfter?.innerHTML           , valueToSelect.innerHTML);
    assert.is(valueColumnContainer.childElementCount   , valueDataSize(categoryToSelect.innerHTML));

    // click on category option selected to unselect category
    categoryToSelect.click();
    selectedElementAfter  = componentElement.querySelector('.category-options-column .selected');
    assert.is(null == selectedElementAfter             , true);
    selectedElementAfter  = componentElement.querySelector('.value-options-column .selected');
    assert.is(selectedElementAfter?.innerHTML           , valueToSelect.innerHTML);
    assert.is(valueColumnContainer.childElementCount   , valueDataSize());
    
    // click on category option with value option not in it
    const categoryToSelect2 = componentElement.querySelector(`.category-options-column :last-child`);
    categoryToSelect2.click();
    selectedElementAfter    = componentElement.querySelector('.category-options-column .selected');
    assert.is(selectedElementAfter.innerHTML           , categoryToSelect2.innerHTML);
    selectedElementAfter    = componentElement.querySelector('.value-options-column .selected');
    assert.is(null == selectedElementAfter             , true);
    assert.is(valueColumnContainer.childElementCount   , valueDataSize(categoryToSelect2.innerHTML));
});

selectComponentSuite.run();
