import { tableContinentToCity,tableCountry }     from "./DataService.js";
import { SelectComponentByTableValues, pageCss } from "./selectComponent.js";

document.querySelector("head style").textContent += pageCss;

document.addEventListener("DOMContentLoaded", () => {
    console.log("finished loading page");
});


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
const valueTable = tableCountry;
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
    name: "bigData",
    label: "Big Data",
};
/**
 * @type { OptionsTable }
 */
const valueTable2 = Array(5_000)
    .fill("a")
    .map((_, i) => [i + 1 < 10 ? null : String(i + 1).substring(0, 2) + "...", i + 1]);

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
const valueTable3 = tableContinentToCity;
const selectComponent3 = SelectComponentByTableValues(
    selectAttribute3,
    valueTable3
).getComponentView();
const componentCity    = document.getElementById("componentCity");
componentCity.append(selectComponent3);
