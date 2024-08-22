import { TestSuite }                                from "../../util/test.js";
import { CategoryOption, nullOption, ValueOption }  from "./optionsModel.js";
import { SelectController }                         from "./selectController.js";
import { projectSelectViews }                       from "./selectProjector.js";
import {
    interactionProjectorWithoutSelectionChange,
    interactionProjectorWithSelectionChange,
}                                                   from "./interactionProjector.js";

const selectProjectorSuite = TestSuite("projector/selectComponent/interactionProjector");


/**
 * @param { HTMLElement } elem - html element to trigger the event on
 * @param { String }      key  - name of key
 */
const fireKeyboardEvent = (elem, key) => {
    const event = new KeyboardEvent("keydown", { key: key, code: key });
    elem.dispatchEvent(event);
};

/**
 * The purpose of this binding spike is not to test all possible user interactions and their outcome
 * but rather making sure that the view construction and the binding is properly set up.
 * Complex logic is to be tested against the controller (incl. model).
 */
selectProjectorSuite.add("binding-interaction-without-selection", (assert) => {
    // prepare
    const pageSize         = 3;
    const selectAttribute  = { name: "Name", label: "Label", isCursorPositionWithSelection: true };
    const selectController = SelectController(selectAttribute, 2);
    const [selectView]     = projectSelectViews(selectController);
    interactionProjectorWithoutSelectionChange(selectView, selectController, pageSize);

    // add options
    const valueOptions     = Array(5).fill("").map((_, i) => ValueOption((2 * i + 1) + "Value "));
    const categoryOptions  = Array(2).fill("").map((_, i) => CategoryOption("Cat " + i));
    selectController.getColumnOptionsComponent(0).addOptions(valueOptions);
    selectController.getColumnOptionsComponent(1).addOptions(categoryOptions);

    // helper
    const getColumnOptions          = (col) =>
        selectController.getColumnOptionsComponent(col).getOptions();
    const getColumnSelection        = (col) =>
        selectController.getColumnOptionsComponent(col).getSelectedOption();
    const nullOptionId = nullOption.getId();

    // initial state
    selectView.querySelector(".select-input-component").focus();
    assert.is(getColumnOptions(0).length                  , valueOptions.length);
    assert.is(getColumnOptions(1).length                  , categoryOptions.length);
    assert.is(selectController.isOptionsVisible()         , false);
    assert.is(selectController.getCursorPosition().getId(), nullOptionId);
    assert.is(getColumnSelection(0).getId()               , nullOptionId);

    // init cursor position while closed
    fireKeyboardEvent(selectView, "any key");
    assert.is(getColumnSelection(0).equals(getColumnOptions(0)[0])               , true);
    assert.is(selectController.getCursorPosition().equals(getColumnOptions(0)[0]), true);

    // while popover closed with selection change
    fireKeyboardEvent(selectView, "ArrowUp");
    assert.is(getColumnSelection(0).equals(getColumnOptions(0)[0])               , true);
    assert.is(selectController.getCursorPosition().equals(getColumnOptions(0)[0]), true);

    fireKeyboardEvent(selectView, "ArrowDown");
    assert.is(getColumnSelection(0).equals(getColumnOptions(0)[1])               , true);
    assert.is(selectController.getCursorPosition().equals(getColumnOptions(0)[1]), true);

    fireKeyboardEvent(selectView, "End");
    assert.is(
        getColumnSelection(0).equals(getColumnOptions(0)[getColumnOptions(0).length - 1]),
        true
    );
    assert.is(
        selectController
            .getCursorPosition()
            .equals(getColumnOptions(0)[getColumnOptions(0).length - 1]),
        true
    );

    fireKeyboardEvent(selectView, "ArrowUp");
    assert.is(
        getColumnSelection(0).equals(getColumnOptions(0)[getColumnOptions(0).length - 2]),
        true
    );
    assert.is(
        selectController
            .getCursorPosition()
            .equals(getColumnOptions(0)[getColumnOptions(0).length - 2]),
        true
    ); // 15 tests done

    fireKeyboardEvent(selectView, "Home");
    assert.is(getColumnSelection(0).equals(getColumnOptions(0)[0])               , true);
    assert.is(selectController.getCursorPosition().equals(getColumnOptions(0)[0]), true);

    // simulate backspace
    fireKeyboardEvent(selectView, "Backspace");
    assert.is(getColumnSelection(0).getId()                                      , nullOptionId);
    assert.is(selectController.getCursorPosition().equals(getColumnOptions(0)[0]), true);

    // prepare to open popover
    selectController.getColumnOptionsComponent(0).setSelectedOption(nullOption);
    while (document.querySelector("select-component")) {
        // wait
    }
    document.body.appendChild(selectView); // needed for popover

    // open events
    fireKeyboardEvent(selectView, "Space");
    assert.is(selectController.isOptionsVisible(), true);

    // while popover opened
    fireKeyboardEvent(selectView, "ArrowUp");
    assert.is(getColumnSelection(0).getId()                                      , nullOptionId);
    assert.is(selectController.getCursorPosition().equals(getColumnOptions(0)[0]), true);

    fireKeyboardEvent(selectView, "ArrowDown");
    assert.is(getColumnSelection(0).getId()                                      , nullOptionId);
    assert.is(selectController.getCursorPosition().equals(getColumnOptions(0)[1]), true);

    fireKeyboardEvent(selectView, "End");
    assert.is(getColumnSelection(0).getId()               , nullOptionId);
    assert.is(
        selectController
            .getCursorPosition()
            .equals(getColumnOptions(0)[getColumnOptions(0).length - 1]),
        true
    );

    fireKeyboardEvent(selectView, "ArrowUp");
    assert.is(getColumnSelection(0).getId()               , nullOptionId);
    assert.is(
        selectController
            .getCursorPosition()
            .equals(getColumnOptions(0)[getColumnOptions(0).length - 2]),
        true
    ); // 28 tests done

    fireKeyboardEvent(selectView, "Home");
    assert.is(getColumnSelection(0).getId()               , nullOptionId);
    assert.is(selectController.getCursorPosition().equals(getColumnOptions(0)[0]), true);

    fireKeyboardEvent(selectView, "PageDown");
    assert.is(getColumnSelection(0).getId()               , nullOptionId);
    assert.is(selectController.getCursorPosition().equals(getColumnOptions(0)[pageSize]), true);

    fireKeyboardEvent(selectView, "PageDown");
    assert.is(getColumnSelection(0).getId()               , nullOptionId);
    assert.is(
        selectController
            .getCursorPosition()
            .equals(getColumnOptions(0)[getColumnOptions(0).length - 1]),
        true
    );

    fireKeyboardEvent(selectView, "PageUp");
    assert.is(getColumnSelection(0).getId()               , nullOptionId);
    assert.is(
        selectController
            .getCursorPosition()
            .equals(getColumnOptions(0)[getColumnOptions(0).length - pageSize - 1]),
        true
    );

    let symbol = "5";
    fireKeyboardEvent(selectView, symbol);
    assert.is(getColumnSelection(0).getId()               , nullOptionId);
    assert.is(
        selectController
            .getCursorPosition()
            .equals(getColumnOptions(0).filter(option => option.getLabel().startsWith(symbol))[0]),
        true
    );

    symbol = "2";
    fireKeyboardEvent(selectView, symbol);
    assert.is(getColumnSelection(0).getId()               , nullOptionId);
    assert.is(
        selectController
            .getCursorPosition()
            .equals(getColumnOptions(0).filter(option => option.getLabel().startsWith("3"))[0]),
        true
    );

    symbol = "C";
    fireKeyboardEvent(selectView, symbol);
    assert.is(getColumnSelection(0).getId()               , nullOptionId);
    assert.is(
        selectController
            .getCursorPosition()
            .equals(getColumnOptions(0).filter(option => option.getLabel().startsWith("3"))[0]),
        true
    ); // 42 tests done

    fireKeyboardEvent(selectView, "ArrowRight");
    assert.is(getColumnSelection(0).getId()               , nullOptionId);
    assert.is(getColumnSelection(1).getId()               , nullOptionId);
    assert.is(
        selectController
            .getCursorPosition()
            .equals(getColumnOptions(0).filter(option => option.getLabel().startsWith("3"))[0]),
        true
    );

    fireKeyboardEvent(selectView, "Home");
    fireKeyboardEvent(selectView, "Space");
    assert.is(getColumnSelection(0).equals(getColumnOptions(0)[0])               , true);
    assert.is(getColumnSelection(1).getId()                                      , nullOptionId);
    assert.is(selectController.getCursorPosition().equals(getColumnOptions(0)[0]), true);
    assert.is(selectController.isOptionsVisible()                                , false);

    selectController.setOptionsVisibility(true);
    fireKeyboardEvent(selectView, "ArrowLeft");
    assert.is(getColumnSelection(0).equals(getColumnOptions(0)[0])               , true);
    assert.is(getColumnSelection(1).getId()                                      , nullOptionId);
    assert.is(selectController.getCursorPosition().equals(getColumnOptions(1)[0]), true);

    fireKeyboardEvent(selectView, "Enter");
    assert.is(getColumnSelection(0).equals(getColumnOptions(0)[0])               , true);
    assert.is(getColumnSelection(1).equals(getColumnOptions(1)[0])               , true);

    fireKeyboardEvent(selectView, "PageDown");
    assert.is(getColumnSelection(0).equals(getColumnOptions(0)[0])               , true);
    assert.is(getColumnSelection(1).equals(getColumnOptions(1)[0])               , true);
    assert.is(
        selectController
            .getCursorPosition()
            .equals(getColumnOptions(1)[getColumnOptions(1).length - 1]),
        true
    ); // 57 tests done

    // close events
    assert.is(selectController.isOptionsVisible()   , true);
    fireKeyboardEvent(selectView, "Escape");
    assert.is(selectController.isOptionsVisible()   , false);

    selectController.setOptionsVisibility(true);
    fireKeyboardEvent(selectView, "Tab");
    assert.is(selectController.isOptionsVisible()   , false);

    document.body.removeChild(selectView); // clean up
});

