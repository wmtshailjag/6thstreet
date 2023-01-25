import MobileAPI from "../../provider/MobileAPI";

export const validateShippingAddress = ({ address }) =>
  MobileAPI.post("/validate-address", address) || {};

export const addShippingAddress = ({ address }) =>
  MobileAPI.post("/addresses", address) || {};

export const updateShippingAddress = ({ address_id, address }) =>
  MobileAPI.put(`/addresses/${address_id}`, address) || {};

export const removeShippingAddress = ({ address_id }) =>
  MobileAPI.delete(`/addresses/${address_id}`) || {};

export const getShippingAddresses = () => MobileAPI.get("/addresses") || {};

export const getBinPromotion = ({ bin, cartId }) =>
  MobileAPI.post(`/bin-promotion`, {
    bin_number: bin,
    cart_id: cartId,
  }) || {};

export const removeBinPromotion = ({ cartId }) =>
  MobileAPI.post(`/bin-promotion/remove`, { cart_id: cartId }) || {};

export const estimateShippingMethods = ({ cartId, address }) =>
  MobileAPI.post(`/carts2/${cartId}/estimate-shipping-methods`, {
    address,
  }) || {};

export const saveShippingInformation = ({ cartId, data }) =>
  MobileAPI.post(`/carts2/${cartId}/shipping-information`, data) || {};

export const selectPaymentMethod = ({ cartId, data }) =>
  MobileAPI.put(`/carts2/${cartId}/selected-payment-method`, data) || {};

export const createOrder = ({ data }) =>
  MobileAPI.post("/create-order2", data) || {};
export const cancelOrder = ({ data }) =>
  MobileAPI.post("/cancel-order", data) || {};

export const getPaymentMethods = () => MobileAPI.get("/payment-methods") || {};

export const getLastOrder = () => MobileAPI.get("/order/last") || {};

export const getPaymentAuthorization = ({ paymentId }) =>
  MobileAPI.get(`/checkout/payments/${paymentId}`) || {};

export const getPaymentAuthorizationQPay = ({ paymentId }) =>
  MobileAPI.get(`/checkout/payments/${paymentId}?pmethod=checkout_qpay`) || {};

export const getPaymentAuthorizationKNET = ({ paymentId }) => 
MobileAPI.get(`/checkout/payments/${paymentId}?pmethod=checkout_knet`) || {};

export const capturePayment = ({ paymentId, orderId }) =>
  MobileAPI.post(`/checkout/payments/${paymentId}/captures`, {
    order_id: orderId,
  }) || {};

export const sendVerificationCode = ({ data }) =>
  MobileAPI.post("/otp/send", data) || {};

export const getCardType = (bin) =>
  MobileAPI.post("/checkout/card-type", bin) || {};

export const verifyUserPhone = ({ data }) =>
  MobileAPI.put("/otp/verify", data) || {};
