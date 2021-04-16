/* eslint-disable camelcase */
interface RestrictedWordDto {
    id: string;
    full_word: string;
    created_by: string;
    deleted_by: string;
    created_at: string;
    deleted_at: string;
    deleted: boolean;
    super_restricted: boolean;
}

export default RestrictedWordDto;
