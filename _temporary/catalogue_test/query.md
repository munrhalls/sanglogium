*[_type == "product" && count(catalogueLocationKeys[@ in ["k3_InLGWRyJsBJfwNrnyB"]]) > 0] {
  _id,
  name,
  slug,
  brand,
  displayPrice,
  catalogueLocationKeys
} | order(name asc)