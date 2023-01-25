/**
 * ScandiPWA - Progressive Web App for Magento
 *
 * Copyright © Scandiweb, Inc. All rights reserved.
 * See LICENSE for license details.
 *
 * @license OSL-3.0 (Open Software License ("OSL") v. 3.0)
 * @package scandipwa/base-theme
 * @link https://github.com/scandipwa/base-theme
 */

/* eslint-disable simple-import-sort/sort */
/* eslint-disable func-names */
/* eslint-disable no-console */
import "SourceUtil/Polyfill";
import "Style/main";
// import * as Sentry from "@sentry/browser";
import { BrowserTracing } from "@sentry/tracing";
import { Workbox } from "workbox-window";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import { render } from "react-dom";
import { createBrowserHistory } from "history";
import * as Sentry from "@sentry/react";

import App from "Component/App";

const history = createBrowserHistory();

window.__DEV__ = process.env.NODE_ENV === "development";

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_ENDPOINT,
  integrations: [
    new BrowserTracing({
      tracingOrigins: ["localhost", "6thstreet.com", /^\//],
      // Can also use reactRouterV3Instrumentation or reactRouterV4Instrumentation
      routingInstrumentation: Sentry.reactRouterV5Instrumentation(history),
    }),
  ],

  //send only 20% of transactions
  tracesSampleRate: 0.2,
});
// let's register service-worker
// but not in development mode, the cache can destroy the DX
if (process.env.NODE_ENV !== "development" && "serviceWorker" in navigator) {
  window.addEventListener("beforeinstallprompt", (ev) => {
    ev.preventDefault();
  });

  window.addEventListener("load", () => {
    const BaseUrl = new URL(window.location.href).origin;
    const swUrl = BaseUrl + "/serviceworker.js";
    window.wb = new Workbox(swUrl);
    const newVersionPopupEvent = new Event("showNewVersionPopup");

    const showSkipWaitingPrompt = (event) => {
      window.dispatchEvent(newVersionPopupEvent);
    };
    window.wb.addEventListener("waiting", showSkipWaitingPrompt);
    window.wb.register();

    // navigator.serviceWorker.register(swUrl).then((reg) => {
    //   const newVersionPopupEvent = new Event("showNewVersionPopup");

    //   // eslint-disable-next-line no-param-reassign
    //   reg.onupdatefound = function () {
    //     const installingWorker = reg.installing;

    //     installingWorker.onstatechange = function () {
    //       if (installingWorker.state === "redundant") {
    //         console.error(
    //           "***",
    //           "The installing service worker became redundant."
    //         );
    //         window.dispatchEvent(newVersionPopupEvent);
    //       }
    //     };
    //   };
    // })
  });
}
render(<App />, document.getElementById("root"));