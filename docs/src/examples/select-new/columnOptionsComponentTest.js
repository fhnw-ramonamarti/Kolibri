import { TestSuite }                from "../../kolibri/util/test.js";
import { ColumnOptionsComponent }   from "./columnOptionsComponent.js";
import { SelectedOptionController } from "./optionsController.js";
import { ValueOption, reset }       from "./optionsModel.js";

const columnOptionsComponentSuite = TestSuite("projector/simpleForm/columnOptionsComponent");

columnOptionsComponentSuite.add("Column options component", (assert) => {
    const noSelectionId = reset().getId();
    const cursorPosition = SelectedOptionController();
    const component = ColumnOptionsComponent(cursorPosition);
    assert.is(component.getSelectedOption().getId(), noSelectionId);
    
    let flagSelected = false;
    component.onOptionSelected((_) => flagSelected = true);

    // check select not existing/ contained option
    const val = ValueOption("test");
    const val2 = ValueOption("test2");
    const val3 = ValueOption("test3");
    component.addOption(val);
    component.addOption(val2);
    component.addOption(val3);
    assert.is(component.getColumnView()[0].childElementCount, 3);

    const valCopy = ValueOption("test");
    component.addOption(valCopy);
    assert.is(component.getColumnView()[0].childElementCount, 3);
    
    const selectedElementBefore = component.getColumnView()[0].querySelector('.selected');
    assert.is(selectedElementBefore == null                 , true);
    
    flagSelected = false;
    component.setSelectedOption(val);
    const selectedId          = val.getId().replace("\.", "-");
    const selectedElementById = component
        .getColumnView()[0]
        .querySelector(`[data-id*="${selectedId}"]`);
    const selectedElementAfter = component.getColumnView()[0].querySelector('.selected');
    assert.is(selectedElementAfter != null                 , true);
    assert.is(selectedElementById === selectedElementAfter , true);
    assert.is(flagSelected                                 , true);
    
    component.delOption(val);
    assert.is(component.getColumnView()[0].childElementCount, 2);
    assert.is(component.getSelectedOption().getId(), val.getId());

    component.clearSelectedOption();
    const selectedElementCleared = component.getColumnView()[0].querySelector('.selected');
    assert.is(selectedElementCleared == null                 , true);

    component.clearOptions();
    assert.is(component.getColumnView()[0].childElementCount, 0);
});

columnOptionsComponentSuite.run();
