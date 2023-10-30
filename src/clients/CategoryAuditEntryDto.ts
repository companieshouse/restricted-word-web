/* eslint-disable camelcase */
interface CategoryAuditEntryDto {
    changed_by: string;
    changed_at: string;
    changed_reason: string;
    categories: string[];
}

export default CategoryAuditEntryDto;
