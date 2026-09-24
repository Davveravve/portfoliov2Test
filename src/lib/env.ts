import { z } from "zod";

/**
 * Typed, validated server environment. Every variable is optional so the app
 * runs locally with zero configuration; features degrade based on what is set.
 * Documented in `.env.example`.
 */
const empty = (v: unknown) => (v === "" ? undefined : v);
const opt = z.preprocess(empty, z.string().optional());

const schema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  NEXT_PUBLIC_SITE_URL: z.preprocess(empty, z.url().optional()),
  VERCEL_PROJECT_PRODUCTION_URL: opt,

  DATABASE_URL: opt,
  PGLITE_DATA_DIR: z.preprocess(empty, z.string().default(".data/pglite")),

  STORAGE_DRIVER: z.preprocess(empty, z.enum(["local", "s3"]).default("local")),
  LOCAL_STORAGE_DIR: z.preprocess(empty, z.string().default(".data/uploads")),
  S3_ENDPOINT: opt,
  S3_REGION: z.preprocess(empty, z.string().default("auto")),
  S3_BUCKET: opt,
  S3_ACCESS_KEY_ID: opt,
  S3_SECRET_ACCESS_KEY: opt,
  S3_PUBLIC_URL: opt,

  AUTH_SECRET: opt,
  AUTH_GITHUB_ID: opt,
  AUTH_GITHUB_SECRET: opt,
  AUTH_GITHUB_ALLOWED_ID: opt,
  AUTH_TEST_MODE: opt,

  RESEND_API_KEY: opt,
  EMAIL_FROM: opt,

  CRON_SECRET: opt,
});

export type Env = z.infer<typeof schema>;

export function parseEnv(source: Record<string, string | undefined>): Env {
  return schema.parse(source);
}

export const env: Env = parseEnv(process.env);

/** Feature flags derived from env — the single place UI checks what is enabled. */
export const features = {
  email: Boolean(env.RESEND_API_KEY && env.EMAIL_FROM),
  githubAuth: Boolean(env.AUTH_GITHUB_ID && env.AUTH_GITHUB_SECRET && env.AUTH_GITHUB_ALLOWED_ID),
} as const;

export function siteUrl(): string {
  if (env.NEXT_PUBLIC_SITE_URL) return env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  if (env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return "http://localhost:3000";
}
