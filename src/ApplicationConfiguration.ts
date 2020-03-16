interface ApplicationConfiguration {
    port: number;
    apiAddress: string;
    internalApiKey: string;
    env: string;
    urlPrefix: string;
    applicationNamespace: string;
    proxy?: {
        host: string;
        port: number;
    };
}

export default ApplicationConfiguration;
