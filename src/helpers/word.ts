const mapIdToCategory: Record<string, string[]> = {
    restricted: ["Restricted", "Restricted", "govuk-tag govuk-tag--red"],
    "criminal-fraudulent-purposes": ["Names for criminal / fraudulent purposes", "Crimes/Fraud", "govuk-tag govuk-tag--blue"],
    "international-orgs-foreign-gov-depts": ["International organisations and foreign government departments", "Int'l orgs/govts", "govuk-tag govuk-tag--green"],
    "prev-subjected-to-direction-to-change": ["Names previously subjected to a direction to change them", "Dir. to change", "govuk-tag govuk-tag--yellow"]
};

const htmlEscapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
};

function getCategoriesListHtml(categories: string[], mappedCategoryOverride?: Record<string, string[]>): string {
    // Protects against accidental inclusion of HTML tags by escaping
    const escapeHtml = (str: string): string => str.replace(/[&<>"']/g, tag => htmlEscapeMap[tag] ?? tag);

    let categoriesListHtml: string = "";
    if (categories.length > 0) {
        for (const category of categories) {
            const categoryDetails: string[] = (mappedCategoryOverride ?? mapIdToCategory)[category];
            if (categoryDetails) {
                const [tooltipText, label, cssClass] = categoryDetails.map(escapeHtml);
                categoriesListHtml += `
                <div class="tooltip">
                    <strong class="${cssClass}">
                        ${label}
                    </strong>
                    <span class="tooltip-text">${tooltipText}</span>
                </div>
                <br>
            `;
            }
        }
    }
    return categoriesListHtml;
}

function getCategoriesList(categories: string | string[] | undefined) {
    return typeof categories === "string" ? [categories] : categories ?? [];
}

export { getCategoriesListHtml, getCategoriesList };
