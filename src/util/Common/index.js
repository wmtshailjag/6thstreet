/* eslint-disable no-magic-numbers */
import cardValidator from "card-validator";
import { isArabic } from "Util/App";

export const CONST_TEN = 10;

export const CONST_HUNDRED = 100;

export const appendOrdinalSuffix = (number) => {
  const mod10x = number % CONST_TEN;
  const mod100x = number % CONST_HUNDRED;

  if (mod10x === 1 && mod100x !== 11) {
    return `${number}st`;
  }

  if (mod10x === 2 && mod100x !== 12) {
    return `${number}nd`;
  }

  if (mod10x === 3 && mod100x !== 13) {
    return `${number}rd`;
  }

  return `${number}th`;
};

export const INTL_BRAND = isArabic()
  ? ["ترينديول", "كوتون"]
  : ["trendyol", "koton"];
export const INTL_BRAND_ARABIC = ["ترينديول", "كوتون"];

export const YES = "Yes"

export const YES_IN_ARABIC = "نعم"

export const NO = "No"

export const NO_IN_ARABIC = "لا"

export const DEFAULT_MESSAGE = "Delivery by";

export const DEFAULT_ARRIVING_MESSAGE = "Arriving by";

export const DEFAULT_READY_MESSAGE = "Ready by";

export const DEFAULT_SPLIT_KEY = isArabic() ? "بواسطه" : "by";

export const DEFAULT_READY_SPLIT_KEY = isArabic() ? "جاهز في غضون" : "Ready by";

export const EDD_MESSAGE_ARABIC_TRANSLATION = {
  "Delivery by": "التوصيل بواسطه",
  "Arriving by": "الوصول بواسطه",
  "Ready by": "جاهز في غضون"
};

export const TRENDING_BRANDS_ENG = "Trending brands";
export const TRENDING_BRANDS_AR = "العلامات التجارية الأكثر رواجاً";

export const SPECIAL_COLORS = {
  beige: "#f5f5dc",
  clear: "#ffffff",
  cream: "#ffe4b5",
  metallic: "#cdb5cd",
  multi: "#000000",
  nude: "#faebd7",
  opaque_color: "#FBFBFB",
  gray400: "#222222",
  darkGray: "#333333",
  lightGray: "#f9f9f9",
  pureWhite: "#FFFFFF",
  offWhite: "#f7f7f7",
  lightOrange: "#cb9f7f",
  ltPink: "#F4E3E0",
  pinkTransparent: "rgba(255, 161, 155, .8)",
  altGrey: "#554C4C",
  fadedGrey: "rgba(85, 76, 76, 0.45)",
  fadedBlack: "#434343",
  doubleDarkPink: "#7E7070",
  silver: "#CAC0C0",
  silver2: "#BFBBBB",
  silver3: "#D1D3D4",
  ltPink2: "#C0BBBB",
  salmon: "#FA8072",
  pinkLine: "#ECE5E5",
  pinkText: "#D6817B",
  pinkBg: "#FDF0EF",
  lightPinkText: "#BDB3B3",
  separator: "#ECE5E5",
  inActiveLightPink: "#ECE5E5",
  dkBlack: "#000000",
  coffee: "#D0C8C8",
  boulder: "#7C7676",
  mercury: "#E4E4E4",
  cararra: "#FAFAF8",
  spring_wood: "#FAFAF8",
  spring_wood2: "#FBFAF8",
  chambray: "#3C5193",
  corn_blue: "#4285F4",
  white_linen: "#FBF0EF",
  contessa: "#CB857E",
  desertStorm: "#EDEDEA",
  silver_chalice: "#AEA9A9",
  green: "#81BE4A",
  pink_red: "#FF918D",
  categoriesGrey: "#F3F3F3",
  yuma: "#C8B581",
  nobel: "#9B9B9B",
  fire_red: "#D12229",
  charcoal: "#4A4A4A",
  zumthor: "#D1D3D4",
  white_smoke: "#EFEFEF",
  snow: "#F9F9F9",
  alto: "#D6D6D6",
  white: "#ffffff",
  black: "#000000",
  black2: "#4A4A4A",
  black3: "#555",
  black4: "#282828",
  transparent_black: "rgba(0,0,0,0.7)",
  red: "#D12229",
  red2: "#ff3232",
  red3: "#FF0029",
  red4: "#F01136",
  pink: "#FFA19B",
  pink2: "#F4E3E0",
  gray: "#F5F5F5",
  gray2: "#D1D3D4",
  gray3: "#CCCCCC",
  gray4: "#EFEFEF",
  gray5: "#9B9B9B",
  gray6: "#F9F9F9",
  gray7: "#D8D8D8",
  gray8: "#F3F4F6",
  grey9: "#F0F0F0",
  gray10: "#ECECEC",
  orange: "#F96446",
  gold: "#C8B581",
  shamrock: "#28D9AA",
  thunder: "#231F20",
  alabaster: "#F8F8F8",
  turquoise: "#3EEDBF",
  sorell_brown: "#CCBA8A",
  wildSand: "#F6F6F6",
  resolutionBlue: "#042295",
  brightTurquoise: "#20EFBE",
  lavenderBlush: "#FFF9FA",
  peach: "#FF7355",
  blush: "#FFC0B2",
  light_pink: "#F4E3E0",
};

