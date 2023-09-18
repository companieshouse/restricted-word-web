import ApplicationConfiguration from "./ApplicationConfiguration";

const config: ApplicationConfiguration = {
    port: parseInt(process.env.RESTRICTED_WORD_WEB_PORT as string),
    apiAddress: process.env.INTERNAL_API_URL as string,
    internalApiKey: process.env.CHS_INTERNAL_API_KEY as string,
    env: (process.env.NODE_ENV || "development").toLowerCase(),
    urlPrefix: "admin/restricted-word",
    session: {
        cookieName: process.env.COOKIE_NAME as string,
        cookieSecret: process.env.COOKIE_SECRET as string,
        cookieDomain: process.env.COOKIE_DOMAIN as string,
        cacheServer: process.env.CACHE_SERVER as string
    },
    applicationNamespace: "restricted-word-web",
    baseUrl: process.env.CHS_URL ?? "http://chs.local"
};

const httpsProxy = process.env.HTTPS_PROXY;

if (httpsProxy) {

    const proxyUrl = new URL(httpsProxy);

    config.proxy = {
        host: proxyUrl.hostname,
        port: parseInt(proxyUrl.port)
    };
}

export default config;
