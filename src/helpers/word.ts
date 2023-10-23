const mapIdToCategory = new Map<String, String>();
mapIdToCategory.set("restricted", "Restricted");
mapIdToCategory.set("criminal-fraudulent-purposes", "Names for criminal / fraudulent purposes");
mapIdToCategory.set("international-orgs-foreign-gov-depts", "International organisations and foreign government departments");
mapIdToCategory.set("prev-subjected-to-direction-to-change", "Names previously subjected to a direction to change them");

function getCategoriesListHtml (categories: String[]): String {
    let categoriesListHtml: String = ""
    if (categories.length > 0) {
        for (let i = 0 ; i < categories.length ; i++) {
            categoriesListHtml += mapIdToCategory.get(categories[i]) + "<br>"
        }
    }
    return categoriesListHtml
}


export { getCategoriesListHtml }