export const WEEK_ARABIC_TRANSLATION = {
  Sunday: "الأحد",
  Monday: "الإثنين",
  Tuesday: "الثلاثاء",
  Wednesday: "الأربعاء",
  Thursday: "الخميس",
  Friday: "الجمعة",
  Saturday: "السبت",
};

export const MONTHS_ARABIC_TRANSLATION = {
  Jan: "يناير",
  Feb: "فبراير",
  Mar: "مارس",
  Apr: "أبريل",
  May: "مايو",
  Jun: "يونيو",
  Jul: "يوليو",
  Aug: "أغسطس",
  Sep: "سبتمبر",
  Oct: "أكتوبر",
  Nov: "نوفمبر",
  Dec: "ديسمبر",
};

export const translateArabicColor = (color = "") => {
  switch (color) {
    case "أسود": {
      return "black";
    }
    case "أزرق": {
      return "blue";
    }
    case "أبيض": {
      return "white";
    }
    case "وردي": {
      return "pink";
    }
    case "بني": {
      return "brown";
    }
    case "أحمر": {
      return "red";
    }
    case "متعدد": {
      return "multi";
    }
    case "أخضر": {
      return "green";
    }
    case "معدني": {
      return "metallic";
    }
    case "ذهبي": {
      return "gold";
    }
    case "بنفسجي": {
      return "purple";
    }
    case "أصفر": {
      return "yellow";
    }
    case "برتقالي": {
      return "orange";
    }
    case "فضي": {
      return "silver";
    }
    case "بيج": {
      return "beige";
    }
    case "طبيعي": {
      return "natural";
    }
    case "كحلي": {
      return "dark_blue";
    }
    case "Cream": {
      return "cream";
    }
    case "ذهبي وردي": {
      return "rose_gold";
    }
    case "خوخي": {
      return "peach";
    }
    case "رمادي داكن": {
      return "taupe";
    }
    case "أوف وايت": {
      return "off_white";
    }
    case "عنابي": {
      return "burgundy";
    }
    case "بني داكن": {
      return "dark_brown";
    }
    case "زيتوني": {
      return "olive";
    }
    case "وردي فاتح": {
      return "light_pink";
    }
    case "عاجي": {
      return "ivory";
    }
    case "كاكي": {
      return "khaki";
    }
    case "برونزي": {
      return "bronze";
    }
    case "رصاصي": {
      return "grey";
    }
    case "جلد الجمل": {
      return "camel";
    }
    case "جلد الفهد": {
      return "leopard";
    }
    case "بني فاتح": {
      return "light_brown";
    }
    case "ماروني": {
      return "maroon";
    }
    case "فيروزي": {
      return "turquoise";
    }
    case "رمادي فاتح": {
      return "light_grey";
    }
    case "شفاف": {
      return "transparent";
    }
    case "بني محمر": {
      return "edocha";
    }
    case "لحمي": {
      return "neutral";
    }
    case "حنطي": {
      return "tan";
    }
    case "بني مائل للأصفر": {
      return "camel";
    }
    case "أزرق مائي":
    case "أزرق فاتح": {
      return "light_blue";
    }
    case "gray":
    case "رمادي": {
      return "grey";
    }
    case "Black / White": {
      return "black_white";
    }
    default: {
      // eslint-disable-next-line no-undef
      const color_code = color.toLowerCase().replace(" ", "_");

      if (color_code.includes("beige")) {
        return "beige";
      }
      if (color_code.includes("mauve")) {
        return "mauve";
      }
      if (color_code.includes("rum")) {
        return "rum";
      }
      if (color_code.includes("raspberry")) {
        return "raspberry";
      }
      if (color_code.includes("honey")) {
        return "honey";
      }

      return color_code;
    }
  }
};

