import { SelectComponentByTableValues, pageCss } from "./selectComponent.js";

document.querySelector("head style").textContent += pageCss;

document.addEventListener("DOMContentLoaded", () => {
    console.log("finished loading page");
});

/**
 * Big size demo data to test performance
 * @param  { ...String } elem - filter categories
 * @returns { Array<String> }
 */
const testData = (...elem) =>
    Array(5_000)
        .fill("a")
        .map((e, i) => e + i)
        .filter(e => elem.length === 0 || elem.includes(e));


// ----- country selection with images --------------------------------
/**
 * @type { SelectAttribute }
 */
const selectAttribute = {
    name: "country",
    label: "Country Img",
};
/**
 * @type { OptionsTable }
 */
const valueTable = [
    [], // todo
];
const selectComponent = SelectComponentByTableValues(
    selectAttribute,
    valueTable
).getComponentView();
const componentImg    = document.getElementById("componentImg");
componentImg.append(selectComponent);

// ----- big test data selection 2 column --------------------------------
/**
 * @type { SelectAttribute }
 */
const selectAttribute2 = {
    name: "test",
    label: "Big Data",
};
/**
 * @type { OptionsTable }
 */
const valueTable2 = [
    testData(),
    testData()
];

const selectComponent2 = SelectComponentByTableValues(
    selectAttribute2,
    valueTable2
).getComponentView();
const componentYear    = document.getElementById("componentTest");
componentYear.append(selectComponent2);

// ----- city selection 3 columns --------------------------------
/**
 * @type { SelectAttribute }
 */
const selectAttribute3 = {
    name: "city",
    label: "City",
};
/**
 * @type { OptionsTable }
 */
const valueTable3 = [
    [],
    [],
    [],
];
const selectComponent3 = SelectComponentByTableValues(
    selectAttribute3,
    valueTable3
).getComponentView();
const componentCity    = document.getElementById("componentCity");
componentCity.append(selectComponent3);
