import { pool } from "../db/connection.js";

const PALAVRAS_FORA_DO_ESCOPO = [
  "receita de bolo",
  "futebol",
  "horóscopo",
  "signo",
  "tarot",
  "piada",
  "traduza",
  "código de programação",
  "html",
  "css",
  "sql",
  "prova de matemática",
  "eleição",
  "política",
];

function pareceForaDoEscopo(mensagem) {
  const texto = mensagem.toLowerCase();
  const temTermoLoja =
    /loja|produto|comprar|compra|vender|venda|vendedor|cliente|preço|preco|valor|estoque|categoria|frete|entrega|pagamento|pix|cartão|cartao|usado|novo|recondicionado|anunciar|anúncio|anuncio|lucro|margem|desconto|sustent|catálogo|catalogo|pedido|carrinho|checkout|troca|devolução|devolucao/.test(
      texto
    );

  if (temTermoLoja) return false;
  return PALAVRAS_FORA_DO_ESCOPO.some((termo) => texto.includes(termo));
}

function resolverPerfil(perfilInformado, mensagem) {
  if (perfilInformado === "vendedor" || perfilInformado === "cliente") {
    return perfilInformado;
  }
  const texto = mensagem.toLowerCase();
  if (/vender|venda|vendedor|anunciar|anuncio|precificar|preço do meu|meu produto|estoque meu|margem|lucro/.test(texto)) {
    return "vendedor";
  }
  return "cliente";
}

function montarFallback(mensagem, perfil, produtos) {
  const termos = mensagem
    .toLowerCase()
    .split(/\s+/)
    .filter((p) => p.length > 2);

  const similares = produtos.filter((p) => {
    const base = `${p.nome} ${p.categoria} ${p.condicao}`.toLowerCase();
    return termos.some((t) => base.includes(t));
  });

  const lista = (similares.length ? similares : produtos).slice(0, 3);

  if (perfil === "vendedor") {
    const referencia = lista.length
      ? lista
          .map((p) => `• **${p.nome}** (${p.condicao}) — R$ ${Number(p.preco).toFixed(2)} | Estoque: ${p.estoque}`)
          .join("\n")
      : "Ainda não há itens de referência no catálogo.";

    return `Posso te ajudar a vender melhor na loja! Referências atuais no catálogo:\n${referencia}\n\nMe diga qual item você quer vender, a condição (novo, usado ou recondicionado) e o valor pretendido para eu te ajudar na precificação e na divulgação.`;
  }

  if (!lista.length) {
    return "Não encontrei itens compatíveis no estoque agora. Quer me dizer a categoria, o que você precisa ou o seu orçamento máximo?";
  }

  const itens = lista
    .map((p) => `• **${p.nome}** (${p.condicao}) — R$ ${Number(p.preco).toFixed(2)} (${p.estoque} un.)`)
    .join("\n");

  return `Separei algumas opções da loja para ajudar na sua compra:\n${itens}\n\nSe quiser, me diga seu orçamento ou o que você busca para eu comparar melhor.`;
}

export async function responderAssistenteSustentavel(mensagem, historico = [], opcoes = {}) {
  const { orcamentoMax = null, perfil: perfilInformado = null } = opcoes;

  if (pareceForaDoEscopo(mensagem)) {
    return "Só consigo ajudar com assuntos ligados à loja, compras, produtos e vendas. Como posso te ajudar com suas compras ou vendas por aqui?";
  }

  const perfil = resolverPerfil(perfilInformado, mensagem);

  const queryBase = orcamentoMax
    ? "SELECT id, nome, categoria, condicao, preco, estoque FROM produtos WHERE estoque > 0 AND preco <= ? ORDER BY preco ASC"
    : "SELECT id, nome, categoria, condicao, preco, estoque FROM produtos WHERE estoque > 0 ORDER BY categoria ASC, preco ASC";

  const params = orcamentoMax ? [Number(orcamentoMax)] : [];
  const [produtos] = await pool.query(queryBase, params);

  const catalogoTexto = produtos.length
    ? produtos
        .map(
          (p) =>
            `- ID ${p.id} | ${p.nome} | Categoria: ${p.categoria} | Condição: ${p.condicao} | Preço: R$ ${Number(p.preco).toFixed(2)} | Estoque: ${p.estoque}`
        )
        .join("\n")
    : "Nenhum produto disponível em estoque no momento.";

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return montarFallback(mensagem, perfil, produtos);
  }

  const historicoFormatado =
    Array.isArray(historico) && historico.length
      ? historico
          .slice(-6)
          .map((item) => `${item.role === "assistant" ? "Assistente" : "Usuário"}: ${item.content}`)
          .join("\n")
      : "Sem histórico anterior.";

  const instrucaoPapel =
    perfil === "vendedor"
      ? `O usuário está no perfil de VENDEDOR (quer vender, precificar, anunciar, gerir estoque ou entender a concorrência/catálogo da loja). Ajude com precificação, posicionamento, descrição de produto, condição (novo/usado/recondicionado) e estratégias práticas para vender bem.`
      : `O usuário está no perfil de CLIENTE (quer comprar, comparar itens, tirar dúvidas sobre a loja/produtos ou escolher com bom custo-benefício e consciência sustentável). Ajude a decidir com clareza, comparando opções reais do catálogo e destacando reaproveitamento/sustentabilidade quando fizer sentido.`;

  const prompt = `Você é o assistente oficial do marketplace VibeCoding.
REGRAS DE ESCOPO:
1. Responda a TODO tipo de dúvida relacionada à loja, compras, vendas, produtos, catálogo, preços, estoque, pagamento, entrega, trocas ou sustentabilidade no consumo/comércio.
2. Se a pergunta NÃO tiver relação com a loja, compras ou vendas, recuse com educação em 1 ou 2 frases curtas e convide o usuário a falar sobre compras ou vendas na loja.
3. Baseie recomendações e comparações de produtos APENAS nos dados reais do catálogo abaixo (não invente itens nem preços fora dele).

MODO ATUAL: ${perfil.toUpperCase()}
${instrucaoPapel}

Responda sempre em português, de forma clara, prática e objetiva.

CATÁLOGO ATUAL DA LOJA:
${catalogoTexto}

HISTÓRICO RECENTE:
${historicoFormatado}

PERGUNTA DO USUÁRIO:
${mensagem}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!response.ok) {
      return montarFallback(mensagem, perfil, produtos);
    }

    const data = await response.json();
    const texto = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    return texto || montarFallback(mensagem, perfil, produtos);
  } catch {
    return montarFallback(mensagem, perfil, produtos);
  }
}