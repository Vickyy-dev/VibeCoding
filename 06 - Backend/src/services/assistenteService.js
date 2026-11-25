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
  "prova de matemática",
  "eleição",
  "política",
];

function pareceForaDoEscopo(mensagem) {
  const texto = mensagem.toLowerCase();
  const temTermoLoja =
    /loja|produto|comprar|compra|vender|venda|vendedor|cliente|preço|preco|valor|estoque|categoria|frete|entrega|pagamento|pix|cartão|cartao|dinheiro|parcela|parcelamento|vista|sustent|catálogo|catalogo|pedido|carrinho|checkout|troca|devolução|devolucao|garantia|opç|opc|barato|caro|item|itens|anunciar|anúncio|anuncio|lucro|margem|desconto/.test(
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
  if (
    /vender|venda|vendedor|anunciar|anuncio|precificar|preço do meu|preco do meu|meu produto|estoque meu|margem|lucro/.test(
      texto
    )
  ) {
    return "vendedor";
  }
  return "cliente";
}

function classificarInteracaoSocial(mensagem) {
  const texto = mensagem
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[!?.~,]+$/g, "")
    .trim();

  if (
    /^(oi+|ola+|bom dia|boa tarde|boa noite|e+a+i+|o+p+a+|fala|salve|hey|hello|hi)(\s+(tudo\s*(bem|certo|bom)|td\s*bem|beleza|por\s+ai))?$/.test(
      texto
    ) ||
    /^(tudo\s*(bem|certo|bom)|td\s*bem|como\s+vai|como\s+voce\s+esta)$/.test(texto)
  ) {
    return "saudacao";
  }

  if (/^(obrigado|obrigada|valeu|muito obrigado|muito obrigada|agradeco)$/.test(texto)) {
    return "agradecimento";
  }

  if (/^(tchau|ate mais|flw)$/.test(texto)) {
    return "despedida";
  }

  return null;
}

function responderInteracaoSocial(tipo, perfil) {
  if (tipo === "saudacao") {
    return perfil === "vendedor"
      ? "Olá! Que bom ter você por aqui. Posso ajudar com preços, anúncios ou dúvidas sobre vendas. O que você gostaria de ver?"
      : "Olá! Que bom ter você por aqui. Posso ajudar a encontrar produtos, comparar opções ou tirar dúvidas sobre a loja. Como posso ajudar?";
  }

  if (tipo === "agradecimento") {
    return "Por nada! Fico à disposição se precisar de mais alguma ajuda.";
  }

  return "Até mais! Obrigado pela conversa. Estarei por aqui quando precisar.";
}

