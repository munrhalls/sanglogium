import { productType } from "../features/products/schema/productType";
import { catalogueItemType } from "../features/catalogue/schema/catalogueItemType";
import { heroType } from "../features/homepage/schema/heroType";
import { homepageDataType } from "../features/homepage/schema/homepageDataType";
import { brandType } from "../features/products/schema/brandType";
import { orderType } from "../features/order/schema/orderType";
import { userType } from "../features/profile/schema/userType";
import { makeFilterPicklistType } from "../features/product-filtering/schema/filterPicklistType";
import { makeFilterLabelsType } from "../features/product-filtering/schema/filterLabelsType";
import { filterFieldPaths } from "../features/product-filtering/schema/filterFieldPaths";
import { filterAttributeGroups } from "../features/products/schema/productFilterAttributes";

const pickable = {
  headphones: filterFieldPaths(filterAttributeGroups.headphones),
  audioElectronics: filterFieldPaths(filterAttributeGroups.audioElectronics),
  accessories: filterFieldPaths(filterAttributeGroups.accessories),
};

export const schema = {
  types: [
    heroType,
    catalogueItemType,
    productType,
    homepageDataType,
    brandType,
    orderType,
    userType,
    makeFilterPicklistType(pickable),
    makeFilterLabelsType([...new Set([...pickable.headphones, ...pickable.audioElectronics, ...pickable.accessories])]),
  ],
};
