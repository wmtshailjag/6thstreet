module.exports = {
    PORT: 5003,
    MEMORY_CACHE_MAX_SIZE: 50000000,
    DISK_CACHE_DIRECTORY: '6thstreet',
    CHROME_TIMEOUT: 60000,
    APP_HOSTNAME: '-stage.6tst.com',
    APP_PORT: 3000,
    APP_URL_BLACKLIST: [
        'www.google-analytics.com',
        '/gtag/js',
        'ga.js',
        'gtm.js',
        'analytics.js',
        'fonts.googleapis.com',
        'fonts.gstatic.com',
        'apparel.oriserve.com',
        'sentry.io',
        /\.(ttf|tiff|woff|woff2|jpeg|png|webp)$/i
    ],
};