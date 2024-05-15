export { getDecades, getYearsByDecade, getContinents, getCountriesByContinent, getCitiesByCountry};

/**
 *
 * @param { String } decade
 * @returns { Array<String> }
 */
const getYearsByDecade = (decade) => {
    const decadeStart = decade?.slice(0, 3);
    const data = [...Array(70).keys()].map((e) => e + 1940 + "");
    return data.filter((e) => null == decade || e.startsWith(decadeStart));
};

/**
 * 
 * @returns { Array<String> }
 */
const getDecades = () => [...Array(7).keys()].map((e) => e * 10 + 1940 + "'s");

/**
 *
 * @param { String } country
 * @returns { Array<String> }
 */
const getCitiesByCountry = (country) => {
    const data = [
        {country: 'United States',city: "L.A." },
        {country: 'United States',city: "New York" },
        {country: 'United States',city: "Washinton DC" },
        {country: 'Canada',city: "Ottawa" },
        {country: 'Swiss',city: "Bern" },
        {country: 'Swiss',city: "Zurich" },
        {country: 'Swiss',city: "Brugg" },
        {country: 'Germany',city: "Berlin" },
        {country: 'Germany',city: "Hamburg" },
        {country: 'France',city: "Paris" },
        {country: 'France',city: "Marseille" },
        {country: 'Japan',city: "Tokio" },
    ];
    return data.filter((e) => null == country || e.country === country).map((e) => e.city);
};

/**
 *
 * @param { String } continent
 * @returns { Array<String> }
 */
const getCountriesByContinent = (continent) => {
    const data = [
        {country: 'United States',continent: "North America" },
        {country: 'Canada',continent: "North America" },
        {country: 'Swiss',continent: "Europe" },
        {country: 'Germany',continent: "Europe" },
        {country: 'France',continent: "Europe" },
        {country: 'Japan',continent: "Asia" },
    ];
    return data.filter((e) => null == continent || e.continent === continent).map((e) => e.country);
};

/**
 * 
 * @returns { Array<String> }
 */
const getContinents = () => [
    "Europe",
    "North America",
    "Asia",
];
