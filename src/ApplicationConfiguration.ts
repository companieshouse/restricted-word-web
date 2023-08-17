interface ApplicationConfiguration {
    port: number;
    apiAddress: string;
    internalApiKey: string;
    env: string;
    urlPrefix: string;
    session: {
        cookieName: string;
        cookieSecret: string;
        cookieDomain: string;
        cacheServer: string;
    };
    applicationNamespace: string;
    proxy?: {
        host: string;
        port: number;
    };
    baseUrl: string;
}

export default ApplicationConfiguration;
