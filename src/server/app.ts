import express from "express";
import cors from "cors";

import { routes } from "./routes";
import { errorHandler } from "@/middleware/errorHandler";
import path from "path";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/v1", routes);

app.use(errorHandler);

app.use(express.static(path.join(process.cwd(), "public")));
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(process.cwd(), "public", "index.html"));
});

export { app };
