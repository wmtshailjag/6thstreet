export const STATUS_COMPLETE = "complete";

export const STATUS_CANCELED = "canceled";

export const STATUS_CLOSED = "closed";

export const STATUS_PROCESSING = "processing";

export const STATUS_PAYMENT_ABORTED = "payment_aborted";

export const STATUS_PAYMENT_SUCCESS = "payment_success";

export const STATUS_PAYMENT_FAILED = "payment_failed";

export const STATUS_EXCHANGE_PENDING = "exchange_pending";

export const STATUS_EXCHANGE_REJECTED = "exchange_rejected";

export const STATUS_HIDE_BAR = [
  STATUS_COMPLETE,
  STATUS_CANCELED,
  STATUS_PAYMENT_ABORTED,
  STATUS_CLOSED,
  STATUS_PAYMENT_FAILED,
  STATUS_EXCHANGE_REJECTED
];

export const STATUS_FAILED = [STATUS_CANCELED, STATUS_PAYMENT_ABORTED,STATUS_EXCHANGE_REJECTED];

export const STATUS_SUCCESS = [STATUS_COMPLETE, STATUS_PAYMENT_SUCCESS];

export const STATUS_BEING_PROCESSED = [
  STATUS_PROCESSING,
  STATUS_PAYMENT_SUCCESS,
];

export const STATUS_ABLE_TO_EXCHANGE = [
  STATUS_PROCESSING,
  STATUS_PAYMENT_SUCCESS,
  STATUS_COMPLETE,
];

export const ARABIC_STATUS_TRANSLATE = {
  complete: "مكتمل",
  canceled: "ملغى",
  processing: "معالجة",
  payment_aborted: "تم إلغاء الدفع",
  payment_success: "تم الدفع بنجاح",
  exchange_request_placed:"تم قبول طلب الإستبدال",
  exchange_delivered:"تم توصيل المنتج المراد استبداله",
  exchange_rejected:"صرف مرفوض",
  exchange_shipped:"تم شحن المنتج المراد استبداله",
  exchange_item_shipped:"تم شحن المنتج المراد استبداله",
  exchange_request_placed:"تم قبول طلب الإستبدال",
  exchange_pending:"عملية الإستبدال معلقة",
  exchange_initiated:"بدأت عملية الإستبدال",
  exchange_complete:"تمت عملية الإستبدال",
  item_exchanged:"تم استبدال المنتج",
  items_exchanged:"تم استبدال المنتجات",
  exchange_in_transit:"المنتج المستبدل قيد الإنتقال"
};

export const translateArabicStatus = (status) => {
  if (typeof ARABIC_STATUS_TRANSLATE[status] === "undefined") {
    return status.split("_").join(" ");
  }

  return ARABIC_STATUS_TRANSLATE[status];
};

export const ARABIC_MONTHS = [
  "يناير",
  "فبراير",
  "مارس",
  "إبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];
