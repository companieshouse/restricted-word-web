interface RestrictedWordQueryOptions {
    startsWith?: string;
    contains?: string;
    deleted?: boolean;
    superRestricted?: boolean;
    categories?: string[];
}

export default RestrictedWordQueryOptions;
