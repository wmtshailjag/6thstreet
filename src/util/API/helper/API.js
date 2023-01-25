export const asyncTimeout = (callBack, timeout) => new Promise((resolve) => {
    setTimeout(() => resolve(callBack()), timeout);
});

export const getErrSource = (json) => {
    if (json === 'string') {
        return json;
    }

    const { data } = json;

    if (!data) {
        return json;
    }

    return data;
};

export const getErrorMsg = async (res) => {
    try {
        const json = await res.json();
        const data = getErrSource(json);

        if (typeof data === 'string') {
            return data;
        }

        const {
            error,
            message,
            errors,
            error_codes
        } = data;

        if (!error && !message && !errors && !error_codes) {
            return __('Something Went Wrong');
        }

        if (error_codes) {
            return error_codes;
        }

        if (typeof errors === 'object') {
            return errors[0].toString();
        }

        if (message) {
            return message;
        }

        if (typeof error === 'string') {
            return error;
        }

        if (error.error) {
            return error.error;
        }

        if (error.message && error.parameters) {
            return error;
        }

        return __('Something Went Wrong');
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
        return __('Something Went Wrong');
    }
};
