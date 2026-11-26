# Registro de Bugs e Divergências Técnicas — Vibe Coding

**Responsável (QA):** Guilherme Pacífico (`feat/qa-testes`)  
**Escopo Auditado:** `05 - Frontend` (Lovable / React + TS) ↔ `06 - Backend` (Node.js + Express)  

---

## Log de Defeitos Encontrados e Resolvidos

| ID | Severidade | Requisito Afetado | Localização no Código | Descrição do Problema | Causa Raiz (Contexto IA / Vibe Coding) | Solução Aplicada / Recomendação | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **BUG-01** | **Alta** | **RF05 / RNF03** | `06 - Backend/src/routes/` vs `05 - Frontend/src/lib/checkout.ts` | A finalização do pedido ocorria apenas no estado local do Frontend (`checkout.ts`), sem persistir a venda nem dar baixa real no banco via API. | O Frontend foi gerado no Lovable com dados locais (`src/data/products.ts`), enquanto o Backend possuía apenas `produtos.js` e `assistente.js` sem endpoint de finalização de venda. | Integração do fluxo de checkout com atualização de estoque no Backend para garantir persistência real (**RNF03**). | **Resolvido** |
| **BUG-02** | **Alta** | **RF06** | `05 - Frontend/src/lib/cart-context.tsx` e `CartDrawer.tsx` | O carrinho permitia incrementar a quantidade de um item além do saldo disponível em estoque antes de finalizar a compra. | A IA gerou a função de incremento (`+1`) no `cart-context.tsx` sem comparar com o limite `stock` do produto. | Adicionada trava condicional impedindo adicionar quantidade superior ao estoque atual do item. | **Resolvido** |
| **BUG-03** | **Média** | **RNF01** | `01 - Requisitos/requisitos.md` (Seção 5) | Diagrama Mermaid do documento de requisitos não renderizava o bloco `## 6. Modelo de Banco de Dados` corretamente no preview do GitHub. | Ausência de fechamento de bloco de código (` ``` `) antes do título da Seção 6 na geração do Markdown. | Fechamento explícito do bloco `mermaid` para exibição correta do DER (`modelo-banco-pdv.png`). | **Resolvido** |
| **BUG-04** | **Média** | **RF04** | `05 - Frontend/src/routes/checkout.tsx` | Soma de itens com valores decimais gerava dízimas em ponto flutuante (ex: `19.900000000000002`) e faltava cálculo explícito de troco para pagamento em dinheiro. | A geração inicial focou em fluxo de e-commerce/vitrine (Cartão/Pix), omitindo o cálculo de troco exigido pelo **RF04** de frente de caixa. | Implementado campo de valor recebido em dinheiro com cálculo automático de troco e formatação `Intl.NumberFormat('pt-BR')`. | **Resolvido** |
| **BUG-05** | **Baixa** | **RNF02** | `06 - Backend/src/server.js` | Bloqueio de requisição (`CORS`) ao conectar o servidor Vite do Frontend (`localhost:5173` / `8080`) com a API Express. | Configuração inicial do Express sem liberar a origem da porta utilizada pelo ambiente Vite/Bun do Frontend. | Ajuste nas permissões de `cors()` em `server.js` para aceitar as requisições do Frontend local. | **Resolvido** |