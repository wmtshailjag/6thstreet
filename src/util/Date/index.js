/* eslint-disable import/prefer-default-export */

/**
 * Formats date to a corresponding string
 * YYYY - Full year, YY - Short year
 * MMMM - Full month, MMM - Short month, MM - Numeric month
 * DD - Day, hh - Hours, mm - Minutes, ss - Seconds
 * @param {string} template - Date format template string
 * @param {Date} dateObject - Date object to format
 * @param {string} locale - Locale
 * @param {string} hourCycle - h12 or h24 hour cycle
 */
import { isArabic } from "Util/App";
import {
  WEEK_ARABIC_TRANSLATION,
  MONTHS_ARABIC_TRANSLATION,
} from "../Common/index";
import {
  DEFAULT_MESSAGE,
  EDD_MESSAGE_ARABIC_TRANSLATION,
} from "../../util/Common/index";

export const formatDate = (
  template,
  dateObject,
  locale = "en-US",
  hourCycle = "h24"
) => {
  const timeMapArray = [
    template.indexOf("YYYY") >= 0
      ? { placeholder: "YYYY", type: "numeric", replace: "year" }
      : null,
    template.indexOf("YY") >= 0
      ? { placeholder: "YY", type: "2-digit", replace: "year" }
      : null,
    template.indexOf("MMMM") >= 0
      ? { placeholder: "MMMM", type: "long", replace: "month" }
      : null,
    template.indexOf("MMM") >= 0
      ? { placeholder: "MMM", type: "short", replace: "month" }
      : null,
    template.indexOf("MM") >= 0
      ? { placeholder: "MM", type: "numeric", replace: "month" }
      : null,
    template.indexOf("DD") >= 0
      ? { placeholder: "DD", type: "numeric", replace: "day" }
      : null,
    template.indexOf("hh") >= 0
      ? { placeholder: "hh", type: "numeric", replace: "hour" }
      : null,
    template.indexOf("mm") >= 0
      ? { placeholder: "mm", type: "numeric", replace: "minute" }
      : null,
    template.indexOf("ss") >= 0
      ? { placeholder: "ss", type: "numeric", replace: "second" }
      : null,
  ].filter((item) => !!item);

  return timeMapArray.reduce((finalString, { placeholder, type, replace }) => {
    const dateFormatter = new Intl.DateTimeFormat(locale, {
      [replace]: type,
      hourCycle,
    });
    const timeValue = dateFormatter.format(dateObject);

    return finalString.replace(
      placeholder,
      timeValue.length <= 1 ? `0${timeValue}` : timeValue
    );
  }, template);
};

export const getDefaultEddDate = (days) => {
  Date.prototype.addDays = function (noOfDays) {
    let tmpDate = new Date(this.valueOf());
    tmpDate.setDate(tmpDate.getDate() + noOfDays);
    return tmpDate;
  };

  let myDate = new Date();
  const defaultEddDate = myDate.addDays(days);
  const defaultEddDateString = myDate
    .addDays(days)
    .toISOString()
    .substring(0, 10);
  const defaultEddDay = defaultEddDate.toLocaleString("en-US", {
    weekday: "long",
  });
  const defaultEddMonth = defaultEddDate.toLocaleString("en-US", {
    month: "short",
  });
  const defaultEddDat = ("0" + defaultEddDate.getDate()).slice(-2);

  return {
    defaultEddDateString,
    defaultEddDay: isArabic()
      ? WEEK_ARABIC_TRANSLATION[defaultEddDay]
      : defaultEddDay,
    defaultEddMonth: isArabic()
      ? MONTHS_ARABIC_TRANSLATION[defaultEddMonth]
      : defaultEddMonth,
    defaultEddDat,
  };
};

export const getCrossBorderDefaultEddDate = (minDays, maxDays) => {
  Date.prototype.addDays = function (noOfDays) {
    let tmpDate = new Date(this.valueOf());
    tmpDate.setDate(tmpDate.getDate() + noOfDays);
    return tmpDate;
  };

  let minDate = new Date();
  let maxDate = new Date();
  const defaultMinEddDate = minDate.addDays(minDays);
  const defaultMaxEddDate = maxDate.addDays(maxDays);
  const defaultMinEddDateString = minDate
    .addDays(minDays)
    .toISOString()
    .substring(0, 10);
  const defaultMaxEddDateString = maxDate
    .addDays(maxDays)
    .toISOString()
    .substring(0, 10);
  const defaultMinEddMonth = defaultMinEddDate.toLocaleString("en-US", {
    month: "short",
  });
  const defaultMinEddDat = ("0" + defaultMinEddDate.getDate()).slice(-2);
  const defaultMaxEddMonth = defaultMaxEddDate.toLocaleString("en-US", {
    month: "short",
  });
  const defaultMaxEddDat = ("0" + defaultMaxEddDate.getDate()).slice(-2);
  return {
    defaultMinEddDateString,
    defaultMaxEddDateString,
    defaultMinEddMonth: isArabic()
      ? MONTHS_ARABIC_TRANSLATION[defaultMinEddMonth]
      : defaultMinEddMonth,
    defaultMaxEddMonth: isArabic()
      ? MONTHS_ARABIC_TRANSLATION[defaultMaxEddMonth]
      : defaultMaxEddMonth,
    defaultMinEddDat,
    defaultMaxEddDat,
  };
};

export const getDefaultEddMessage = (
  default_day,
  default_max_day,
  cross_border
) => {
  let customDefaultMess = isArabic()
    ? EDD_MESSAGE_ARABIC_TRANSLATION[DEFAULT_MESSAGE]
    : DEFAULT_MESSAGE;
  const {
    defaultEddDateString,
    defaultEddDay,
    defaultEddMonth,
    defaultEddDat,
  } = getDefaultEddDate(default_day);
  const {
    defaultMaxEddDat,
    defaultMaxEddDateString,
    defaultMaxEddMonth,
    defaultMinEddDat,
    defaultMinEddDateString,
    defaultMinEddMonth,
  } = getCrossBorderDefaultEddDate(default_day, default_max_day);
  let defaultEddMess = "";
  let defaultEdd = "";
  if (cross_border) {
    defaultEddMess = `${customDefaultMess} ${defaultMinEddDat} ${defaultMinEddMonth} - ${defaultMaxEddDat} ${defaultMaxEddMonth}`;
    defaultEdd = defaultMaxEddDateString;
  } else {
    defaultEddMess = `${customDefaultMess} ${defaultEddDat} ${defaultEddMonth}, ${defaultEddDay}`;
    defaultEdd = defaultEddDateString;
  }
  return { defaultEddMess, defaultEdd };
};
