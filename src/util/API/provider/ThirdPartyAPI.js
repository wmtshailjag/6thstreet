import { doFetch } from "../helper/Fetch";
import { merge } from "../helper/Object";

class ThirdPartyAPI {
  makeRequest(type, pathname, body, userOptions = {}) {
    const defaults = {
      method: type,
      headers: {
        "Content-Type": "application/json",
      },
    };

    const options = merge(defaults, userOptions);

    if (body) {
      // Handle POST requests
      options.body = JSON.stringify(body);
    }
    const url = `${pathname}`;
    return doFetch(url, options);
  }

  get(url) {
    return this.makeRequest("get", url);
  }

  delete(url, body) {
    return this.makeRequest("delete", url, body);
  }

  post(url, body, options) {
    return this.makeRequest("post", url, body, options);
  }
}

export default new ThirdPartyAPI();
