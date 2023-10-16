import AuditEntryDto from "./AuditEntryDto";

/* eslint-disable camelcase */
interface RestrictedWordDto {
    id: string;
    full_word: string;
    created_by: string;
    created_reason: string;
    deleted_by: string;
    deleted_reason: string;
    created_at: string;
    super_restricted: boolean;
    deleted_at: string;
    deleted: boolean;
    super_restricted_audit_log: AuditEntryDto[];
}

export default RestrictedWordDto;
