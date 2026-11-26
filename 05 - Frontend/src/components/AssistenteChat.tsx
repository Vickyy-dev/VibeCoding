import React, { useState, useRef, useEffect } from "react";

type Perfil = "cliente" | "vendedor";

interface MensagemItem {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface SugestaoRapida {
  label: string;
  texto: string;
}

const SUGESTOES_CLIENTE: SugestaoRapida[] = [
  { label: "Mais baratos", texto: "Quais são os itens mais baratos disponíveis na loja?" },
  {
    label: "Sustentáveis / usados",
    texto: "Mostre opções usadas, recondicionadas ou sustentáveis",
  },
  {
    label: "Comparar opções",
    texto: "Compare as opções disponíveis e diga o melhor custo-benefício",
  },
];

const SUGESTOES_VENDEDOR: SugestaoRapida[] = [
  { label: "Como precificar?", texto: "Como definir um bom preço para um item usado no catálogo?" },
  {
    label: "Melhorar anúncio",
    texto: "Como escrever um bom título e descrição para vender mais rápido?",
  },
  { label: "Ver concorrência", texto: "Quais são os preços e condições atuais dos itens da loja?" },
];

const BASE_URL = (import.meta.env?.["VITE_API_URL"] || "http://localhost:3001").replace(/\/+$/, "");
const API_URL = BASE_URL.endsWith("/api/assistente") ? BASE_URL : `${BASE_URL}/api/assistente`;

export const AssistenteChat: React.FC = () => {
  const [aberto, setAberto] = useState(false);
  const [perfil, setPerfil] = useState<Perfil>("cliente");
  const [orcamento, setOrcamento] = useState<string>("");
  const [input, setInput] = useState<string>("");
  const [enviando, setEnviando] = useState<boolean>(false);
  const [mensagens, setMensagens] = useState<MensagemItem[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Olá! Sou o assistente do VibeCoding. Posso te ajudar a encontrar produtos e comprar com consciência ou te orientar na venda e precificação. O que manda?",
    },
  ]);

  const listaRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (aberto && listaRef.current) {
      listaRef.current.scrollTop = listaRef.current.scrollHeight;
    }
  }, [mensagens, aberto, enviando]);

  async function enviarMensagem(textoCustomizado?: string, e?: React.FormEvent) {
    if (e) e.preventDefault();
    const texto = (textoCustomizado ?? input).trim();
    if (!texto || enviando) return;

    const novaMsgUsuario: MensagemItem = {
      id: `${Date.now()}-user`,
      role: "user",
      content: texto,
    };

    const historicoParaApi = mensagens
      .filter((m) => m.id !== "welcome")
      .map((m) => ({ role: m.role, content: m.content }));

    const limitePreco =
      orcamento.trim() !== "" && !Number.isNaN(Number(orcamento)) ? Number(orcamento) : null;

    setMensagens((prev) => [...prev, novaMsgUsuario]);
    if (!textoCustomizado) setInput("");
    setEnviando(true);

    try {
      const resp = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mensagem: texto,
          perfil,
          orcamentoMax: limitePreco,
          historico: historicoParaApi,
        }),
      });

      const respostaServidor = await resp.text();
      let data: unknown;
      try {
        data = JSON.parse(respostaServidor);
      } catch {
        const contentType = resp.headers.get("content-type") || "desconhecido";
        throw new Error(
          `O servidor respondeu em formato inválido (HTTP ${resp.status}, ${contentType}).`,
        );
      }

      const payload =
        typeof data === "object" && data !== null
          ? (data as { error?: unknown; resposta?: unknown })
          : {};

      if (!resp.ok) {
        throw new Error(
          typeof payload.error === "string" ? payload.error : "Não foi possível obter resposta.",
        );
      }

      const respostaTexto =
        typeof payload.resposta === "string"
          ? payload.resposta
          : (JSON.stringify(data, null, 2) ?? String(data));

      setMensagens((prev) => [
        ...prev,
        {
          id: `${Date.now()}-ai`,
          role: "assistant",
          content: respostaTexto,
        },
      ]);
    } catch (err) {
      const msgErro = err instanceof Error ? err.message : "Erro ao falar com o assistente.";
      setMensagens((prev) => [
        ...prev,
        {
          id: `${Date.now()}-err`,
          role: "assistant",
          content: `Ops, tive um problema para falar com o servidor (${msgErro}). Verifique se a API está acessível em ${API_URL}.`,
        },
      ]);
    } finally {
      setEnviando(false);
    }
  }

  const sugestoesAtuais = perfil === "vendedor" ? SUGESTOES_VENDEDOR : SUGESTOES_CLIENTE;

  return (
    <div className="fixed bottom-5 right-5 z-50 font-sans">
      {aberto && (
        <section
          aria-label="Assistente VerdeMarket"
          className="mb-3 flex h-[500px] w-[360px] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl border border-[#1E5631]/15 bg-[#FCFBF8] text-[#1A2E22] shadow-2xl"
        >
          {/* Cabeçalho */}
          <div className="flex items-center justify-between border-b border-[#1E5631]/20 bg-[#1E5631] px-4 py-3">
            <div>
              <h2 className="text-sm font-semibold tracking-wide text-white">
                Assistente VerdeMarket
              </h2>
              <p className="text-[11px] text-white/75">Compras, vendas e catálogo</p>
            </div>
            <button
              type="button"
              onClick={() => setAberto(false)}
              aria-label="Fechar chat"
              className="rounded-lg px-2 py-1 text-xs text-white/75 transition hover:bg-white/15 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* Seletor de Perfil + Orçamento */}
          <div className="flex items-center gap-2 border-b border-[#1E5631]/10 bg-[#EFF5EE] px-3 py-2 text-xs">
            <div className="flex rounded-lg border border-[#1E5631]/15 bg-white/70 p-0.5">
              <button
                type="button"
                onClick={() => setPerfil("cliente")}
                className={`rounded-md px-2.5 py-1 font-medium transition ${
                  perfil === "cliente"
                    ? "border border-[#E07A22]/35 bg-[#E07A22]/15 text-[#7A3D0C]"
                    : "text-[#476653] hover:text-[#1E5631]"
                }`}
              >
                Cliente
              </button>
              <button
                type="button"
                onClick={() => setPerfil("vendedor")}
                className={`rounded-md px-2.5 py-1 font-medium transition ${
                  perfil === "vendedor"
                    ? "border border-[#E07A22]/35 bg-[#E07A22]/15 text-[#7A3D0C]"
                    : "text-[#476653] hover:text-[#1E5631]"
                }`}
              >
                Vendedor
              </button>
            </div>

            {perfil === "cliente" && (
              <input
                type="number"
                min="0"
                step="10"
                placeholder="Até R$"
                value={orcamento}
                onChange={(e) => setOrcamento(e.target.value)}
                title="Orçamento máximo (opcional)"
                className="ml-auto w-24 rounded-lg border border-[#1E5631]/15 bg-white px-2 py-1 text-xs text-[#1A2E22] placeholder:text-[#6B7F70] focus:border-[#3E8E41] focus:outline-none"
              />
            )}
          </div>

          {/* Mensagens */}
          <div ref={listaRef} className="flex-1 space-y-3 overflow-y-auto px-3.5 py-3 text-sm">
            {mensagens.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                    msg.role === "user"
                      ? "rounded-br-sm bg-[#1E5631] text-white"
                      : "rounded-bl-sm border border-[#1E5631]/10 bg-[#EFF5EE] text-[#1A2E22]"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {enviando && (
              <div className="flex justify-start">
                <div className="rounded-2xl border border-[#1E5631]/10 bg-[#EFF5EE] px-3.5 py-2 text-xs text-[#476653]">
                  Pensando...
                </div>
              </div>
            )}
          </div>

          {/* Sugestões rápidas */}
          <div className="flex flex-wrap gap-1.5 border-t border-[#1E5631]/10 bg-[#F7F3EA] px-3 py-2">
            {sugestoesAtuais.map((sug) => (
              <button
                key={sug.label}
                type="button"
                disabled={enviando}
                onClick={() => enviarMensagem(sug.texto)}
                className="rounded-full border border-[#1E5631]/15 bg-white px-2.5 py-1 text-[11px] font-medium text-[#365541] transition hover:border-[#E07A22]/50 hover:bg-[#E07A22]/10 hover:text-[#7A3D0C] disabled:opacity-40"
              >
                {sug.label}
              </button>
            ))}
          </div>

          {/* Campo de envio */}
          <form
            onSubmit={(e) => enviarMensagem(undefined, e)}
            className="flex items-center gap-2 border-t border-[#1E5631]/10 bg-[#FCFBF8] p-2.5"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                perfil === "cliente"
                  ? "Ex: quero algo sustentável até R$ 200..."
                  : "Ex: como precificar um item usado?"
              }
              disabled={enviando}
              className="flex-1 rounded-xl border border-[#1E5631]/15 bg-white px-3 py-2 text-xs text-[#1A2E22] placeholder:text-[#6B7F70] focus:border-[#3E8E41] focus:outline-none disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={enviando || !input.trim()}
              className="rounded-xl bg-[#1E5631] px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-[#2D6A3E] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Enviar
            </button>
          </form>
        </section>
      )}

      {/* Botão flutuante sempre visível */}
      <button
        type="button"
        onClick={() => setAberto((prev) => !prev)}
        className="ml-auto flex items-center gap-2 rounded-full border border-[#E07A22] bg-[#1E5631] px-4 py-3 text-xs font-semibold text-white shadow-xl transition hover:scale-[1.02] hover:bg-[#2D6A3E]"
      >
        <span>💬</span>
        <span>{aberto ? "Fechar IA" : "Falar com a IA"}</span>
      </button>
    </div>
  );
};

export default AssistenteChat;
