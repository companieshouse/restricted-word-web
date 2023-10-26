import AuditEntryDto from "./AuditEntryDto";
import CategoryAuditEntryDto from "./CategoryAuditEntryDto";

/* eslint-disable camelcase */
interface RestrictedWordDto {
    id: string;
    full_word: string;
    categories: string[],
    created_by: string;
    deleted_by: string;
    deleted_reason: string;
    created_at: string;
    super_restricted: boolean;
    deleted_at: string;
    deleted: boolean;
    super_restricted_audit_log: AuditEntryDto[];
    categories_audit_log: CategoryAuditEntryDto[];
}

export default RestrictedWordDto;
