import BrowserDatabase from "Util/BrowserDatabase";
import { LOCALES } from "./Url.config";

export {
  clearQueriesFromUrl,
  convertKeyValuesToQueryString,
  convertQueryStringToKeyValuePairs,
  generateQuery,
  getQueryParam,
  getUrlParam,
  objectToUri,
  removeQueryParamWithoutHistory,
  setQueryParams,
  updateKeyValuePairs,
  updateQueryParamWithoutHistory,
} from "SourceUtil/Url/Url";

// eslint-disable-next-line arrow-body-style
export const getLocaleFromUrl = () => {
  return LOCALES.reduce((acc, locale) => {
    if (location.host.includes(locale)) {
      acc.push(locale);
    }

    return acc;
  }, []).toString();
};

export const getLanguageFromUrl = () => {
  const locale = getLocaleFromUrl();

  if (locale) {
    return locale.substring(0, 2);
  }

  return "";
};

export const getCountryFromUrl = () => {
  const locale = getLocaleFromUrl();

  if (locale) {
    return locale.substring("3", "5").toUpperCase();
  }

  return "";
};

export const getUrlParams = (isEncoded = false) => {
  const { search } = location;
  const params = isEncoded
    ? search.substring(1).split("&")
    : atob(search.substring(1)).split("&");

  return params.reduce((acc, param) => {
    acc[param.substr(0, param.indexOf("="))] = param.substr(
      param.indexOf("=") + 1
    );

    return acc;
  }, {});
};

export const setCrossSubdomainCookie = (
  name,
  value,
  days,
  isExpired = false
) => {
  const assign = `${name}=${escape(value)};`;
  const d = new Date();
  // eslint-disable-next-line no-magic-numbers
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
  const time = isExpired ? "Thu, 01 Jan 1970 00:00:01 GMT" : d.toUTCString();
  const expires = `expires=${time};`;
  const path = "path=/;";
  const url = location.host;
  const domain = `domain=${url.substr(url.indexOf("."))};`;
  if(domain !== "domain=.local.localhost:3000;") {
    document.cookie = assign + expires + path + domain;
  } else {
    document.cookie = assign + expires + path + "domain=local.localhost;";
  }
};

export const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length === 2) {
    return parts.pop().split(";").shift();
  }

  return "";
};

export const appendWithStoreCode = (pathname) => pathname;

// isFormatEnabled - param is added to disabled function as CDN team decided to fix all link manually
// TO DO: Remove the method when all link will be fixed
export const formatCDNLink = (url, isFormatEnabled = false) => {
  if (!isFormatEnabled) {
    return url;
  }

  const urlParts = url.match(/\?/)
    ? decodeURI(url).split("?")
    : decodeURI(url).split("#");
  const parts = decodeURI(url).split("&");
  const rebuildUri = parts
    .reduce((acc, part) => {
      if (!acc.length && part.match(/categories.level0/)) {
        acc.push(
          `/${part
            .substr(part.indexOf("=") + 1)
            .replaceAll(" %2F%2F%2F ", "/")
            .replaceAll(" %26 ", "-")
            .replaceAll(" ", "-")
            .toLowerCase()}`
        );
      }

      return acc;
    }, [])
    .join("");

  return `${rebuildUri}.html?${
    urlParts[1] && urlParts[1].match(/^q=/) ? "" : "q="
  }${urlParts[1]}`
    .replace("/men.html", ".html")
    .replace("/women.html", ".html")
    .replace("/kids-baby_boy-boy-girl-baby_girl.html", ".html")
    .replace("/kids.html", ".html")
    .replace("/home.html", ".html");
};

export const getCountryCurrencyCode = () => {
  const {
    config: { countries },
  } = BrowserDatabase.getItem("APP_CONFIG_CACHE_KEY");
  const { currency } = countries[getCountryFromUrl()];
  return currency;
};

export const parseURL = (url) => {
  let parsedURL = "/";
  try {
    parsedURL = new URL(url)
  }
  catch(err) {
    console.error(err)
  }
  return parsedURL;
}