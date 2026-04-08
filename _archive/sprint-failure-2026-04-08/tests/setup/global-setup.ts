import { chromium, FullConfig } from "@playwright/test";
import path from "path";

async function globalSetup(config: FullConfig) {
  console.log("Setting up test environment...");

  // Set test environment variable
  process.env.NODE_ENV = 'test';

  console.log("Test environment ready");
}

export default globalSetup;
