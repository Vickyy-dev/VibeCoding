import { Router } from "express";
import { responderAssistenteSustentavel } from "../services/assistenteService.js";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { mensagem, historico, orcamentoMax, orcamento_max, perfil } = req.body;

    if (!mensagem || typeof mensagem !== "string" || !mensagem.trim()) {
      return res.status(400).json({ error: "Envie o campo 'mensagem'." });
    }

    const limitePreco = orcamentoMax ?? orcamento_max ?? null;
    const resposta = await responderAssistenteSustentavel(mensagem.trim(), historico, {
      orcamentoMax: limitePreco,
      perfil,
    });

    res.json({ resposta });
  } catch (err) {
    res.status(500).json({ error: "Erro no assistente da loja", details: err.message });
  }
});

export default router;