function removerMarcacaoMarkdown(texto) {
  return texto
    .replace(/\*\*(.*?)\*\*/gs, "$1")
    .replace(/\*(.*?)\*/gs, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .trim();
}

function extrairValorNaMensagem(mensagem) {
  const match = mensagem.match(/(?:r\$|\$)?\s*(\d+(?:[.,]\d{1,2})?)/i);
  if (!match) return null;
  const valor = Number(match[1].replace(",", "."));
  return Number.isFinite(valor) && valor > 0 ? valor : null;
}

function formatarListaProdutos(lista, limite = 3) {
  return lista
    .slice(0, limite)
    .map(
      (p) =>
        `• **${p.nome}** — **R$ ${Number(p.preco).toFixed(2)}** *(${p.condicao}, ${p.estoque} em estoque)*`
    )
    .join("\n");
}

function montarRespostaInteligenteFallback(mensagem, perfil, produtos, motivoFallback = "") {
  const texto = mensagem.toLowerCase().trim();
  const textoLimpo = texto.replace(/[!?.~,]+$/g, "").trim();
  const valorCitado = extrairValorNaMensagem(texto);

  const avisoModo = motivoFallback
    ? `\n\n*(Modo local ativo — ${motivoFallback})*`
    : "\n\n*(Modo local ativo — adicione GEMINI_API_KEY no .env para respostas em linguagem livre com IA)*";

  // 1. Cumprimentos e saudações (curtos ou com "tudo bem")
  const ehCumprimento =
    /^(oi+|ol[aá]+|bom dia|boa tarde|boa noite|e+a+[ií]|o+p+a+|fala|salve|hey|hello|hi)(\s+(tudo\s*(bem|certo|bom)|td\s*bem|beleza|por\s*a[ií]|ai))?$/i.test(
      textoLimpo
    ) ||
    /^(tudo\s*(bem|certo|bom)|td\s*bem|como\s*vai|como\s*voc[eê]\s*est[aá])\??$/i.test(
      textoLimpo
    );

  if (ehCumprimento) {
    return perfil === "vendedor"
      ? `Olá! Seja muito bem-vindo(a)! Tudo ótimo por aqui, e com você? Ficarei feliz em ajudar a precificar, melhorar seus anúncios ou tirar dúvidas sobre vendas na loja. Por onde gostaria de começar?${avisoModo}`
      : `Olá! Seja muito bem-vindo(a)! Tudo ótimo por aqui, e com você? Estou à disposição para te ajudar a encontrar produtos, comparar opções ou tirar dúvidas sobre compras. Como posso te ajudar hoje?${avisoModo}`;
  }

  // 2. Agradecimentos e despedidas educadas
  if (/^(obrigad[oa]|valeu|muito obrigad[oa]|agrade[cç]o|tchau|at[eé]\s*mais|flw)\b/i.test(textoLimpo)) {
    return perfil === "vendedor"
      ? `Eu que agradeço pela confiança! Sempre que precisar de ajuda para precificar, organizar um anúncio ou analisar o catálogo, é só chamar. Boas vendas!${avisoModo}`
      : `Eu que agradeço! Fico muito feliz em ajudar. Se surgir qualquer dúvida sobre produtos, valores ou compras, estarei por aqui. Tenha um ótimo dia!${avisoModo}`;
  }

  // 3. Perguntas simples sobre formas de pagamento (cartão, dinheiro, Pix, parcelamento, à vista)
  if (
    /cartão|cartao|dinheiro|pix|parcela|parcelamento|à vista|a vista|forma de pagamento|formas de pagamento|vale mais a pena/.test(
      texto
    )
  ) {
    if (perfil === "vendedor") {
      return `Com certeza! Para quem vende, cada forma de pagamento tem vantagens diferentes:\n• **Pix ou à vista:** ajuda a receber o valor rapidamente e evita taxas ou parcelamentos longos.\n• **Cartão / parcelado:** costuma facilitar compras de valor mais alto, desde que você considere eventuais taxas na sua margem.\n\nQual faixa de preço têm os itens que você pretende vender?${avisoModo}`;
    }

    return `Com prazer te ajudo a pensar nisso! Depende do seu objetivo no momento:\n• **Dinheiro, Pix ou à vista:** excelente opção para manter o orçamento organizado e evitar comprometer meses seguintes com parcelas.\n• **Cartão:** pode fazer sentido quando você quer diluir um valor planejado com tranquilidade, desde que caiba com folga no seu limite e você quite a fatura em dia.\n\nVocê está pensando em alguma compra específica agora ou quer ver opções dentro de um orçamento?${avisoModo}`;
  }

  // 4. Perguntas simples sobre entrega, frete, prazo, troca, devolução ou garantia
  if (/frete|entrega|entregar|prazo|envio|troca|trocar|devolução|devolucao|devolver|garantia/.test(texto)) {
    return `Claro! Aqui vão alguns pontos importantes para conferir antes de fechar:\n• **Entrega e frete:** vale sempre verificar o valor e o prazo estimado para a sua região antes de finalizar o pedido.\n• **Condição, troca e garantia:** em itens **usados ou recondicionados**, confira com atenção o estado descrito no anúncio; em itens **novos**, observe as condições de troca e garantia da loja.\n\nPosso te ajudar a olhar algum produto em especial?${avisoModo}`;
  }

  // 5. Modo VENDEDOR
  if (perfil === "vendedor") {
    const mediaPreco = produtos.length
      ? produtos.reduce((acc, p) => acc + Number(p.preco), 0) / produtos.length
      : 0;

    const exemplos = produtos
      .slice(0, 3)
      .map(
        (p) =>
          `• **${p.nome}** (${p.condicao}) — R$ ${Number(p.preco).toFixed(2)} (${p.estoque} un.)`
      )
      .join("\n");

    let dicaExtra =
      "Dica prática: quando o item for **usado ou recondicionado**, deixe bem claro o estado de conservação e mostre o custo-benefício em relação a um item novo.";

    if (valorCitado) {
      dicaExtra = `Considerando o valor de **R$ ${valorCitado.toFixed(2)}**, vale comparar com itens semelhantes do catálogo (média atual perto de **R$ ${mediaPreco.toFixed(2)}**) e destacar o que agrega valor ao produto (conservação, acessórios ou lote).`;
    } else if (/descriç|descric|título|titulo|anunciar|anúncio|anuncio|foto|fotos/.test(texto)) {
      dicaExtra =
        "Para deixar o anúncio mais atrativo e transparente: use um título claro com **tipo do produto + condição + principal destaque**, mostre fotos reais e informe o estado de uso e a quantidade disponível.";
    } else if (/lucro|margem|preço|preco|precificar/.test(texto)) {
      dicaExtra =
        "Na hora de precificar, considere o custo do item, eventuais taxas ou despesas extras e a margem que você deseja obter, mantendo um valor competitivo frente ao catálogo.";
    }

    return `Fico feliz em te orientar no modo **Vendedor**!\n${dicaExtra}\n\nReferências atuais da loja:\n${exemplos || "Sem itens cadastrados ainda."}\n\nQual produto você gostaria de anunciar ou precificar agora?${avisoModo}`;
  }

  // 6. Modo CLIENTE (filtros de preço, condição, comparação ou busca por palavra-chave)
  let candidatos = [...produtos];

  if (
    valorCitado &&
    (/até|ate|máximo|maximo|no máximo|no maximo|orçamento|orcamento|menos de/.test(texto) ||
      texto.includes("r$"))
  ) {
    candidatos = candidatos.filter((p) => Number(p.preco) <= valorCitado);
  }

  if (/usado|recondicionado|restaurado|reaproveitado|sustent/.test(texto)) {
    const sustentaveis = candidatos.filter((p) =>
      /usado|recondicionado|restaurado|reaproveitado/i.test(`${p.condicao} ${p.nome}`)
    );
    if (sustentaveis.length) candidatos = sustentaveis;
  } else if (/\bnovo\b/.test(texto)) {
    const novos = candidatos.filter((p) => p.condicao.toLowerCase() === "novo");
    if (novos.length) candidatos = novos;
  }

  if (/mais barato|menor preço|menor preco|economizar|barato/.test(texto)) {
    candidatos.sort((a, b) => Number(a.preco) - Number(b.preco));
  } else if (/mais caro|maior preço|maior preco|completo|caro/.test(texto)) {
    candidatos.sort((a, b) => Number(b.preco) - Number(a.preco));
  }

  const termos = texto
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(
      (p) =>
        p.length > 2 &&
        ![
          "quero",
          "algo",
          "para",
          "com",
          "mais",
          "opções",
          "opcoes",
          "loja",
          "comprar",
          "sobre",
          "qual",
          "quais",
          "tem",
          "você",
          "voce",
        ].includes(p)
    );

  const porPalavra = candidatos.filter((p) => {
    const base = `${p.nome} ${p.categoria} ${p.condicao}`.toLowerCase();
    return termos.some((t) => base.includes(t));
  });

  const listaFinal = (porPalavra.length ? porPalavra : candidatos).slice(0, 3);

  if (!listaFinal.length) {
    return valorCitado
      ? `Poxa, não encontrei itens disponíveis até **R$ ${valorCitado.toFixed(2)}** no estoque no momento. Gostaria de aumentar um pouco esse valor ou ver outras opções?${avisoModo}`
      : `Poxa, não encontrei itens exatos com esse filtro agora. Quer tentar outra palavra ou me dizer qual valor você pretende gastar?${avisoModo}`;
  }

  if (/comparar|diferença|diferenca|custo-benefício|custo beneficio/.test(texto) && listaFinal.length >= 2) {
    const comparativo = listaFinal
      .map(
        (p) =>
          `• **${p.nome}** — **R$ ${Number(p.preco).toFixed(2)}** (${p.condicao}, ${p.estoque} un.)`
      )
      .join("\n");

    return `Preparei um comparativo rápido das opções disponíveis:\n${comparativo}\n\nSe o objetivo for economizar ou apostar em reaproveitamento, os itens usados/recondicionados costumam ter ótimo custo-benefício; se preferir algo novo e o orçamento permitir, vale avaliar a opção nova.\n\nQual desses chama mais a sua atenção?${avisoModo}`;
  }

  return `Com certeza! Separei estas opções disponíveis para você:\n${formatarListaProdutos(listaFinal)}\n\nQuer filtrar por um valor máximo, comparar itens ou saber mais detalhes sobre algum deles?${avisoModo}`;
}

export async function responderAssistenteSustentavel(mensagem, historico = [], opcoes = {}) {
  const { orcamentoMax = null, perfil: perfilInformado = null } = opcoes;

  if (pareceForaDoEscopo(mensagem)) {
    return "Peço desculpas, mas consigo ajudar apenas com assuntos relacionados à loja, compras, produtos, catálogo, pagamentos e vendas. Quer ver opções de compra ou tirar alguma dúvida sobre a loja?";
  }

  const perfil = resolverPerfil(perfilInformado, mensagem);
  const interacaoSocial = classificarInteracaoSocial(mensagem);
  if (interacaoSocial) {
    return responderInteracaoSocial(interacaoSocial, perfil);
  }

  const limiteEfetivo = orcamentoMax ?? extrairValorNaMensagem(mensagem);

  const queryBase = limiteEfetivo
    ? "SELECT id, nome, categoria, condicao, preco, estoque FROM produtos WHERE estoque > 0 AND preco <= ? ORDER BY preco ASC"
    : "SELECT id, nome, categoria, condicao, preco, estoque FROM produtos WHERE estoque > 0 ORDER BY categoria ASC, preco ASC";

  const params = limiteEfetivo ? [Number(limiteEfetivo)] : [];
  const [produtos] = await pool.query(queryBase, params);

  const catalogoTexto = produtos.length
    ? produtos
        .map(
          (p) =>
            `- ID ${p.id} | ${p.nome} | Categoria: ${p.categoria} | Condição: ${p.condicao} | Preço: R$ ${Number(p.preco).toFixed(2)} | Estoque: ${p.estoque}`
        )
        .join("\n")
    : "Nenhum produto disponível em estoque no momento.";

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return removerMarcacaoMarkdown(montarRespostaInteligenteFallback(mensagem, perfil, produtos));
  }

  const historicoFormatado =
    Array.isArray(historico) && historico.length
      ? historico
          .slice(-8)
          .map((item) => `${item.role === "assistant" ? "Assistente" : "Usuário"}: ${item.content}`)
          .join("\n")
      : "Sem histórico anterior.";

  const instrucaoPapel =
    perfil === "vendedor"
      ? "Você está ajudando um VENDEDOR. Seja cordial, educado(a) e direto(a), dando orientações práticas sobre vendas, precificação, condição do produto (novo/usado/recondicionado), descrição e estratégia de venda usando o catálogo real como referência."
      : "Você está ajudando um CLIENTE. Seja cordial, educado(a) e atencioso(a), respondendo bem a cumprimentos, dúvidas simples de compra/pagamento/orçamento e recomendações ou comparações de produtos do catálogo.";

  const prompt = `Você é o assistente virtual do marketplace VibeCoding. Converse em português do Brasil, com educação, clareza, atenção e naturalidade.
REGRAS:
1. Use um tom gentil e profissional, sem exagerar em exclamações, intimidade ou emojis. Trate a pessoa por "você".
2. Se a mensagem for apenas um cumprimento, agradecimento ou despedida, responda de forma breve e adequada; não liste produtos nem faça uma apresentação longa.
3. Responda apenas a assuntos ligados à loja, compras, vendas, produtos, catálogo, preços, estoque, pagamentos, entregas, trocas ou consumo/comércio sustentável. Para outros temas, recuse com educação em uma frase e redirecione para o escopo da loja.
4. Responda primeiro ao que foi perguntado. Use o histórico para entender referências a mensagens anteriores e evite repetir perguntas já respondidas.
5. Recomende produtos de acordo com o pedido e o orçamento informado. Ao comparar, explique diferenças relevantes usando apenas os dados disponíveis.
6. Use exclusivamente os dados reais do catálogo abaixo ao informar nomes, preços, condições ou estoque. Não invente frete, prazo, políticas, taxas ou garantias; se uma informação não estiver disponível, diga isso com clareza.
7. Se faltar uma informação necessária, faça no máximo uma pergunta objetiva. Não force uma lista de produtos quando ela não for pertinente.
8. Formate as respostas em texto simples, sem marcação Markdown como **negrito** ou títulos com #, pois o chat não renderiza esse formato.
9. Prefira respostas concisas, organizadas e úteis, com passos práticos quando ajudarem.

MODO ATUAL: ${perfil.toUpperCase()}
${instrucaoPapel}

CATÁLOGO ATUAL DA LOJA:
${catalogoTexto}

HISTÓRICO DA CONVERSA:
${historicoFormatado}

MENSAGEM ATUAL:
${mensagem}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!response.ok) {
      return removerMarcacaoMarkdown(
        montarRespostaInteligenteFallback(
          mensagem,
          perfil,
          produtos,
          `API Gemini retornou HTTP ${response.status}`
        )
      );
    }

    const data = await response.json();
    const texto = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    return removerMarcacaoMarkdown(
      texto ||
        montarRespostaInteligenteFallback(
          mensagem,
          perfil,
          produtos,
          "resposta vazia da API Gemini"
        )
    );
  } catch {
    return removerMarcacaoMarkdown(
      montarRespostaInteligenteFallback(
        mensagem,
        perfil,
        produtos,
        "falha de rede ao chamar a API Gemini"
      )
    );
  }
}