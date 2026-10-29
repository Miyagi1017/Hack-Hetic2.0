import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import authRouter from "../src/server/routes/auth.js";
import tripsRouter from "../src/server/routes/trips.js";

const app = express();
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/trips", tripsRouter);

export default app;
