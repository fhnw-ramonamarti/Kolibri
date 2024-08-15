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
