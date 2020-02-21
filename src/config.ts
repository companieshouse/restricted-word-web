import ApplicationConfiguration from "./ApplicationConfiguration";

const config: ApplicationConfiguration = {
    port: parseInt(process.env.RESTRICTED_WORD_WEB_PORT as string),
    apiAddress: process.env.INTERNAL_API_URL as string,
    internalApiKey: process.env.CHS_INTERNAL_API_KEY as string,
    env: (process.env.NODE_ENV || "development").toLowerCase(),
    urlPrefix: "restricted-word"
};

const httpsProxy = process.env.HTTPS_PROXY;

if (httpsProxy) {

    const proxyUrl = new URL(httpsProxy);

    config.proxy = {
        host: proxyUrl.hostname,
        port: parseInt(proxyUrl.port)
    };
}

console.dir(config);

export = config;
