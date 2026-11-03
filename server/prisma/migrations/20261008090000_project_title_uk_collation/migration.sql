-- Sort project titles by Ukrainian alphabet rules (ICU) regardless of the server's OS locale.
-- Prisma has no collation attribute for PostgreSQL, so it is set in this migration.
ALTER TABLE "projects" ALTER COLUMN "title" TYPE VARCHAR(120) COLLATE "uk-x-icu";
