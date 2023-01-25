import MagentoAPI from '../../provider/MagentoAPI';

export const postFeedback = (data) => {
    const queryParams = new URLSearchParams();
    Object.keys(data).forEach((key) => {
        queryParams.append(key, data[key]);
    });

    return MagentoAPI.post(`contactus?${queryParams.toString()}`, {}) || {};
};