import RangeFilter from "./RangeFilter";
import MinOnlyFilter from "./MinOnlyFilter";
import { useSearchParams } from "next/navigation";
import { FilterComponentProps } from "./FilterTypes";
import { FilterValue } from "./FilterTypes";
import { Suspense } from "react";

function FilterItemContent({
  filter,
  value,
  onChange,
}: {
  filter: FilterComponentProps;
  value: string | number | boolean | object | string[] | null;
  onChange: (
    value: string | number | boolean | object | string[],
    type: string
  ) => void;
}) {
  const searchParams = useSearchParams();
  if (!filter) return null;
  const { type, name, options, min, max, isMinOnly, step } = filter;
  const normalizedName = name.toLowerCase();
  const initialMin = searchParams.get(`${normalizedName}_min`)
    ? parseInt(searchParams.get(`${normalizedName}_min`) ?? "0", 10)
    : undefined;
  const initialMax = searchParams.get(`${normalizedName}_max`)
    ? parseInt(searchParams.get(`${normalizedName}_max`) ?? "", 10)
    : undefined;
  switch (type) {
    case "checkbox":
      return (
        <div className="filter-item mb-3">
          <h4 className="mb-4 text-center text-xl font-bold uppercase tracking-wide">
            {name}
          </h4>
          <label className="flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={!!value}
              onChange={(e) => onChange(e.target.checked, "checkbox")}
              className="mr-2"
            />
            <span>{options && options[0] ? options[0] : "Enable"}</span>
          </label>
        </div>
      );
    case "range":
      if (isMinOnly) {
        return (
          <div className="filter-item mb-3">
            <h4 className="mb-4 text-center text-xl font-bold uppercase tracking-wide">
              {name}
            </h4>
            <MinOnlyFilter
              name={name.toLowerCase()}
              min={min || 0}
              max={max || 500}
              step={step || 1}
              onChange={(name: string, value: { min: number }, type: string) =>
                onChange(value, type)
              }
              initialMin={initialMin}
            />
          </div>
        );
      }
      return (
        <div className="filter-item mb-3">
          <h4 className="mb-4 text-center text-xl font-bold uppercase tracking-wide">
            {name}
          </h4>
          <RangeFilter
            name={name.toLowerCase()}
            min={min || 0}
            max={max || 10000}
            step={step || 1}
            onChange={(
              name: string,
              value: { min?: number; max?: number } | number,
              type: string
            ) => {
              onChange(value as FilterValue, type);
            }}
            initialMin={initialMin}
            initialMax={initialMax}
          />
        </div>
      );
    case "multiselect":
      const safeOptions = Array.isArray(options) ? options : [];
      const safeValue = Array.isArray(value) ? value : [];
      return (
        <div className="filter-item mb-3">
          <h4 className="mb-4 text-center text-xl font-bold uppercase tracking-wide">
            {name}
          </h4>
          <div className="space-y-1">
            {safeOptions.map((option, i) => (
              <label key={i} className="flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={safeValue.includes(option)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onChange([...safeValue, option], "multiselect");
                    } else {
                      onChange(
                        safeValue.filter((item) => item !== option),
                        "multiselect"
                      );
                    }
                  }}
                  className="mr-3 h-5 w-5 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-lg">{option}</span>
              </label>
            ))}
          </div>
        </div>
      );
    case "radio":
      const radioOptions = Array.isArray(options) ? options : [];
      return (
        <div className="filter-item mb-3">
          <h4 className="mb-4 text-center text-xl font-bold uppercase tracking-wide">
            {name}
          </h4>
          <div className="space-y-1">
            {radioOptions.map((option, i) => (
              <label key={i} className="flex cursor-pointer items-center">
                <input
                  type="radio"
                  name={name.toLowerCase()}
                  checked={value === option}
                  onChange={() => onChange(option, "radio")}
                  className="mr-2"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </div>
      );
    case "boolean":
      return (
        <div className="filter-item mb-3">
          <h4 className="mb-4 text-center text-xl font-bold uppercase tracking-wide">
            {name}
          </h4>
          <label className="flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={!!value}
              onChange={(e) => onChange(e.target.checked, "checkbox")}
              className="mr-2"
            />
            <span>{name}</span>
          </label>
        </div>
      );
    default:
      return (
        <div className="filter-item mb-3">
          <h4 className="mb-4 text-center text-xl font-bold uppercase tracking-wide">
            {name}
          </h4>
          <p className="text-sm text-gray-500">
            Unsupported filter type: {type}
          </p>
        </div>
      );
  }
}

export default function FilterItem(props: {
  filter: FilterComponentProps;
  value: string | number | boolean | object | string[] | null;
  onChange: (
    value: string | number | boolean | object | string[],
    type: string
  ) => void;
}) {
  return (
    <Suspense fallback={null}>
      <FilterItemContent {...props} />
    </Suspense>
  );
}
