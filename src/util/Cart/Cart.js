// eslint-disable-next-line import/prefer-default-export
export const checkProducts = (items = {}) => Object.entries(items).reduce((acc, item) => {
    if (item[1].availableQty === 0 || item[1].availableQty < item[1].qty) {
        acc.push(0);
    }

    return acc;
}, []);
