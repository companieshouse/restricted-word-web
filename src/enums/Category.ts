export enum Category {
    RESTRICTED = "restricted",
    INTERNATIONAL_ORGS_FOREIGN_GOV_DEPTS = "international-orgs-foreign-gov-depts",
    CRIMINAL_FRAUDULENT_PURPOSES = "criminal-fraudulent-purposes",
    PREV_SUBJECTED_TO_DIRECTION_CHANGE = "prev-subjected-to-direction-to-change"
};

export function getCategoryName(categoryId: string): string {
    switch (categoryId) {
        case Category.RESTRICTED: {
            return 'Restricted';
        }
        case Category.INTERNATIONAL_ORGS_FOREIGN_GOV_DEPTS: {
            return 'International organisations and foreign government departments';
        }
        case Category.CRIMINAL_FRAUDULENT_PURPOSES: {
            return 'Names for criminal / fraudulent purposes';
        }
        case Category.PREV_SUBJECTED_TO_DIRECTION_CHANGE: {
            return 'Names previously subjected to a direction to change them';
        }
    }
    return '';
};