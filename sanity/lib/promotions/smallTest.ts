import { defineQuery } from "next-sanity";
import { client } from "../client";

export const smallTest = async () => {
  const SMALL_TEST = defineQuery(`
    *[_type == "promotion"][0]
  `);

  try {
    const headline = await client.fetch(SMALL_TEST);
    return headline || null;
  } catch (err) {
    console.error(err);
    return null;
  }
};
