import express from "express";

import userRoutes from "@/modules/users/user.routes";
import authRoutes from "@/modules/auth/auth.routes";

const routes = express.Router();

routes.use("/users", userRoutes);
routes.use("/auth", authRoutes);

export { routes };
