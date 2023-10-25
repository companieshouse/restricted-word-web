import AuditEntryViewModel from "./AuditEntryViewModel";

interface RestrictedWordViewModel {
    id: string;
    word: string;
    categories: string[],
    createdBy: string;
    createdReason?: string;
    deletedBy?: string;
    deletedReason?: string;
    createdAt: string;
    superRestricted: boolean;
    deletedAt?: string;
    deleted: boolean;
    superRestrictedAuditLog: AuditEntryViewModel[]
}

export default RestrictedWordViewModel;
