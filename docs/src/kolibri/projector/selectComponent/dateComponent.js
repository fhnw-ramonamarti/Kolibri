import { CategoryOption, ValueOption, nullOption }      from "./optionsModel.js";
import { SelectController }                             from "./selectController.js";
import { pageCss as pageComponentCss, projectDateView } from "./dateProjector.js";
import { pageCss as pageCssColumn, updateScrollbar }    from "./columnOptionsProjector.js";
import { interactionProjectorWithSelectionChange }      from "./interactionProjector.js";

export { 
    YEAR_MONTH_DAY, DAY_MONTH_YEAR, MONTH_DAY_YEAR, 
    MONTH_NUMBER, MONTH_SHORT, MONTH_DE, MONTH_EN, MONTH_FR, MONTH_IT, 
    DateComponent, pageCss
};


/**
 * @typedef DateAttributes
 * @property { String? }  label
 * @property { String? }  name
 * @property { Boolean? } isRequired         - select need to have value selected in form, default false
 * @property { Boolean? } isDisabled         - selected value can not be changed, default false
 * @property { Boolean? } withDecades        - show the decades column extended to the year, default false
 * @property { DateFormatType? } dateFormat  - order of the date components, default YMD
 * @property { [Number, Number] } years      - range of years with start incl. and end excl., default: today-100 .. today+1
 * @property { MonthFormatType } monthFormat - format or language of the month, default MONTH_SHORT (english shortcut)
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
        years      : [currentYear - 100, currentYear + 1],
        monthFormat: MONTH_SHORT,
        ...dateAttributes,
    };
    const selectAttributes = { ...dateAttributes, isCursorPositionWithSelection: true };
    const numberOfColumns  = dateAttributes.withDecades ? 4 : 3;
    const selectController = SelectController(selectAttributes, numberOfColumns, [0, 1, 2]);

    const [componentView, selectionElement] = projectDateView(selectController, dateAttributes.dateFormat);
    const [labelElement, inputElement]      = componentView.children;

    /**
     * @param { Boolean } isCategory - defines if column is a category type
     * @returns { (String) => OptionType }
     */
    const mapping = (isCategory) => (e) => {
        return isCategory ? CategoryOption(e) : ValueOption(e);
    };

    // prepare init data
    let [ start, end ] = dateAttributes.years;
    const decaedes     = createDecades(start, end ?? currentYear).map(mapping(true));
    const years        = createYears(start, end ?? currentYear).map(mapping(false));
    const months       = createMonths(dateAttributes.monthFormat).map(mapping(false));
    const days         = createDays().map(mapping(false));
    
    // initial fill of options
    selectController.getColumnOptionsComponent(0).addOptions(days);
    selectController.getColumnOptionsComponent(1).addOptions(months);
    selectController.getColumnOptionsComponent(2).addOptions(years);
    if (dateAttributes.withDecades) {
        selectController.getColumnOptionsComponent(3).addOptions(decaedes);
    }

    // define category option selection changes
    if (dateAttributes.withDecades) {
        selectController.getColumnOptionsComponent(3)?.onOptionSelected((option) => {
            if (option.getId() === nullOption.getId()) {
                inputElement.querySelector(`[data-column="${2}"]`)?.firstChild.scrollIntoView();
                return;
            } 
            const getYear = () => option.getLabel().substring(0, 4);
            const query   = `[data-label="${getYear()}"][data-value="${getYear()}"]`;
            const element = inputElement.querySelector(`[data-column="${2}"] ${query}`);
            element?.scrollIntoView();
        });
    }

    // add interaction
    setTimeout(() => {
        interactionProjectorWithSelectionChange(componentView, selectController);
    }, 81);

    return {
        getSelectController: () => selectController,
        getComponentView   : () => componentView,
        getLabelElement    : () => /** @type { HTMLLabelElement } */ labelElement,
    };
};

/**
 * @private
 * @param { Number } days     - number of days in the month, started with 1
 * @returns { Array<String> } - list of all days from 1 to number of days including end
 */
const createDays = (days = 31) => {
    return [...Array(days).keys()].map((e) => e + 1 + "");
};

/**
 * @private
 * @param { Number } language - format of the month, default shortcut english (MONTH_SHORT)
 * @returns { Array<String> } - list of all months formatted to the given format
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
    return months.map(month => month[language]);
};

/**
 * @private
 * @param { Number } start    - first inclusive year of the interval
 * @param { Number } end      - last inclusive year of the interval
 * @returns { Array<String> } - list of all years including start and end year
 */
const createYears = (start, end) => {
    const differnece = Math.abs(end - start); 
    const years      = [...Array(differnece).keys()].map((e) => e + Math.min(start, end) + "");
    return (end > start) ? years : years.reverse();
};

/**
 * @private
 * @param { Number } start    - first inclusive year of the year interval
 * @param { Number } end      - last inclusive year of the year interval
 * @returns { Array<String> } - list of all decaedes included in the year interval
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
