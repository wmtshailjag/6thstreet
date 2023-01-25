import { capitalizeFirstLetters } from "../../../../../packages/algolia-sdk/app/utils";
import { isArabic } from "Util/App";
const createQuerySuggestionIDRegexp = new RegExp(" ", "g");

export const getCustomQuerySuggestions = (hits, indexName) => {
  const arr = [];
  // eslint-disable-next-line no-restricted-syntax
  for (let ele of hits) {
    const { query } = ele;
    arr.push({
      label: capitalizeFirstLetters(query),
      query,
      count: ele[indexName]?.exact_nb_hits,
      objectID: query?.replace(createQuerySuggestionIDRegexp, "_"),
    });
  }
  return arr;
};

export const getHighlightedText = (text, highlight) => {
  // Split on highlight term and include term into parts, ignore case
  var invalid = /[°"§%()*\[\]{}=\\?´`'#<>|,;.:+_-]+/g;
  var filteredHighlight = highlight.replace(invalid, "");
  const parts = text?.split(new RegExp(`(${filteredHighlight})`, "gi"));
  return (
    <span>
      {" "}
      {parts?.map((part, i) => (
        <span
          key={i}
          style={
            part.toLowerCase() === highlight.toLowerCase()
              ? { fontWeight: "bold" }
              : {}
          }
        >
          {part}
        </span>
      ))}{" "}
    </span>
  );
};

export const getGenderInArabic = (gender) => {
  switch (gender) {
    case "men":
      return "رجال";
    case "women":
      return "نساء";
    case "kids":
      return "أطفال";
    case "home":
      return "منزل";
  }
};

export const getGenderInEnglish = (gender) => {
  switch (gender.trim()) {
    case "رجال":
      return "men";
    case "نساء":
      return "women";
    case "أطفال":
      return "kids";
    case "المنزل":
      return "home";
  }
};

export const getGenderParam = (gender, isProduct = false) => {
  switch (gender.toLowerCase()) {
    case "kids":
      if (isProduct) {
        return isArabic() ? "أولاد~بنات," : "Boy~Girl";
      }
      return isArabic()
        ? "بنات,أولاد,الجنسين,أطفال,طفلة,للرضع"
        : "girl,boy,baby girl,baby boy,unisex,infant, kids";

    case "women":
      return isArabic() ? getGenderInArabic("women") : "women";

    case "men":
      return isArabic() ? getGenderInArabic("men") : "men";

    default:
      return undefined;
  }
};

export const getAlgoliaIndexForQuerySuggestion = (countryCodeFromUrl, lang) => {
  const algoliaENV =
    process.env.REACT_APP_ALGOLIA_ENV === "staging" ? "stage" : "enterprise";
  switch (countryCodeFromUrl) {
    case "en-ae":
      return `${algoliaENV}_magento_english_products`;
    case "ar-ae":
      return `${algoliaENV}_magento_arabic_products`;
    default:
      return `${algoliaENV}_magento_${countryCodeFromUrl.replace(
        "-",
        "_"
      )}_products`;
  }
};