const MADA_BINS = new Set([
  "588845",
  "440647",
  "440795",
  "446404",
  "457865",
  "968208",
  "588846",
  "493428",
  "539931",
  "558848",
  "557606",
  "968210",
  "636120",
  "417633",
  "468540",
  "468541",
  "468542",
  "468543",
  "968201",
  "446393",
  "588847",
  "400861",
  "409201",
  "458456",
  "484783",
  "968205",
  "462220",
  "455708",
  "588848",
  "455036",
  "968203",
  "486094",
  "486095",
  "486096",
  "504300",
  "440533",
  "489317",
  "489318",
  "489319",
  "445564",
  "968211",
  "401757",
  "410685",
  "432328",
  "428671",
  "428672",
  "428673",
  "968206",
  "446672",
  "543357",
  "434107",
  "431361",
  "604906",
  "521076",
  "588850",
  "968202",
  "535825",
  "529415",
  "543085",
  "524130",
  "554180",
  "549760",
  "588849",
  "968209",
  "524514",
  "529741",
  "537767",
  "535989",
  "536023",
  "513213",
  "585265",
  "588983",
  "588982",
  "589005",
  "508160",
  "531095",
  "530906",
  "532013",
  "588851",
  "605141",
  "968204",
  "422817",
  "422818",
  "422819",
  "428331",
  "483010",
  "483011",
  "483012",
  "589206",
  "968207",
  "419593",
  "439954",
  "407197",
  "407395",
  "520058",
  "530060",
  "531196",
]);

export const getCardType = (cardNumber = "") => {
  try {
    const bin = cardNumber.replace(/\s?/g, "").substr(0, 6);
    if (MADA_BINS.has(bin)) {
      return {
        type: "mada",
        niceType: "Mada",
      };
    }

    const { card } = cardValidator.number(cardNumber);
    return {
      type: card.type,
      niceType: card.niceType,
    };
  } catch (err) {
    return {
      type: "",
      niceType: "",
    };
  }
};

export const camelCase = (str) => {
  return str.toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export const getBambuserChannelID=(country)=>{
  if(process.env.REACT_APP_BAMBUSER_ENV === "staging") {
    switch (country) {
      case "ae":
        return "QfxqiD3TAwAWSQcoPTva";
      case "sa":
        return "3vYn5j0lmNq4H6juUyHo";
      case "kw":
        return "H2d8ao0cIDOSB0Mes0gS";
      case "om":
        return "GYKTtxynbwwnx8PERIls";
      case "bh":
        return "2YTiep0n0GzNSUpUhMF0";
      case "qa":
        return "m5QBkcoSL4IPgyMRZb0m";
      default:
        return "QfxqiD3TAwAWSQcoPTva";
    }
  } else {
    switch (country) {
      case "ae":
        return "RQi9v57VXHIFetDai47q";
      case "sa":
        return "LSC8XG1YSbgdX6Adwds4";
      case "kw":
        return "SbFHRnzIUHdcORz2ELjd";
      case "om":
        return "JFEsZsxpy6mp1HaawJvH";
      case "bh":
        return "TvklSoghpVJPJttPB94u";
      case "qa":
        return "mLnmwfhhDQZa8OzDYmni";
      default:
        return "RQi9v57VXHIFetDai47q";
    }
  }
}