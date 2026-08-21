// import { blockContentType } from "./blockContentType";
import { productType } from "./productType";
import { catalogueItemType } from "./catalogueItemType";
import { heroType } from "./heroType";
import { homepageDataType } from "./homepageDataType";
import { brandType } from "./brandType";
import { orderType } from "./orderType";
import { userType } from "./userType";

export const schema = {
  types: [heroType, catalogueItemType, productType, homepageDataType, brandType, orderType, userType],
};