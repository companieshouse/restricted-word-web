interface ApplicationConfiguration {
    port: number;
    apiAddress: string;
    internalApiKey: string;
    env: string;
    proxy?: {
        host: string;
        port: number;
    };
}

// eslint-disable-next-line no-undef
export = ApplicationConfiguration;
