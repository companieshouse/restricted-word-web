/* eslint-disable camelcase */
interface RestrictedWordFilterDto {
    starts_with?: string;
    contains?: string;
    deleted?: boolean;
    super_restricted?: boolean;
    categories?: string;
}

export default RestrictedWordFilterDto;
