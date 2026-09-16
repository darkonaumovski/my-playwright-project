import "dotenv/config";

import { demoPassword } from "../test-data/users";

function parseBoolean(value: string | undefined): boolean {
  return (
    value !== undefined && ["1", "true", "yes"].includes(value.toLowerCase())
  );
}

function parsePositiveInteger(
  name: string,
  value: string | undefined,
): number | undefined {
  if (value === undefined || value === "") {
    return undefined;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error(`${name} must be a positive integer; received "${value}".`);
  }

  return parsed;
}

function parseBaseURL(value: string | undefined): string {
  const rawValue = value ?? "https://www.saucedemo.com";
  const url = new URL(rawValue);

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error(`BASE_URL must use HTTP or HTTPS; received "${rawValue}".`);
  }

  return url.toString().replace(/\/$/, "");
}

export const environment = Object.freeze({
  baseURL: parseBaseURL(process.env.BASE_URL),
  isCI: parseBoolean(process.env.CI),
  ciWorkers: parsePositiveInteger("CI_WORKERS", process.env.CI_WORKERS),
  credentials: Object.freeze({
    username: process.env.TEST_USERNAME ?? "standard_user",
    password: process.env.TEST_PASSWORD ?? demoPassword,
  }),
});

export type Credentials = typeof environment.credentials;
