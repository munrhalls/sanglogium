import { productType } from "../features/products/schema/productType";
import { catalogueItemType } from "../features/catalogue/schema/catalogueItemType";
import { heroType } from "../features/homepage/schema/heroType";
import { homepageDataType } from "../features/homepage/schema/homepageDataType";
import { brandType } from "../features/products/schema/brandType";
import { orderType } from "../features/checkout/schema/orderType";
import { userType } from "../features/auth/schema/userType";

export const schema = {
  types: [heroType, catalogueItemType, productType, homepageDataType, brandType, orderType, userType],
};
