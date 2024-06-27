import { TestSuite }                               from "../../kolibri/util/test.js";
import { CategoryOption, ValueOption, nullOption } from "./optionsModel.js";
import { SelectController }                        from "./selectController.js";
import { projectSelectViews }                      from "./selectProjector.js";

const selectProjectorSuite = TestSuite("projector/simpleForm/selectProjector");

/**
 * The purpose of this binding spike is not to test all possible user interactions and their outcome 
 * but rather making sure that the view construction and the binding is properly set up.
 * Complex logic is to be tested against the controller (incl. model).
 */
selectProjectorSuite.add("binding-column-selection", (assert) => {
    // prepare
    const selectAttribute  = { name: "Name", label: "Label" };
    const selectController = SelectController(selectAttribute, 2);
    const [componentView]  = projectSelectViews(selectController);

    // add options
    const selectedOption   = ValueOption("selected value", "selected label");
    const option           = ValueOption("option");
    const selectedCategory = CategoryOption("selected category");
    const category         = CategoryOption("category");
    selectController
        .getColumnOptionsComponent(0)
        .addOptions(/** @type { Array<OptionType> } */ [option, selectedOption]);
    selectController
        .getColumnOptionsComponent(1)
        .addOptions(/** @type { Array<OptionType> } */ [category, selectedCategory]);

    // get ui elements
    const selectedValueId         = selectedOption.getId().replace("\.", "-");
    const selectedCategoryId      = selectedCategory.getId().replace("\.", "-");
    const selectedValueElement    = componentView.querySelector(`[data-id*="${selectedValueId}"]`);
    const selectedCategoryElement = componentView.querySelector(
        `[data-id*="${selectedCategoryId}"]`
    );

    assert.is(componentView.querySelector('input') != null        , true);

    // test the binding value option
    assert.is(selectController.getSelectedValueOption().getId()   , nullOption.getId());
    selectedValueElement.click();
    assert.is(selectController.getSelectedValueOption().getValue(), selectedOption.getValue());

    // test the binding category option
    assert.is(
        selectController.getColumnOptionsComponent(1).getSelectedOption().getId(),
        nullOption.getId()
    );
    selectedCategoryElement.click();
    assert.is(
        selectController.getColumnOptionsComponent(1).getSelectedOption().getValue(),
        selectedCategory.getValue()
    );

    // noinspection PointlessBooleanExpressionJS
    assert.is(null != selectedValueElement                      , true);
    assert.is(selectedValueElement.innerHTML                    , selectedOption.getLabel());
    assert.is(selectedValueElement.getAttribute("data-value")   , selectedOption.getValue());

    // noinspection PointlessBooleanExpressionJS
    assert.is(null != selectedCategoryElement                   , true);
    assert.is(selectedCategoryElement.innerHTML                 , selectedCategory.getLabel());
    assert.is(selectedCategoryElement.getAttribute("data-value"), selectedCategory.getValue());
});

selectProjectorSuite.run();
