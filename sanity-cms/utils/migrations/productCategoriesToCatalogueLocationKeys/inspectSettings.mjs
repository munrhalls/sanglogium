import client from "./../../getClient.mjs";

async function inspectSettings() {
  const settings = await client.fetch(`*[_type == "settings"][0]`);
  console.log("🔍 SETTINGS DUMP:");
  console.log(JSON.stringify(settings, null, 2));
}

inspectSettings();
