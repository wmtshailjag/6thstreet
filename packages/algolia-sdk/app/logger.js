const fetch = require("node-fetch");
export default function logAlgoliaAnalytics(
  event_type,
  event_name,
  objectIDs,
  queryID,
  userToken,
  position,
  options = {}
) {
  const { index } = options;
  const apiKey = index.as.apiKey;
  const indexName = index.indexName;
  const applicationID = index.as.applicationID;
  let payload;

  switch (event_type) {
    case "view":
      payload = {
        events: [
          {
            eventType: "view",
            eventName: event_name,
            index: indexName,
            userToken: userToken,
            objectIDs: objectIDs,
          },
        ],
      };
      break;
    case "conversion":
      payload = {
        events: [
          {
            eventType: "conversion",
            eventName: event_name,
            index: indexName,
            userToken: userToken,
            objectIDs: objectIDs,
            queryID: queryID,
          },
        ],
      };
      break;
    case "click":
      payload = {
        events: [
          {
            eventType: "click",
            eventName: event_name,
            index: indexName,
            userToken: userToken,
            objectIDs: objectIDs,
            queryID: queryID,
            positions: position,
          },
        ],
      };
      break;
  }
  return new Promise((resolve, reject) => {
    fetch(`https://insights.algolia.io/1/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Algolia-API-Key": apiKey,
        "X-Algolia-Application-Id": applicationID,
      },
      body: JSON.stringify(payload),
    })
      .then((response) => {
        if (response.status !== 200) {
          // throw Error(response.message);
          console.log("Error", response.message);
        }
        return response.json();
      })
      .catch((error) => console.log(error));
  });
}
