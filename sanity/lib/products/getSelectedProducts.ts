import { client } from "../client";
import { FilterItem } from "@/app/components/ui/filters/FilterTypes";

export const getSelectedProducts = async (
  catalogueKeys: string[],
  selectedFilters: [FilterItem[], FilterItem[], FilterItem[], FilterItem[]],
  selectedSort: { field: string; direction: string } | null,
  selectedPagination = { page: 0, pageSize: 12 }
) => {
  const [regular, overview, specifications, rangeFilters] = selectedFilters;

  const filteredRegular = regular.filter(
    (item) => !(item.field === "size" && !isNaN(parseInt(String(item.value))))
  );

  const regularQuery =
    filteredRegular.length > 0
      ? filteredRegular
          .map((item) => {
            let values = [];
            if (typeof item.value === "string") {
              try {
                values = JSON.parse(item.value);
                values = Array.isArray(values) ? values : [values];
              } catch {
                values = [item.value];
              }
            } else if (Array.isArray(item.value)) {
              values = item.value;
            } else {
              values = [item.value];
            }

            return `(${values.map((value) => `${item.field} == "${value}"`).join(" || ")})`;
          })
          .filter((query) => query !== "")
          .join(" && ")
      : "";
  const overviewQuery =
    overview.length > 0
      ? overview
          .map((item) => {
            let values = [];
            if (typeof item.value === "string") {
              try {
                values = JSON.parse(item.value);
                values = Array.isArray(values) ? values : [values];
              } catch {
                values = [item.value];
              }
            } else if (Array.isArray(item.value)) {
              values = item.value;
            } else {
              values = [item.value];
            }

            return `(${values
              .map(
                (value) => `count(overviewFields[value match "${value}"]) > 0`
              )
              .join(" || ")})`;
          })
          .join(" && ")
      : "";

  const specificationsQuery =
    specifications.length > 0
      ? specifications
          .map((item) => {
            let values = [];
            if (typeof item.value === "string") {
              try {
                values = JSON.parse(item.value);
                values = Array.isArray(values) ? values : [values];
              } catch {
                values = [item.value];
              }
            } else if (Array.isArray(item.value)) {
              values = item.value;
            } else {
              values = [item.value];
            }

            return `(${values
              .map(
                (value) => `count(specifications[value match "${value}"]) > 0`
              )
              .join(" || ")})`;
          })
          .join(" && ")
      : "";

  const rangeQuery =
    rangeFilters && rangeFilters.length > 0
      ? rangeFilters
          .map((item) => {
            let query = "";
            query += `${item.field} ${item.operator} ${item.value}`;
            return query;
          })
          .filter((query) => query !== "")
          .join(" && ")
      : "";

  // Early return if no catalogue keys - prevents returning ALL products
  if (!catalogueKeys || catalogueKeys.length === 0) {
    return {
      products: [],
      totalProductsCount: 0,
    };
  }

  let assembledQuery = `*[_type == "product"`;

  const pathQuery = ` && count(catalogueLocationKeys[@ in $catalogueKeys]) > 0`;

  assembledQuery += pathQuery;

  const allFilters = [
    regularQuery,
    overviewQuery,
    specificationsQuery,
    rangeQuery,
  ]
    .filter((query) => query !== "")
    .join(" && ");

  if (allFilters) {
    assembledQuery += ` && (${allFilters})`;
  }

  const page = (selectedPagination?.page || 1) - 1;
  const pageSize = selectedPagination?.pageSize || 12;
  const start = page * pageSize;

  if (selectedSort && selectedSort.field && selectedSort.field !== "default") {
    if (selectedSort.field === "bassPerformance") {
      assembledQuery += `] {
        ...,
        "sortValue": coalesce(
          specifications[title match "Frequency Response" || title match "frequency response"][0].value,
          "100Hz"
        )
      } | order(sortValue ${selectedSort.direction})`;
    } else if (selectedSort.field === "detailClarity") {
      assembledQuery += `] {
        ...,
        "freqResponse": coalesce(
          specifications[title match "Frequency Response" || title match "frequency response"][0].value,
          ""
        ),
        "sortingOrder": count(specifications[title match "Frequency Response" && value match "*kHz*"])
      } | order(sortingOrder ${selectedSort.direction})`;
    } else if (selectedSort.field === "frequencyRange") {
      assembledQuery += `] {
        ...,
        "hasFreq": defined(specifications[title match "Frequency Response"][0]),
        "hasDash": specifications[title match "Frequency Response"][0].value match "*-*",
        "hasRange": hasFreq && hasDash,
        "sortingOrder": count(specifications[title match "Frequency Response" && value match "*-*"])
      } | order(sortingOrder ${selectedSort.direction})`;
    } else if (selectedSort.field === "sensitivity") {
      assembledQuery += `] {
        ...,
        "sensitivitySpec": coalesce(
          specifications[title match "Sensitivity"][0].value,
          "0 dB"
        ),
        "hasSensitivity": defined(specifications[title match "Sensitivity"][0]),
        "sortingOrder": count(specifications[title match "Sensitivity"])
      } | order(sortingOrder ${selectedSort.direction})`;
    } else if (selectedSort.field === "impedance") {
      assembledQuery += `] {
          ...,
          "impedanceSpec": coalesce(
            specifications[title match "Impedance"][0].value,
            "0"
          ),
          "hasImpedance": defined(specifications[title match "Impedance"][0]),
          "sortingOrder": count(specifications[title match "Impedance"])
        } | order(sortingOrder ${selectedSort.direction})`;
    } else {
      assembledQuery += `] | order(${selectedSort.field} ${selectedSort.direction})`;
    }
  } else {
    assembledQuery += `] | order(name asc)`;
  }

  const baseQuery = assembledQuery.substring(
    0,
    assembledQuery.lastIndexOf("]") + 1
  );

  const sortPart = assembledQuery.substring(
    assembledQuery.lastIndexOf("]") + 1
  );

  const finalQuery = `{
  "products": ${baseQuery}${sortPart}[${start}...${start + pageSize}],
  "totalProductsCount": count(${baseQuery})
}`;
  const GET_PRODUCTS_BY_QUERY = finalQuery;

  try {
    const result = await client.fetch(GET_PRODUCTS_BY_QUERY, { catalogueKeys });
    return {
      products: result.products || [],
      totalProductsCount: result.totalProductsCount || 0,
    };
  } catch (err) {
    console.error("Error fetching products:", err);
    return {
      products: [],
      totalProductsCount: 0,
    };
  }
};
