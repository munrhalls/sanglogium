export const FIXED_IN_CODE = ["brand", "inStock", "price"];

const isListOfObjects = (field: any): boolean =>
  field.type === "array" && Array.isArray(field.of) && field.of.some((member: any) => member.type === "object");

export function filterFieldPaths(fields: any[], prefix = ""): string[] {
  const paths: string[] = [];
  for (const field of fields) {
    const path = prefix ? prefix + "." + field.name : field.name;
    if (field.type === "object" && Array.isArray(field.fields)) {
      paths.push(...filterFieldPaths(field.fields, path));
    } else if (!isListOfObjects(field)) {
      paths.push(path);
    }
  }
  return [...new Set(paths)].filter((path) => !FIXED_IN_CODE.includes(path));
}
