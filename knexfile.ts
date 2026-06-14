import type { Knex } from "knex";

const config: Knex.Config<any> = {
  client: "better-sqlite3",
  connection: {
    filename: "./user-management.db",
  },
  useNullAsDefault: true,
  migrations: {
    directory: "./src/db/migrations",
    extension: "ts",
  },
};

export default config;
