const isListOfObjects = (field: any): boolean =>
  field.type === "array" && Array.isArray(field.of) && field.of.some((member: any) => member.type === "object");

// Free text, not a closed list: 286 distinct values among 362 on 2026-10-31, up to 205 characters. A control from it would be a list of sentences.
const FREE_TEXT = new Set(["compatibility"]);

export function filterFieldPaths(fields: any[], prefix = ""): string[] {
  const paths: string[] = [];
  for (const field of fields) {
    const path = prefix ? prefix + "." + field.name : field.name;
    if (field.type === "object" && Array.isArray(field.fields)) {
      paths.push(...filterFieldPaths(field.fields, path));
    } else if (!isListOfObjects(field) && !FREE_TEXT.has(path)) {
      paths.push(path);
    }
  }
  return [...new Set(paths)];
}
