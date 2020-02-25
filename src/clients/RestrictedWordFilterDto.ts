/* eslint-disable camelcase */
interface RestrictedWordFilterDto {
    starts_with?: string;
    contains?: string;
    deleted?: boolean;
}

export = RestrictedWordFilterDto;
