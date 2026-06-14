import { runMigrations } from "../db/migrate";
import { app } from "./app";

export async function startServer() {
  await runMigrations();

  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`server is running on PORT=${PORT}`);
  });
}
