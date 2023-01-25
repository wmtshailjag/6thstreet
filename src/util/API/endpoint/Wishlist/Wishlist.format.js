export const formatProduct = (product) => {
  const {
    name,
    brand_name,
    sku,
    thumbnail,
    price,
    special_price,
    request_path,
    currency_code,
    url_key,
    entity_id,
  } = product;

  const productUrl = request_path
    ? `${window.location.origin}/${request_path}`
    : `${window.location.origin}/catalog/product/view/id/${entity_id}/s/${url_key}/`;

  return {
    sku,
    name,
    brand_name,
    url: productUrl,
    thumbnail_url: thumbnail,
    price: [
      {
        [currency_code]: {
          "6s_base_price": parseFloat(special_price),
          "6s_special_price": parseFloat(price),
        },
      },
    ],
  };
};

export const formatItemProduct = (item) => ({
  ...item,
  product: formatProduct(item.product),
});

export const formatItems = (items = []) => items.map(formatItemProduct);
