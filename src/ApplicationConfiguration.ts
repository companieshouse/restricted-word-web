interface ApplicationConfiguration {
    port: number;
    apiAddress: string;
    internalApiKey: string;
    env: string;
    urlPrefix: string;
    proxy?: {
        host: string;
        port: number;
    };
}

export = ApplicationConfiguration;
