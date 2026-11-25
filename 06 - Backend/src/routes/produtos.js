import { Router } from "express";
import { pool } from "../db/connection.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { categoria, condicao } = req.query;
    const conditions = [];
    const params = [];

    if (categoria && categoria !== "todos") {
      conditions.push("categoria = ?");
      params.push(String(categoria));
    }

    if (condicao && (condicao === "novo" || condicao === "usado")) {
      conditions.push("condicao = ?");
      params.push(condicao);
    }

    let sql = "SELECT * FROM produtos";
    if (conditions.length > 0) {
      sql += " WHERE " + conditions.join(" AND ");
    }
    sql += " ORDER BY id ASC";

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar produtos", details: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query("SELECT * FROM produtos WHERE id = ?", [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Produto não encontrado" });
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar produto", details: err.message });
  }
});

export default router;
