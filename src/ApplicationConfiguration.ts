interface ApplicationConfiguration {
    port: number;
    apiAddress: string;
    internalApiKey: string;
    env: string;
    urlPrefix: string;
    session: {
        cookieName: string;
        cookieSecret: string;
        cacheServer: string;
    };
    applicationNamespace: string;
    proxy?: {
        host: string;
        port: number;
    };
}

export = ApplicationConfiguration;
