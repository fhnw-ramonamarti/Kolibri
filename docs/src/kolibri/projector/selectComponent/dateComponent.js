import { CategoryOption, ValueOption, nullOption }      from "./optionsModel.js";
import { SelectController }                             from "./selectController.js";
import { pageCss as pageComponentCss, projectDateView } from "./dateProjector.js";
import { pageCss as pageCssColumn }                     from "./columnOptionsProjector.js";
import { dateInteractionProjector }                     from "./dateInteractionProjector.js";

export { 
    YEAR_MONTH_DAY, DAY_MONTH_YEAR, MONTH_DAY_YEAR, 
    MONTH_NUMBER, MONTH_SHORT, MONTH_DE, MONTH_EN, MONTH_FR, MONTH_IT, 
    DateComponent, pageCss
};


/**
 * @typedef DateAttributes
 * @property { String? }  label
 * @property { String? }  name
 * @property { Boolean? } isRequired          - select need to have value selected in form, default false
 * @property { Boolean? } isDisabled          - selected value can not be changed, default false
 * @property { Boolean? } withDecades         - show the decades column extended to the year, default false
 * @property { DateFormatType? } dateFormat   - order of the date components, default YMD
 * @property { MonthFormatType? } monthFormat - format or language of the month, default MONTH_SHORT (english shortcut)
 * @property { [Number, Number]? } years      - range of years with start incl. and end excl., default: today-100 .. today+1
 */


/**
 * @typedef { 'YMD' | 'DMY' | 'MDY' } DateFormatType
 */

/** @type { DateFormatType } */ const YEAR_MONTH_DAY = "YMD";
/** @type { DateFormatType } */ const DAY_MONTH_YEAR = "DMY";
/** @type { DateFormatType } */ const MONTH_DAY_YEAR = "MDY";


/**
 * @typedef { 'num' | 'short' | 'de' | 'en' | 'fr' | 'it' } MonthFormatType
 */

/** @type { MonthFormatType } */ const MONTH_NUMBER = "num";
/** @type { MonthFormatType } */ const MONTH_SHORT  = "short";
/** @type { MonthFormatType } */ const MONTH_DE     = "de";
/** @type { MonthFormatType } */ const MONTH_EN     = "en";
/** @type { MonthFormatType } */ const MONTH_FR     = "fr";
/** @type { MonthFormatType } */ const MONTH_IT     = "it";


/**
 * 
 * @param { DateAttributes } dateAttributes 
 * @returns { SelectComponentType } 
 * @constructor
 * @example 
        const selectAttributes = { name: 'birthday', label: 'Birthday' };
        const component        = DateComponent(dateAttributes);
 */
