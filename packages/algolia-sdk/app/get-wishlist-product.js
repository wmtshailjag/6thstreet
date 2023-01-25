const field = [
  "news_from_date",
  "promotion",
  "sku",
  "also_available_color",
  "thumbnail_url",
  "brand_name",
  "name",
  "price",
  "url",
  "objectID",
  "currency_code",
];
export default function getWishlistProduct(idsArray, options = {}) {
  const { index } = options;

  return new Promise((resolve, reject) => {
    index.getObjects(idsArray, (error, data) => {

      if (error) {
        return reject(error);
      }
      return resolve({ data: data });
    });
  });
}

function formatResult(data) {
  let finalData = [];
  data.results = data.results.filter(item=>!!item).map((subData) => {
    let newSubData = {};
    Object.keys(subData).map((key) => {
      if (field.includes(key)) {
        newSubData[key] = subData[key];
      }
    });
    finalData.push(newSubData);
  });
  finalData.map((data, index) => {
    let key = Object.keys(finalData[index].price[0])[0];
    return (
      (data["currency_code"] = key),
      (data["special_price"] = Object.values(finalData[index].price[0])[0][
        "6s_base_price"
      ]),
      (data["price"] = Object.values(modifyData(finalData, index, "price"))[0][
        "6s_special_price"
      ]),
      delete data[key],
      (data["thumbnail"] = modifyData(finalData, index, "thumbnail_url")),
      (data["entity_id"] = modifyData(finalData, index, "objectID")),
      (data["url_key"] = modifyData(finalData, index, "url").split(".com/")[1]),
      (data["request_path"] = modifyData(finalData, index, "url").split(
        ".com/"
      )[1])
    );
  });
  return finalData;
}

function modifyData(finalData, index, key) {
  if (key === "price") {
    return finalData[index].price[0];
  } else {
    return finalData[index][key];
  }
}
