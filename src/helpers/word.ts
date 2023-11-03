const mapIdToCategory: any = {
    restricted: ["Restricted", "Restricted", "govuk-tag govuk-tag--red"],
    "criminal-fraudulent-purposes": ["Names for criminal / fraudulent purposes", "Crimes/Fraud", "govuk-tag govuk-tag--blue"],
    "international-orgs-foreign-gov-depts": ["International organisations and foreign government departments", "Int'l orgs/govts", "govuk-tag govuk-tag--green"],
    "prev-subjected-to-direction-to-change": ["Names previously subjected to a direction to change them", "Dir. to change", "govuk-tag govuk-tag--yellow"]
};

function getCategoriesListHtml(categories: string[]): string {
    let categoriesListHtml: string = "";
    if (categories.length > 0) {
        for (const category of categories) {
            const categoryDetails: string[] = mapIdToCategory[category];
            categoriesListHtml += `
                <div class="tooltip">
                    <strong class="${categoryDetails[2]}">
                        ${categoryDetails[1]}
                    </strong>
                    <span class="tooltip-text">${categoryDetails[0]}</span>
                </div>
                <br>
            `;
        }
    }
    return categoriesListHtml;
}

function getCategoriesList(categories: string | string[] | undefined) {
    return typeof categories === "string" ? [categories] : categories ?? [];
}

export { getCategoriesListHtml, getCategoriesList };
