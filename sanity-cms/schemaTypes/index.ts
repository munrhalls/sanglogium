// import { blockContentType } from "./blockContentType";
import { productType } from "./productType";
import { catalogueItemType } from "./catalogueItemType";
import { heroType } from "./heroType";
import { homepageDataType } from "./homepageDataType";
import { categoryFiltersType } from "./categoryFiltersType";
import { categorySortablesType } from "./categorySortablesType";
import { brandType } from "./brandType";
import { orderType } from "./orderType";
import { userType } from "./userType";

export const schema = {
  types: [heroType, catalogueItemType, productType, homepageDataType, categoryFiltersType, categorySortablesType, brandType, orderType, userType],
};