interface RestrictedWordViewModel {
    id: string;
    word: string;
    createdBy: string;
    deletedBy?: string;
    createdAt: string;
    superRestricted: boolean;
    deletedAt?: string;
    deleted: boolean;
    superRestricted: boolean;
}

export default RestrictedWordViewModel;
