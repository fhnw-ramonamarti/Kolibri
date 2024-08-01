import { fireEvent, MOUSE_DOWN } from "../../util/dom.js";
import { asyncTest }             from "../../util/test.js";
import { SelectController }      from "./selectController.js";
import { projectSelectViews }    from "./selectProjector.js";


asyncTest("projector/selectComponent/selectProjector label (async)", async assert => { // promise must be set at most once
    // prepare
    const selectAttribute       = { name: "Name", label: "Label" };
    const selectController      = SelectController(selectAttribute, 2);
    const [componentView]       = projectSelectViews(selectController);
    const [label, inputElement] = componentView.children;

    // test the binding label input
    return new Promise(resolve => {
        document.body.appendChild(componentView); // needed for focus
        fireEvent(label, MOUSE_DOWN);

        setTimeout(() => {
            assert.is(document.activeElement             , inputElement);
            document.body.removeChild(componentView); // clean up
            resolve();
        }, 10);
    });
});

asyncTest("projector/selectComponent/selectProjector popover (async)", async assert => { // promise must be set at most once
    // prepare
    const selectAttribute   = { name: "Name", label: "Label" };
    const selectController  = SelectController(selectAttribute, 2);
    const [componentView]   = projectSelectViews(selectController);

    // test the binding popover
    return new Promise(resolve => {
        document.body.appendChild(componentView); // needed for popover
        assert.is(selectController.isOptionsVisible()    , false);
        // open with selected value container
        fireEvent(componentView.querySelector(":not(button).toggleButton"), "click");
        
        setTimeout(() => {
            assert.is(selectController.isOptionsVisible()    , true);
            // close with toggle button
            fireEvent(componentView.querySelector("button.toggleButton"), "click");
 
            setTimeout(() => {
                assert.is(selectController.isOptionsVisible(), false);
                document.body.removeChild(componentView); // clean up
                resolve();
            }, 10);
        }, 0);
    });
});
