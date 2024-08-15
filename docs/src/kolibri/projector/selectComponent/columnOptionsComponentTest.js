import { TestSuite }                from "../../util/test.js";
import { ColumnOptionsComponent }   from "./columnOptionsComponent.js";
import { SelectedOptionController } from "./optionsController.js";
import { ValueOption, nullOption }  from "./optionsModel.js";

const columnOptionsComponentSuite = TestSuite("projector/selectComponent/columnOptionsComponent");

columnOptionsComponentSuite.add("Column options component", (assert) => {
    const noSelectionId  = nullOption.getId();
    const cursorPosition = SelectedOptionController();
    const component      = ColumnOptionsComponent(cursorPosition);
    const view           = component.getColumnView();
    assert.is(component.getSelectedOption().getId(), noSelectionId);
    
    let flagSelected = false;
    component.onOptionSelected((_) => flagSelected = true);

    // check select not existing/ contained option
    const val  = /** @type { OptionType } */ ValueOption("test");
    const val2 = /** @type { OptionType } */ ValueOption("test2");
    const val3 = /** @type { OptionType } */ ValueOption("test3");
    component.addOptions([val, val2, val3]);
    assert.is(view.childElementCount                       , 3);

    const valCopy = /** @type { OptionType } */ ValueOption("test");
    component.addOptions([valCopy]);
    assert.is(view.childElementCount                       , 3);
    
    const selectedElementBefore = view.querySelector('.selected');
    assert.is(null == selectedElementBefore                , true);
    
    flagSelected = false;
    component.setSelectedOption(val);
    const selectedId           = val.getId().replace("\.", "-");
    const selectedElementById  = view.querySelector(`[data-id*="${selectedId}"]`);
    const selectedElementAfter = view.querySelector('.selected');
    assert.is(null != selectedElementAfter                 , true);
    assert.is(selectedElementById === selectedElementAfter , true);
    assert.is(flagSelected                                 , true);
    
    component.delOptions([val]);
    assert.is(view.childElementCount                       , 2);
    assert.is(component.getSelectedOption().getId(), val.getId());

    component.clearSelectedOption();
    const selectedElementCleared = view.querySelector('.selected');
    assert.is(null == selectedElementCleared               , true);

    component.clearOptions();
    assert.is(view.childElementCount                       , 0);
});

columnOptionsComponentSuite.run();
