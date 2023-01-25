import BrowserDatabase from "Util/BrowserDatabase";
import { ONE_MONTH_IN_SECONDS } from "Util/Request/QueryDispatcher";

export const AUTH_TOKEN = "auth_token";

export const MOBILE_AUTH_TOKEN = "mobile_auth_token";

export const UUID_TOKEN = "uuid_token";

export const UUID = 'uuid';

export const ONE_HOUR = 3600;

export const setAuthorizationToken = (token) =>
  BrowserDatabase.setItem(token, AUTH_TOKEN, ONE_MONTH_IN_SECONDS);

export const deleteAuthorizationToken = () =>
  BrowserDatabase.deleteItem(AUTH_TOKEN);

export const getAuthorizationToken = () => BrowserDatabase.getItem(AUTH_TOKEN);

export const setMobileAuthorizationToken = (token) =>
  BrowserDatabase.setItem(token, MOBILE_AUTH_TOKEN, ONE_MONTH_IN_SECONDS);

export const deleteMobileAuthorizationToken = () =>
  BrowserDatabase.deleteItem(MOBILE_AUTH_TOKEN);

export const getMobileAuthorizationToken = () => BrowserDatabase.getItem(MOBILE_AUTH_TOKEN);

export const setUUIDToken = (token) => BrowserDatabase.setItem(token, UUID_TOKEN);

export const isSignedIn = () => !!getAuthorizationToken() && !!getMobileAuthorizationToken();

export const getUUIDToken = () => BrowserDatabase.getItem(UUID_TOKEN);

export const setUUID = (token) => BrowserDatabase.setItem(token, UUID);

export const getUUID = () => BrowserDatabase.getItem(UUID);
