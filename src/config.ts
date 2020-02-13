import ApplicationConfiguration from "./ApplicationConfiguration";

const config: ApplicationConfiguration = {
    port: parseInt(process.env.RESTRICTED_WORD_ADMIN_WEB_PORT as string),
    apiAddress: process.env.RESTRICTED_WORD_ADMIN_WEB_API_URL as string,
    internalApiKey: process.env.INTERNAL_API_KEY as string,
    env: (process.env.NODE_ENV || "development").toLowerCase()
};

const httpsProxy = process.env.HTTPS_PROXY;

if (httpsProxy) {

    const proxyUrl = new URL(httpsProxy);

    config.proxy = {
        host: proxyUrl.hostname,
        port: parseInt(proxyUrl.port)
    };
}

export = config;
