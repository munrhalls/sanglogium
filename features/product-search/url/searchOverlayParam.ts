import { parseAsBoolean } from "nuqs";

export const searchOverlayParam = parseAsBoolean.withOptions({ history: "push" });
