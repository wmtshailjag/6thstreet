import { getQueryValues } from "../utils/query";
import { sum } from "../utils/num";
import { sortKeys } from "../utils/obj";
import { translate } from "../config/translations";

/*
  Note
  Without categories_without_path complete,
  there's NO WAY to filter by all L1 category when a combination of genders is selected (eg. Women, Men, Boy)
*/

const _getLevelsFromCategoryKey = ({ key }) => {
  const levels = key.split(" /// ");
  const kidsTransaltions = [translate("kids", "en"), translate("kids", "ar")];

  const l0 = levels[0];
  const offset = !kidsTransaltions.includes(l0) ? 0 : 1;
  const l1 = levels[offset + 1];
  const l2 = levels[offset + 2];
  const l3 = levels[offset + 3];

  return {
    l0,
    l1,
    l2,
    l3,
  };
};

const _getCategoryLevel2Data = ({
  facetKey,
  categoriesLevel2,
  categoriesLevel3,
  categoriesWithoutPath,
  query,
}) => {
  let totalSelectedFiltersCount = 0;

  /*
    Both 'categories.level2' and 'categories.level3' are needed because

    For Women|Men, you can get the L2 category from 'categories.level2':
    Men /// Accessories /// Hats
    Women /// Accessories /// Hats
    => Hats

    But for Kids, there's an additional 'Kids' prefix in 'categories.level2':
    Kids /// Girl /// Accessories
    => ??

    And you can only the L1 category.

    So, we use 'categories.level3' too
    Kids /// Girl /// Accessories /// Hats
    => Hats

    And merge the two category levels together
  */
  const categoriesMerge = {
    ...categoriesLevel2,
    ...categoriesLevel3,
  };

  const queryValues = getQueryValues({ query, path: facetKey });
  let data = Object.entries(categoriesMerge).reduce(
    (acc, [key, productCount]) => {
      const {
        l1: l1Key,
        l2: l2Key,
        l3: l3Key,
        l1,
        l2,
        l3,
      } = _getLevelsFromCategoryKey({ key });
      // let l2 = query["categories.level2"] ? l3Key : l2Key; code for l2 and l3 logic
      // let l1 = query["categories.level2"] ? l2Key : l1Key;

      // TODO: Add proper logger
      if (l2 && categoriesWithoutPath && !categoriesWithoutPath[l2] && __DEV__) {
        console.warn("No categories_without_path for", l2);
      }

      if (l2 && categoriesWithoutPath && categoriesWithoutPath[l2]) {
        if (!acc[l1]) {
          acc[l1] = {
            label: l1,
            facet_key: facetKey,
            facet_value: l1,
            selected_filters_count: 0,
            product_count: 0,
            subcategories: {},
          };
        }

        // Total product count per category
        acc[l1].product_count = sum(acc[l1].product_count, productCount);

        acc[l1].subcategories[l2] = {
          facet_value: l2,
          facet_key: facetKey,
          label: l2,
          is_selected: false,
          product_count: categoriesWithoutPath[l2],
        };

        // Mark selected filters, using the query params
        if (queryValues[l2]) {
          if (acc[l1].selected_filters_count === 0) {
            totalSelectedFiltersCount += 1;
          }
          acc[l1].selected_filters_count += 1;
          acc[l1].subcategories[l2].is_selected = true;
        }
      }

      return acc;
    },
    {}
  );

  // Sort by product_count in category
  data = sortKeys(data, (obj1, obj2) => {
    const [, a] = obj1;
    const [, b] = obj2;
    return b.product_count - a.product_count;
  });
  return [data, totalSelectedFiltersCount];
};

const _getCategoryLevel1Data = ({
  facetKey,
  categoriesLevel1,
  categoriesLevel2,
  query,
}) => {
  let totalSelectedFiltersCount = 0;

  const queryValues = getQueryValues({ query, path: facetKey });

  /*
    Same as above, we need both 'categories.level1' and 'categories.level2'
    to get the L1 category
  */
  const categoriesMerge = {
    ...categoriesLevel1,
    ...categoriesLevel2,
  };

  let data = Object.entries(categoriesMerge).reduce(
    (acc, [key, productCount]) => {
      const { l1, l2 } = _getLevelsFromCategoryKey({ key });

      // Take L1 into account, but ignore all L2s
      if (l1 && !l2) {
        acc[key] = {
          label: l1,
          facet_key: facetKey,
          facet_value: key,
          is_selected: false,
          product_count: sum(acc[key]?.product_count, productCount),
        };

        // Mark selected filters, using the query params
        if (queryValues[key]) {
          totalSelectedFiltersCount += 1;
          acc[key].is_selected = true;
        }
      }

      return acc;
    },
    {}
  );

  return [data, totalSelectedFiltersCount];
};

const makeCategoriesWithoutPathFilter = ({ facets, query }) => {
  const facetKey = "categories_without_path";
  // let categoriesLevel2Data = query["categories.level2"]
  //   ? {}
  //   : facets["categories.level2"];
  const [data, totalSelectedFiltersCount] = _getCategoryLevel2Data({
    facetKey,
    categoriesLevel2: facets["categories.level2"],
    categoriesLevel3: facets["categories.level3"],
    categoriesWithoutPath: facets.categories_without_path,
    query,
  });
  return {
    label: __("Categories"),
    category: facetKey,
    is_radio: false,
    is_nested: true,
    selected_filters_count: totalSelectedFiltersCount,
    data,
  };
};

const makeCategoriesLevel1Filter = ({ facets, query }) => {
  const facetKey = "categories.level1";
  const [data, totalSelectedFiltersCount] = _getCategoryLevel1Data({
    facetKey,
    categoriesLevel1: facets["categories.level1"],
    categoriesLevel2: facets["categories.level2"],
    query,
  });

  return {
    label: "Categories Level 1",
    category: facetKey,
    is_radio: false,
    selected_filters_count: totalSelectedFiltersCount,
    data,
  };
};

export { makeCategoriesWithoutPathFilter, makeCategoriesLevel1Filter };
