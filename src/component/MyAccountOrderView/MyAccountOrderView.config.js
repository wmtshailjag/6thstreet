export const STATUS_PROCESSING = "processing";

export const STATUS_DISPATCHED = "courier_dispatched";

export const STATUS_IN_TRANSIT = "courier_in_transit";

export const DELIVERY_FAILED = "delivery_failed";

export const DELIVERY_SUCCESSFUL = "delivery_successful";

export const STATUS_CANCELLED = "cancelled";

export const PICKUP_FAILED = 'pickupfailed'

export const PICKEDUP = 'pickedup'

export const READY_TO_PICK = 'readytopick'

export const CANCEL_ITEM_LABEL = __("Cancel an Item");

export const CANCEL_ORDER_LABEL = __("Cancel order");

export const RETURN_ITEM_LABEL = __("Return an Item");

export const RETURN__EXCHANGE_ITEM_LABEL = __("Return/Exchange Item");

export const EXCHANGE_ITEM_LABEL = __("Exchange an Item");

export const STATUS_LABEL_MAP = {
  [STATUS_PROCESSING]: __("Processing"),
  [STATUS_DISPATCHED]: __("Shipped"),
  [STATUS_IN_TRANSIT]: __("In Transit"),
  [DELIVERY_FAILED]: __("Delivery Failed"),
  [DELIVERY_SUCCESSFUL]: __("Delivered"),
  [STATUS_CANCELLED]: __("Cancelled"),
};

export const NEW_STATUS_LABEL_MAP = {
  [STATUS_DISPATCHED]: __("Shipped"),
  [STATUS_IN_TRANSIT]: __("In Transit"),
  [DELIVERY_SUCCESSFUL]: __("Delivered"),
};

export const NEW_EXCHANGE_STATUS_LABEL_MAP = {
  [STATUS_DISPATCHED]: __("Exchange Shipped"),
  [STATUS_IN_TRANSIT]: __("Exchange In Transit"),
  [DELIVERY_SUCCESSFUL]: __("Exchange Delivered"),
};
