import MobileAPI from "../../provider/MobileAPI";

export const fetchVueData = (payload) =>
    MobileAPI.post("/vue/data", payload) || {};
