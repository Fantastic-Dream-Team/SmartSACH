import dotenv from "dotenv";

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 10000),
  corsOrigin: process.env.CORS_ORIGIN || "*",
  supabaseUrl: process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "",
  supabaseAnonKey:
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_KEY ||
    "",
  databaseUrl: process.env.DATABASE_URL || process.env.POSTGRES_URL || "",
  dbHost: process.env.DB_HOST || "aws-1-us-west-2.pooler.supabase.com",
  dbPort: Number(process.env.DB_PORT || 5432),
  dbName: process.env.DB_NAME || process.env.POSTGRES_DB || "postgres",
  dbUser: process.env.DB_USER || process.env.POSTGRES_USER || "postgres.hbgfywutsshezntatljs",
  dbPassword:
    process.env.DB_PASSWORD ||
    process.env.DB_PASS ||
    process.env.POSTGRES_PASSWORD ||
    process.env.POSTGRES_PASS ||
    "",
  dbSsl:
    process.env.DB_SSL === "true" ||
    process.env.DB_SSL === "1" ||
    process.env.DATABASE_URL?.includes("supabase.com") ||
    (process.env.DB_HOST || "aws-1-us-west-2.pooler.supabase.com").includes("supabase.com") ||
    process.env.NODE_ENV === "production",
  jwtSecret: process.env.JWT_SECRET || "dev-secret-change-me",
};
