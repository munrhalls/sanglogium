// import { blockContentType } from "./blockContentType";
import { productType } from "./productType";
import { catalogueItemType } from "./catalogueItemType";
import { catalogueType } from "./catalogueType";
import { heroType } from "./heroType";
import { homepageType } from "./homepageType";

export const schema = {
  types: [heroType, catalogueItemType, catalogueType, productType, homepageType],
};
