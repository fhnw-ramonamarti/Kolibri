import {
    pageCss,
    DateComponent,
    DAY_MONTH_YEAR,
} from "../../kolibri/projector/selectComponent/dateComponent.js";

document.querySelector("head style").textContent += pageCss;

/**
 * @type { DateAttributes }
 */
const dateAttribute  = {
    name      : "birthday",
    label     : "Birthday",
    years     : [1944, 2011],
    dateFormat: DAY_MONTH_YEAR,
};

const dateComponent  = DateComponent(
    dateAttribute,
).getComponentView();

const componentDate = document.getElementById("componentDate");
componentDate.append(dateComponent);


/**
* @type { DateAttributes }
*/
const dateAttribute2  = {
    name       : "birthday",
    label      : "Birthday",
    withDecades: true,
};

const dateComponent2  = DateComponent(
    dateAttribute2
).getComponentView();

const componentDateDecade = document.getElementById("componentDateDecade");
componentDateDecade.append(dateComponent2);
