/* eslint-disable fp/no-let */
// eslint-disable-next-line import/prefer-default-export
import { getGenderInEnglish } from "Util/API/endpoint/Suggestions/Suggestions.create";
export const getBreadcrumbs = (data = [], onClick, urlArray,isArabic) => data.reduce((acc, categoryLevel, idx) => {
    const transformedCategory = categoryLevel.replace(/-/g, ' ');
    const levelFirstData = isArabic ? getGenderInEnglish(data[0].toLowerCase()) :data[0].toLowerCase()
    acc.push({
        url: idx !== 0 ? urlArray[idx]:`/${levelFirstData}.html`,
        name: transformedCategory,
        onClick: idx === 0 ? onClick : () => {}
    });

    return acc;
}, []);

// eslint-disable-next-line max-len
export const getBreadcrumbsUrl = (categoriesLastLevel, menuCategories = []) => menuCategories.reduce((acc, category) => {
    if (category.label === categoriesLastLevel[1]) {
        const currentCategory = category.data[category.data.length - 1] || {};
        acc.push('/', currentCategory.button.link);

        const { items = [] } = currentCategory;

        const mappedCategoryFirstLevel = items
            .reduce((acc, categoryFirst) => {
                if (categoryFirst.label === categoriesLastLevel[2]) {
                    acc.push(categoryFirst.link);
                }

                return acc;
            }, []);

        acc.push(mappedCategoryFirstLevel.length === 1
            ? mappedCategoryFirstLevel[0]
            : currentCategory.button.link);
    }

    return acc;
}, []);