import { Router } from "express";
import { responderAssistenteSustentavel } from "../services/assistenteService.js";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { mensagem } = req.body;

    if (!mensagem || typeof mensagem !== "string" || !mensagem.trim()) {
      return res.status(400).json({ error: "Envie o campo 'mensagem' com a pergunta do cliente." });
    }

    const resposta = await responderAssistenteSustentavel(mensagem.trim());
    res.json({ resposta });
  } catch (err) {
    res.status(500).json({ error: "Erro no assistente sustentável", details: err.message });
  }
});

export default router;
