const DEFAULT_QUERY = {
    num_results: 10,
    filters: [], // docs here https://docs.vue.ai/#the-widgets-api
    user_id: "",
    product_id: "", // only for 'visually_similar'
};

const MAX_NUM_RESULTS = 50;

export class VueQuery {

    enforceType = (data, { checkFunc, fallback }) => {
        return checkFunc(data) ? data : fallback;
    };

    enforceArray = (data) => {
        return this.enforceType(data, {
            checkFunc: (_data) => Array.isArray(_data),
            fallback: [],
        });
    };

    capitalizeFirstLetter = (str) => {
        return str.charAt(0).toUpperCase() + str.slice(1);
    };

    buildFilters = (query, localParams) => {
        const { gender } = localParams;
        const { filters } = query;
        let current = [...this.enforceArray(filters)];

        /*
          To have a default filtering by `gender`, add a `gender` filter. 
          But only if it's not already there
        */
        const genderFilter = current.find((f) => f?.field === "gender");

        if (!genderFilter && gender) {
            current = [
                ...current,
                {
                    field: "gender",
                    value: this.capitalizeFirstLetter(gender),
                    type: "exact",
                },
            ];
        }

        return current;
    };

    upperBound = (n, bound) => {
        return n > bound ? bound : n;
    };

    buildQuery = (widgetType = "", query = {}, localParams = {}) => {
        const { userID = null, product_id= "" } = localParams;
        const { mad_uuid } = query;
        const filters = this.buildFilters(query, localParams);

        return {
            ...DEFAULT_QUERY,
            ...query,
            user_id: userID,
            mad_uuid,
            filters,
            widget_type: widgetType,
            num_results: this.upperBound(
                query.num_results ?? DEFAULT_QUERY.num_results,
                MAX_NUM_RESULTS
            ),
            ...(product_id ? { product_id: product_id } : {}),
        };

        // {
        //   "num_results": 10,
        //   "product_id": "", # only for "widget_type": "visually_similar"
        //   "widget_type": "",
        //   "user_id": "",
        //   "fields": [""],
        //   "filters": [{
        //       "field": "",
        //       "value": "",
        //       "type": ""
        //   }]
        // }
    };
}

export default new VueQuery();