const DateComponent = (dateAttributes) => {
    const currentYear = new Date().getFullYear();
    dateAttributes    = {
        label      : "",
        name       : "",
        isRequired : false,
        isDisabled : false,
        withDecades: false,
        dateFormat : YEAR_MONTH_DAY,
        monthFormat: MONTH_SHORT,
        years      : [currentYear, currentYear - 100],
        ...dateAttributes,
    };
    const selectAttributes = { ...dateAttributes, isCursorPositionWithSelection: true };
    const numberOfColumns  = dateAttributes.withDecades ? 4 : 3;
    const selectController = SelectController(selectAttributes, numberOfColumns, [0, 1, 2]);

    const [componentView, _]           = projectDateView(selectController, dateAttributes.dateFormat);
    const [labelElement, inputElement] = componentView.children;

    /**
     * @param { Boolean } isCategory - defines if column is a category type
     * @returns { (String) => OptionType }
     */
    const mapping = (isCategory) => (e) => {
        return isCategory ? CategoryOption(e) : ValueOption(e);
    };

    // prepare init data
    let [ start, end ] = dateAttributes.years;
    const decades      = createDecades(start, end ?? currentYear).map(mapping(true));
    const years        = createYears(start, end ?? currentYear).map(mapping(false));
    const months       = createMonths(dateAttributes.monthFormat).map(mapping(false));
    const days         = createDays().map(mapping(false));
    
    // initial fill of options
    selectController.getColumnOptionsComponent(0).addOptions(days);
    selectController.getColumnOptionsComponent(1).addOptions(months);
    selectController.getColumnOptionsComponent(2).addOptions(years);
    if (dateAttributes.withDecades) {
        selectController.getColumnOptionsComponent(3).addOptions(decades);
    }

    /**
     * @param { HTMLDivElement } element - html element of a single option
     * @returns { OptionType }           - option fitting to the html element
     */
    const findOptionByElement = (element) => {
        const optionValue   = element.getAttribute("data-value");
        const optionLabel   = element.innerHTML;
        const columnOptions = selectController
            .getColumnOptionsComponent(2)
            .getOptions();
        return columnOptions.find(
            (option) =>
                option.getLabel() === optionLabel &&
                option.getValue() === optionValue
        );
    };

    // define category option selection changes
    if (dateAttributes.withDecades) {
        selectController.getColumnOptionsComponent(3)?.onOptionSelected((option) => {
            if (option.getId() === nullOption.getId()) {
                return;
            } 
            const getYear = () => option.getLabel().substring(0, 4);
            const query   = `[data-label="${getYear()}"][data-value="${getYear()}"]`;
            const element = inputElement.querySelector(`[data-column="${2}"] ${query}`);
            element?.scrollIntoView(false);
            selectController
                .getColumnOptionsComponent(2)
                .setSelectedOption(findOptionByElement(element));
            selectController.getColumnOptionsComponent(3).setSelectedOption(nullOption);
        });
    }

    /**
     * Update days due to selected year and month
     */
    const getDays = () => {
        const selectedYear = selectController
            .getColumnOptionsComponent(2)
            .getSelectedOption()
            .getValue();
        const yearNumber = Number(selectedYear ?? 0);

        const selectedMonth = selectController
            .getColumnOptionsComponent(1)
            .getSelectedOption()
            .getValue();
        const monthNumber = Number(
            createMonths("all").filter(
                (month) => Object.values(month).indexOf(selectedMonth) > -1
            )[0]?.num ?? 0
        );
        const month31 = [0, 1, 3, 5, 7, 8, 10, 12];
        const month30 = [4, 6, 9, 11];

        // days29To31 with [0: 29, 1: 30, 2: 31]
        const days29To31 = days.filter((option) => option.getLabel() > 28);
        const biggestDay = Number(
            selectController
                .getColumnOptionsComponent(0)
                .getOptions()
                .map((option) => option.getValue())
                .reverse()[0]
        );

        // days contain 31 values
        if (month31.includes(monthNumber)) {
            if (biggestDay < 31) {
                selectController.getColumnOptionsComponent(0).addOptions(days29To31);
            }
        }

        // days contain 30 values
        if (month30.includes(monthNumber)) {
            if (biggestDay < 30) {
                selectController.getColumnOptionsComponent(0).addOptions(days29To31.slice(0, -1));
            }
            if (biggestDay > 30) {
                selectController.getColumnOptionsComponent(0).delOptions(days29To31.slice(2));
            }
        }

        /**
         * @param { Number } year 
         * @returns { Boolean } - year has 29th in February
         */
        const isLeap = (year) => {
            if (year % 1000 === 0) {
                return true;
            }
            if (year % 100 === 0) {
                return false;
            }
            return year % 4 === 0;

        };

        // days contain 28 values (non leap year)
        if (2 === monthNumber && (!isLeap(yearNumber) || selectedYear === "")) {
            if (biggestDay > 28) {
                selectController.getColumnOptionsComponent(0).delOptions(days29To31);
            }
        }

        // days contain 29 values (leap year)
        if (2 === monthNumber && isLeap(yearNumber) && selectedYear !== "") {
            if (biggestDay < 29) {
                selectController.getColumnOptionsComponent(0).addOptions(days29To31.slice(0, -2));
            }
            if (biggestDay > 29) {
                selectController.getColumnOptionsComponent(0).delOptions(days29To31.slice(1));
            }
        }

        // update day
        const selectedDay = selectController.getColumnOptionsComponent(0).getSelectedOption();
        if (
            selectController
                .getColumnOptionsComponent(0)
                .getOptions()
                .filter((option) => option.equals(selectedDay)).length === 0
        ) {
            selectController.getColumnOptionsComponent(0).setSelectedOption(nullOption);
        }
    };

    // define date selection validation
    selectController.getColumnOptionsComponent(2)?.onOptionSelected((_) => {
        // year change
        getDays();
    });
    selectController.getColumnOptionsComponent(1)?.onOptionSelected((_) => {
        // month change
        getDays();
    });

    // add interaction
    setTimeout(() => {
        dateInteractionProjector(componentView, selectController);
    }, 81);

    return {
        getSelectController: () => selectController,
        getComponentView   : () => componentView,
        getLabelElement    : () => /** @type { HTMLLabelElement } */ labelElement,
    };
};

