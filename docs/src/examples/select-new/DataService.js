export {
    getDecades,
    getYearsByDecade,
    getContinents,
    getCountriesByContinent,
    getCitiesByCountry,
    getMoneyByContinent,
    getMoneyContinents,
};

/**
 * Create example data for years in a given decade.
 * @param { ...String } decades
 * @returns { Array<String> }
 */
const getYearsByDecade = (...decades) => {
    const decadeStarts = decades.map(decade => decade.slice(0, 3));
    const data = [...Array(70).keys()].map((e) => e + 1940 + "");
    return data.filter((e) => decadeStarts.length === 0 || decadeStarts.includes(e.slice(0, 3)));
};

/**
 * Create example data of decades.
 * @returns { Array<String> }
 */
const getDecades = () => [...Array(7).keys()].map((e) => e * 10 + 1940 + "'s");

/**
 * Create example data for cities in a given country.
 * @param { ...String } countries
 * @returns { Array<String> }
 */
const getCitiesByCountry = (...countries) => {
    const data = [
        {country: 'Swiss'        , city: "Bern" },
        {country: 'Swiss'        , city: "Brugg" },
        {country: 'Swiss'        , city: "Zurich" },
        {country: 'Germany'      , city: "Berlin" },
        {country: 'Germany'      , city: "Hamburg" },
        {country: 'France'       , city: "Paris" },
        {country: 'France'       , city: "Marseille" },
        {country: 'United States', city: "L.A." },
        {country: 'United States', city: "New York" },
        {country: 'United States', city: "Washington DC" },
        {country: 'Canada'       , city: "Ottawa" },
        {country: 'Japan'        , city: "Tokio" },
    ];
    return data.filter((e) => countries.length === 0 || countries.includes(e.country)).map((e) => e.city).sort();
};

/**
 * Create example data for countries in a given continent.
 * @param { ...String } continents
 * @returns { Array<String> }
 */
const getCountriesByContinent = (...continents) => {
    const data = [
        {country: 'Swiss'        , continent: "Europe" },
        {country: 'Germany'      , continent: "Europe" },
        {country: 'United States', continent: "North America" },
        {country: 'Canada'       , continent: "North America" },
        {country: 'France'       , continent: "Europe" },
        {country: 'Japan'        , continent: "Asia" },
    ];
    return data
        .filter((e) => continents.length === 0 || continents.includes(e.continent))
        .map((e) => e.country).sort();
};

/**
 * Create example data of continents.
 * @returns { Array<String> }
 */
const getContinents = () => [
    "Europe",
    "North America",
    "Asia",
];

/**
 * Create example data for currencies on a given continent.
 * @param { ...String } continents
 * @returns { Array<{label: String, value: String}> }
 */
const getMoneyByContinent = (...continents) => {
    const data = [
        {money: 'CHF'          , continent: "Europe" , img: "https://www.countryflags.com/wp-content/uploads/switzerland-flag-png-large.png"},
        {money: 'Euro'         , continent: "Europe" , img: "https://www.countryflags.com/wp-content/uploads/europe-flag-jpg-xl.jpg"},
        {money: 'US Dollar'    , continent: "America", img: "https://www.countryflags.com/wp-content/uploads/united-states-of-america-flag-png-large.png"},
        {money: 'Canada Dollar', continent: "America", img: "https://www.countryflags.com/wp-content/uploads/canada-flag-png-large.png"}, //thumbs/canada/flag-800.png
        {money: 'Pound'        , continent: "Europe" , img: "https://www.countryflags.com/wp-content/uploads/united-kingdom-flag-png-large.png"},
        {money: 'Yen'          , continent: "Asia"   , img: "https://www.countryflags.com/wp-content/uploads/japan-flag-png-large.png"},
    ];
    const returnData = data.filter((e) => continents.length === 0 || continents.includes(e.continent))
    return false
            ? returnData.map((e) => e.money)
            : returnData.map((e) => ({ 
                value: e.money, 
                label: `<img src="${e.img}" alt="${e.money}"> ${e.money}` 
            }));
};

/**
 * Create example data of continents for currencies.
 * @returns { Array<String> }
 */
const getMoneyContinents = () => [
    "Europe",
    "America",
    "Asia",
];
