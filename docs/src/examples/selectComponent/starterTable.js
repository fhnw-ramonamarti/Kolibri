import { tableContinentToCity, tableCountry, tableWithImageLinks } from "./DataService.js";
import {
    pageCss,
    SelectComponentByTableValues,
} from "../../kolibri/projector/selectComponent/selectComponent.js";

document.querySelector("head style").textContent += pageCss;

document.addEventListener("DOMContentLoaded", () => {
    console.log("finished loading page");
});

/** @type { Number } */
const bigDataSize = 5_000;


// ----- country selection with images --------------------------------
/**
 * @type { SelectAttributes }
 */
const selectAttribute  = {
    name : "country",
    label: "Country",
};

const selectComponent  = SelectComponentByTableValues(
    selectAttribute,
    tableCountry
).getComponentView();

const componentCountry = document.getElementById("componentCountry");
componentCountry.append(selectComponent);

// ----- big test data selection 2 column --------------------------------
/**
 * @type { SelectAttributes }
 */
const selectAttribute2 = {
    name : "bigData",
    label: "Big Data",
};
const valueTable2      = /** @type { OptionsTable } */ Array(bigDataSize)
    .fill("a")
    .map((_, i) => [i + 1 < 10 ? null : String(i + 1).substring(0, 2) + "...", i + 1]);

const selectComponent2 = SelectComponentByTableValues(
    selectAttribute2,
    valueTable2
).getComponentView();

const componentBigData = document.getElementById("componentTest");
componentBigData.append(selectComponent2);

// ----- image selection 2 column --------------------------------
/**
 * @type { SelectAttributes }
 */
const selectAttribute2_2 = {
    name : "img",
    label: "Country Img",
};
const valueTable2_2      = tableWithImageLinks
    .map((e) => [e.continent, {
        value: e.country,
        label: `<img src="${e.img}" alt="${e.country}"> ${e.country}`,
    }]);

const selectComponent2_2 = SelectComponentByTableValues(
    selectAttribute2_2,
    valueTable2_2
).getComponentView();

const componentImg       = document.getElementById("componentImg");
componentImg.append(selectComponent2_2);

// ----- city selection 3 columns --------------------------------
/**
 * @type { SelectAttributes }
 */
const selectAttribute3 = {
    name : "region",
    label: "Region (demo slice)",
    isCursorPositionWithSelection: true,
};
const valueTable3      = tableContinentToCity.slice(0, 500);

const selectComponent3 = SelectComponentByTableValues(
    selectAttribute3,
    valueTable3,
    true
).getComponentView();

const componentCity    = document.getElementById("componentCity");
componentCity.append(selectComponent3);
