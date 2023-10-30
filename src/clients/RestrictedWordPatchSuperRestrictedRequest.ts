interface RestrictedWordPatchSuperRestrictedRequest {
    id: string;
    patchedBy: string;
    superRestricted?: boolean;
    categories?: string[]
    categoryChangeReason?: string
}

export default RestrictedWordPatchSuperRestrictedRequest;
