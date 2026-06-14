import { db } from "./index.js";

export async function runMigrations() {
  const [, migrations] = await db.migrate.latest();
  if (migrations.length > 0) {
    console.log("Applied migrations:", migrations);
  }
}
