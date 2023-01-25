import {
  INDICES,
  PREPROD_INDICES,
  FACET_FILTERS,
  NUMERIC_FILTERS,
} from "../config";
import { translate } from "../config/translations";

const deepCopy = (obj) => JSON.parse(JSON.stringify(obj));

const getIndex = (locale, env = "production", type = "default") => {
  try {
    let prefix = "enterprise_";

    if (env === "staging") {
      prefix = "stage_";
    }
     else if (env === "uat") {
      prefix = "preprod_";
    }

    const index =
      env === 'uat' ? PREPROD_INDICES[locale][type] : INDICES[locale][type];
    return `${prefix}${index}`;
  } catch (err) {
    console.error("Index not found", err);
  }
};

const formatResult = (result = {}) => {
  try {
    result.data = result.hits;
    delete result.hits;

    return result;
  } catch (err) {
    console.error(err);
  }
};

const capitalizeFirstLetter = (str = "") => {
  try {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  } catch (error) {
    return null;
  }
};

const capitalizeFirstLetters = (str = "") => {
  try {
    const words = str.split(" ");
    let newStr = "";
    words.forEach((word) => {
      const newWord = capitalizeFirstLetter(word);
      if (!newWord) {
        throw new Error("Error");
      }
      newStr += newWord;
      newStr += " ";
    });
    newStr = newStr.substring(0, newStr.length - 1);
    return newStr;
  } catch (error) {
    return null;
  }
};

const _replaceOperator = (str = "") => {
  switch (true) {
    case /lte/.test(str):
      return str.replace("lte", "<=");
    case /lt/.test(str):
      return str.replace("lt", "<");
    case /gte/.test(str):
      return str.replace("gte", ">=");
    case /gt/.test(str):
      return str.replace("gt", ">");
    case /eq/.test(str):
      return str.replace("eq", "=");
    default:
      return str.replace("", "=");
  }
};

const getAlgoliaFilters = (paramsObj = {}) => {
  try {
    let facetFilters = [];
    let numericFilters = [];

    Object.keys(paramsObj).forEach((key) => {
      if (FACET_FILTERS.includes(key)) {
        const valuesArr = paramsObj[key]
          .split(",")
          .filter((value) => value !== "undefined" && value !== undefined)
          .map((value) => {
            return `${key}:${value}`;
          });

        facetFilters = valuesArr.length
          ? [...facetFilters, valuesArr]
          : facetFilters;
      }

      if (NUMERIC_FILTERS.includes(key)) {
        paramsObj[key].split(",").forEach((value) => {
          numericFilters = [
            ...numericFilters,
            `${key}${_replaceOperator(value)}`,
          ];
        });
      }
    });

    return {
      facetFilters,
      numericFilters,
    };
  } catch (err) {
    console.error(err);
  }
};

const getCurrencyCode = (country) => {
  switch (country) {
    case "ae":
      return "AED";
    case "sa":
      return "SAR";
    case "kw":
      return "KWD";
    case "om":
      return "OMR";
    case "bh":
      return "BHD";
    case "qa":
      return "QAR";
    default:
      return "AED";
  }
};

const isNewIn = (productData = {}) => {
  try {
    const categories = productData.categories;

    if (categories && categories.level1) {
      return categories.level1.some((category) => {
        return (
          category.includes(translate("new_in", "en")) ||
          category.includes(translate("new_in", "ar"))
        );
      });
    }
    return false;
  } catch (error) {
    return false;
  }
};

const formatNewInTag = (productData = {}) => {
  const { is_new_in } = productData;
  return {
    ...productData,
    is_new_in: is_new_in === 1 ? true : false,
  };
};

export {
  deepCopy,
  getIndex,
  formatResult,
  capitalizeFirstLetter,
  capitalizeFirstLetters,
  getAlgoliaFilters,
  getCurrencyCode,
  isNewIn,
  formatNewInTag,
};