/**
 * @private
 * @returns { Array<String> } - list of all days from 1 to number of days including end
 */
const createDays = () => {
    return [...Array(31).keys()].map((e) => e + 1 + "");
};

/**
 * @private
 * @param { MonthFormatType | 'all' } language - format of the month, default shortcut english (MONTH_SHORT)
 * @returns { Array<String> }                  - list of all months formatted to the given format
 */
const createMonths = (language = MONTH_SHORT) => {
    const months = [
        { num: '01', short: 'Jan', de: 'Januar',    en: 'January',   fr: 'Janvier',   it: 'Gennaio'   },
        { num: '02', short: 'Feb', de: 'Februar',   en: 'February',  fr: 'Février',   it: 'Febbraio'  },
        { num: '03', short: 'Mar', de: 'März',      en: 'March',     fr: 'Mars',      it: 'Marzo'     },
        { num: '04', short: 'Apr', de: 'April',     en: 'April',     fr: 'Avril',     it: 'Aprile'    },
        { num: '05', short: 'May', de: 'Mai',       en: 'May',       fr: 'Mai',       it: 'Maggio'    },
        { num: '06', short: 'Jun', de: 'Juni',      en: 'June',      fr: 'Juin',      it: 'Giugno'    },
        { num: '07', short: 'Jul', de: 'Juli',      en: 'July',      fr: 'Juillet',   it: 'Luglio'    },
        { num: '08', short: 'Aug', de: 'August',    en: 'August',    fr: 'Août',      it: 'Agosto'    },
        { num: '09', short: 'Sep', de: 'September', en: 'September', fr: 'Septembre', it: 'Settembre' },
        { num: '10', short: 'Oct', de: 'Oktober',   en: 'October',   fr: 'Octobre',   it: 'Ottobre'   },
        { num: '11', short: 'Nov', de: 'November',  en: 'November',  fr: 'Novembre',  it: 'Novembre'  },
        { num: '12', short: 'Dec', de: 'Dezember',  en: 'December',  fr: 'Décembre',  it: 'Dicembre'  },
    ];
    if ("all" === language) {
        return months;
    }
    return months.map(month => month[language]);
};

/**
 * @private
 * @param { Number } start    - first inclusive year of the interval
 * @param { Number } end      - last inclusive year of the interval
 * @returns { Array<String> } - list of all years including start and end year
 */
const createYears = (start, end) => {
    const difference = Math.abs(end - start + 1);
    const years      = [...Array(difference).keys()].map((e) => e + Math.min(start, end) + "");
    return (end > start) ? years : years.reverse();
};

/**
 * @private
 * @param { Number } start    - first inclusive year of the year interval
 * @param { Number } end      - last inclusive year of the year interval
 * @returns { Array<String> } - list of all decades included in the year interval
 */
const createDecades = (start, end) => {
    const startDecade = Math.ceil(start / 10);
    const endDecade   = Math.ceil(end / 10);
    const differnece  = Math.abs(endDecade - startDecade); 
    const decades     = [...Array(differnece).keys()].map(
        (e) => e + Math.min(startDecade, endDecade) + "0's"
    );
    return (endDecade > startDecade) ? decades : decades.reverse();
};

/**
 * CSS snippet to append to the head style when using the date select component.
 * @type { String }
 * @example
        document.querySelector("head style").textContent += pageCss;
 */
const pageCss = pageCssColumn + "\n" + pageComponentCss;
