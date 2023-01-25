const proxy = require('http-proxy-middleware');

// Proxy to locale-prefixed M2 instance
const magentoGraphQLLocaleRouter = (request) => {
    const { originalUrl } = request;
    const locale = /\/graphql\/([a-z]{2}-[a-z]{2})/.exec(originalUrl)[1];
    if (process.env.REACT_APP_MAGENTO_HOST === '6thstreet.com') {
        return `https://${ locale }.${ process.env.REACT_APP_MAGENTO_HOST }/`;
    }

    return `https://${ locale }-${ process.env.REACT_APP_MAGENTO_HOST }/`;
};

// Redirect from /graphql/en-us to a /graphql
const magentoGraphQLPathRewrite = (path) => (
    path.replace(/\/graphql\/[a-z]{2}-[a-z]{2}/, '/graphql')
);

// Proxy to locale-prefixed M2 instance
const magentoRestLocaleRouter = (request) => {
    const { originalUrl } = request;
    const locale = /\/rest\/([a-z]{2}-[a-z]{2})/.exec(originalUrl)[1];
    if (process.env.REACT_APP_MAGENTO_HOST === '6thstreet.com') {
        return `https://${ locale }.${ process.env.REACT_APP_MAGENTO_HOST }/`;
    }

    return `https://${ locale }-${ process.env.REACT_APP_MAGENTO_HOST }/`;
};

// Redirect from /rest/en-us to a /rest
const magentoRestPathRewrite = (path) => (
    path.replace(/\/rest\/[a-z]{2}-[a-z]{2}/, '/rest/V1')
);

const robotsRouter = () => {
    const { REACT_APP_CDN_API_URL, REACT_APP_REMOTE_CONFIG_DIR } = process.env;
    return `${REACT_APP_CDN_API_URL}${REACT_APP_REMOTE_CONFIG_DIR}/seo`;
}

const sitemapLocaleRouter = (request) => {
    const { hostname } = request;
    const { REACT_APP_CDN_API_URL, REACT_APP_REMOTE_CONFIG_DIR } = process.env;
    const regex = new RegExp(/[a-z]{2}-[a-z]{2}/, 'g');
    const match = regex.exec(hostname);
    const locale = match ? match['0'] : "";
    return `${REACT_APP_CDN_API_URL}${REACT_APP_REMOTE_CONFIG_DIR}/seo/${locale}`;
}

module.exports = (app) => {

    app.use(
        '/robots.txt',
        proxy({
            target: `https://${ process.env.REACT_APP_CDN_API_URL }/`,
            router: robotsRouter,
            changeOrigin: true,
        })
    );

    app.use(
        '/sitemap.xml',
        proxy({
            target: `https://${ process.env.REACT_APP_CDN_API_URL }/`,
            router: sitemapLocaleRouter,
            changeOrigin: true,
        })
    );

    // Proxy CDN (bypass CORS)
    app.use(
        '/cdn',
        proxy({
            target: process.env.REACT_APP_CDN_API_URL,
            changeOrigin: true,
            pathRewrite: {
                '/cdn/': '/'
            }
        })
    );

    // Proxy Mobile API (bypass CORS)
    app.use(
        '/api',
        proxy({
            target: process.env.REACT_APP_MOBILEAPI_URL,
            changeOrigin: true,
            pathRewrite: {
                '/api/': '/'
            }
        })
    );

    // Proxy Magento 2 (bypass CORS)
    app.use(
        '/graphql',
        proxy({
            target: `https://${ process.env.REACT_APP_MAGENTO_HOST }/`,
            router: magentoGraphQLLocaleRouter,
            pathRewrite: magentoGraphQLPathRewrite,
            changeOrigin: true,
            logLevel: 'debug'
        })
    );

    // Proxy Magento 2 (bypass CORS)
    app.use(
        '/rest',
        proxy({
            target: `https://${ process.env.REACT_APP_MAGENTO_HOST }/`,
            router: magentoRestLocaleRouter,
            pathRewrite: magentoRestPathRewrite,
            changeOrigin: true
        })
    );

    // Proxy Checkout API (bypass CORS)
    app.use(
        '/api2/v2',
        proxy({
            target: process.env.REACT_APP_CHECKOUT_COM_API_URL,
            changeOrigin: true,
            pathRewrite: {
                '/api2/v2/': '/'
            }
        })
    );

    // Proxy Checkout API (bypass CORS)
    app.use(
        '/applepay',
        proxy({
            target: process.env.REACT_APP_CHECKOUT_COM_APPLE_PAY_API_URL,
            changeOrigin: true,
            pathRewrite: {
                '/applepay/': '/'
            }
        })
    );
};
