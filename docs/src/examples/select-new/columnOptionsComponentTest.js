import { TestSuite }                from "../../kolibri/util/test.js";
import { ColumnOptionsComponent }   from "./columnOptionsComponent.js";
import { SelectedOptionController } from "./optionsController.js";
import { ValueOption, nullOption }  from "./optionsModel.js";

const columnOptionsComponentSuite = TestSuite("projector/simpleForm/columnOptionsComponent");

columnOptionsComponentSuite.add("Column options component", (assert) => {
    const noSelectionId  = nullOption.getId();
    const cursorPosition = SelectedOptionController();
    const component      = ColumnOptionsComponent(cursorPosition);
    assert.is(component.getSelectedOption().getId(), noSelectionId);
    
    let flagSelected = false;
    component.onOptionSelected((_) => flagSelected = true);

    // check select not existing/ contained option
    const val  = /** @type { OptionType } */ ValueOption("test");
    const val2 = /** @type { OptionType } */ ValueOption("test2");
    const val3 = /** @type { OptionType } */ ValueOption("test3");
    component.addOption(val);
    component.addOption(val2);
    component.addOption(val3);
    assert.is(component.getColumnView().childElementCount, 3);

    const valCopy = /** @type { OptionType } */ ValueOption("test");
    component.addOption(valCopy);
    assert.is(component.getColumnView().childElementCount, 3);
    
    const selectedElementBefore = component.getColumnView().querySelector('.selected');
    assert.is(null == selectedElementBefore                 , true);
    
    flagSelected = false;
    component.setSelectedOption(val);
    const selectedId          = val.getId().replace("\.", "-");
    const selectedElementById = component
        .getColumnView()
        .querySelector(`[data-id*="${selectedId}"]`);
    const selectedElementAfter = component.getColumnView().querySelector('.selected');
    assert.is(null != selectedElementAfter                 , true);
    assert.is(selectedElementById === selectedElementAfter , true);
    assert.is(flagSelected                                 , true);
    
    component.delOption(val);
    assert.is(component.getColumnView().childElementCount, 2);
    assert.is(component.getSelectedOption().getId(), val.getId());

    component.clearSelectedOption();
    const selectedElementCleared = component.getColumnView().querySelector('.selected');
    assert.is(null == selectedElementCleared               , true);

    component.clearOptions();
    assert.is(component.getColumnView().childElementCount  , 0);
});

columnOptionsComponentSuite.run();
