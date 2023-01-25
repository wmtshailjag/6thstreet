import { formatDate } from "Util/Date";
const fetch = require("node-fetch");

export default async function getTopSearches(options = {}) {
  const { index } = options;
  const indexName = index.indexName;
  const apiKey = index.as.apiKey;
  const applicationID = index.as.applicationID;
  try {
    var endDateObj = new Date();
    var startDateObj = new Date();
    startDateObj.setDate(endDateObj.getDate() - 7);
    var formattedStartDate = formatDate("YYYY-MM-DD", startDateObj);
    var formattedEndDate = formatDate("YYYY-MM-DD", endDateObj);
    return new Promise((resolve, reject) => {
      fetch(
        `https://analytics.algolia.com/2/searches?index=${indexName}&limit=5&tags=PWA_Search&startDate=${formattedStartDate}&endDate=${formattedEndDate}`,
        {
          headers: {
            "X-Algolia-API-Key": apiKey,
            "X-Algolia-Application-Id": applicationID,
          },
        }
      )
        .then((response) => {
          if (!response.ok) {
            // console.log("response", response.ok);
            // throw Error(response.statusText);
          }

          return response.json();
        })
        .then((result) => {
          const data = result.searches;
          if (!data) {
            resolve({ data: [] });
          }
          resolve({ data: data });
        })
        .catch((error) => reject(error));
    });
  } catch (e) {
    console.error(e?.response);
  }
}