selectProjectorSuite.add("binding-interaction-with-selection", (assert) => {
    // prepare
    const pageSize         = 3;
    const selectAttribute  = { name: "Name", label: "Label" };
    const selectController = SelectController(selectAttribute, 2);
    const [selectView]     = projectSelectViews(selectController);
    interactionProjectorWithSelectionChange(selectView, selectController, pageSize);

    // add options
    const valueOptions     = Array(5).fill("").map((_, i) => ValueOption("Value " + i));
    const categoryOptions  = Array(2).fill("").map((_, i) => CategoryOption("Cat " + i));
    selectController.getColumnOptionsComponent(0).addOptions(valueOptions);
    selectController.getColumnOptionsComponent(1).addOptions(categoryOptions);

    // helper
    const getColumnOptions          = (col) =>
        selectController.getColumnOptionsComponent(col).getOptions();
    const getColumnSelection        = (col) =>
        selectController.getColumnOptionsComponent(col).getSelectedOption();
    const nullOptionId = nullOption.getId();

    // initial state
    selectView.querySelector(".select-input-component").focus();
    assert.is(getColumnOptions(0).length                  , valueOptions.length);
    assert.is(getColumnOptions(1).length                  , categoryOptions.length);
    assert.is(selectController.isOptionsVisible()         , false);
    assert.is(selectController.getCursorPosition().getId(), nullOptionId);
    assert.is(getColumnSelection(0).getId()               , nullOptionId);

    // open events
    selectController.getColumnOptionsComponent(0).setSelectedOption(nullOption);
    document.body.appendChild(selectView); // needed for popover

    // open events
    fireKeyboardEvent(selectView, "Space");
    assert.is(selectController.isOptionsVisible(), true);

    // while popover opened
    fireKeyboardEvent(selectView, "ArrowDown");
    assert.is(getColumnSelection(0).equals(getColumnOptions(0)[1])               , true);
    assert.is(selectController.getCursorPosition().equals(getColumnOptions(0)[1]), true);

    fireKeyboardEvent(selectView, "End");
    assert.is(
        getColumnSelection(0).equals(getColumnOptions(0)[getColumnOptions(0).length - 1]),
        true
    );
    assert.is(
        selectController
            .getCursorPosition()
            .equals(getColumnOptions(0)[getColumnOptions(0).length - 1]),
        true
    ); // 10 tests done

    fireKeyboardEvent(selectView, "ArrowUp");
    assert.is(
        getColumnSelection(0).equals(getColumnOptions(0)[getColumnOptions(0).length - 2]),
        true
    );
    assert.is(
        selectController
            .getCursorPosition()
            .equals(getColumnOptions(0)[getColumnOptions(0).length - 2]),
        true
    );

    fireKeyboardEvent(selectView, "Home");
    fireKeyboardEvent(selectView, "Space");
    assert.is(getColumnSelection(0).equals(getColumnOptions(0)[0])               , true);
    assert.is(getColumnSelection(1).getId()                                      , nullOptionId);
    assert.is(selectController.getCursorPosition().equals(getColumnOptions(0)[0]), true);

    fireKeyboardEvent(selectView, "ArrowLeft");
    assert.is(getColumnSelection(0).equals(getColumnOptions(0)[0])               , true);
    assert.is(getColumnSelection(1).equals(getColumnOptions(1)[0])               , true);
    assert.is(selectController.getCursorPosition().equals(getColumnOptions(1)[0]), true);

    fireKeyboardEvent(selectView, "Enter");
    assert.is(getColumnSelection(0).equals(getColumnOptions(0)[0])               , true);
    assert.is(getColumnSelection(1).getId()                                      , nullOptionId);
    assert.is(selectController.getCursorPosition().equals(getColumnOptions(1)[0]), true);
    assert.is(selectController.isOptionsVisible()                                , true);

    fireKeyboardEvent(selectView, "PageDown");
    assert.is(getColumnSelection(0).equals(getColumnOptions(0)[0])               , true);
    assert.is(
        getColumnSelection(1).equals(getColumnOptions(1)[getColumnOptions(1).length - 1]),
        true
    );
    assert.is(
        selectController
            .getCursorPosition()
            .equals(getColumnOptions(1)[getColumnOptions(1).length - 1]),
        true
    ); // 25 tests done

    // test autoClose = false
    interactionProjectorWithSelectionChange(selectView, selectController, pageSize);
    selectController.setOptionsVisibility(true);
    fireKeyboardEvent(selectView, "ArrowDown");
    fireKeyboardEvent(selectView, "Enter");
    assert.is(selectController.isOptionsVisible()                                , true);

    document.body.removeChild(selectView); // clean up
});

selectProjectorSuite.run();
