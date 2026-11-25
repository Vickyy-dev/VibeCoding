import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./db/connection.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ ok: true, service: "vibecoding-backend", db: "connected" });
  } catch (err) {
    res.status(500).json({ ok: false, service: "vibecoding-backend", db: "disconnected", error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor Backend a correr em http://localhost:${PORT}`);
});
