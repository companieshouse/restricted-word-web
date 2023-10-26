import AuditEntryViewModel from "./AuditEntryViewModel";
import CategoryAuditEntryViewModel from "./CategoryAuditEntryViewModel";

interface RestrictedWordViewModel {
    id: string;
    word: string;
    categories: string[],
    createdBy: string;
    deletedBy?: string;
    deletedReason?: string;
    createdAt: string;
    superRestricted: boolean;
    deletedAt?: string;
    deleted: boolean;
    superRestrictedAuditLog: AuditEntryViewModel[];
    categoriesAuditLog: CategoryAuditEntryViewModel[]
}

export default RestrictedWordViewModel;
