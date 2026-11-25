import { pool } from "../db/connection.js";

export async function responderAssistenteSustentavel(mensagem) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY não configurada no ficheiro .env");
  }

  const [produtos] = await pool.query(
    "SELECT id, nome, categoria, condicao, preco, estoque FROM produtos WHERE estoque > 0 ORDER BY condicao DESC, id ASC"
  );

  const catalogoTexto = produtos.length
    ? produtos
        .map(
          (p) =>
            `- [${p.condicao.toUpperCase()}] ${p.nome} (${p.categoria}) | R$ ${Number(p.preco).toFixed(2)} | Estoque: ${p.estoque}`
        )
        .join("\n")
    : "Nenhum produto disponível em estoque no momento.";

  const promptSistema = `Você é o Assistente de Consumo Consciente do marketplace VibeCoding.
Seu objetivo é ajudar o cliente a escolher produtos de forma sustentável, incentivando o reaproveitamento (itens USADOS/recondicionados) quando fizer sentido e explicando o impacto positivo na redução de lixo e emissões.
Responda em português, de forma clara, simpática e objetiva, recomendando apenas itens reais do catálogo abaixo:

CATÁLOGO ATUAL EM ESTOQUE:
${catalogoTexto}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: `${promptSistema}\n\nPergunta do cliente: ${mensagem}` }],
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    const erroTexto = await response.text();
    throw new Error(`Erro na API do Gemini (${response.status}): ${erroTexto}`);
  }

  const data = await response.json();
  const resposta =
    data?.candidates?.[0]?.content?.parts?.[0]?.text ||
    "Não consegui gerar uma recomendação agora. Tente novamente em instantes.";

  return resposta;
}
