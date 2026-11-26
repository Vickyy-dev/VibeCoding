# Métricas de Desenvolvimento e Qualidade — Projeto Vibe Coding

**Responsável:** Guilherme Pacífico (`feat/qa-testes`)  
**Ferramentas Avaliadas:** Lovable (Geração UI/React/TS), LLMs de Apoio (Backend Node/Express e Documentação), Git/GitHub  

---

## 1. Indicadores de Engenharia com IA

* **Cobertura de Requisitos Funcionais (`RF01` a `RF06`):** **100%** dos requisitos mapeados no documento da Talita possuem casos de teste vinculados (`CT-01` a `CT-06`).
* **Cobertura de Requisitos Não Funcionais (`RNF01` a `RNF04`):** **100%** validados (`CT-07` e auditoria de arquitetura).
* **Assertividade na 1ª Geração (Zero-Shot / One-Shot):** **~75%** da camada visual (`05 - Frontend`, componentes Shadcn/UI, rotas TanStack e `AssistenteChat`) foi gerada funcionalmente logo nos primeiros prompts no Lovable.
* **Índice de Retrabalho (Integração & Regras de Negócio):** **~25%** do tempo total foi investido na conexão entre Frontend e Backend (substituindo dados mockados de `src/data/products.ts` pelas chamadas reais à API) e na implementação de travas de estoque (`RF06`) e cálculo de troco (`RF04`).
* **Tempo Médio de Resolução de Bugs (MTTR):** **15 minutos** por ocorrência, utilizando inspeção de rede (DevTools) e logs do terminal Node.js para prompts de correção direcionados.

---

## 2. Comparativo de Produtividade: Tradicional vs. Vibe Coding

| Frente / Branch | Responsável(is) | Estimativa Tradicional | Tempo Real (Vibe Coding) | Redução de Esforço |
| :--- | :--- | :---: | :---: | :---: |
| Requisitos, DER (`dbml`) e Arquitetura (`feat/requisitos`) | Talita (Vicky) | 6h | 2,0h | **-67%** |
| UI/UX, Design System e Protótipo (`feat/design`) | Nicolas e Iury | 8h | 2,5h | **-69%** |
| Frontend React/TS + Prompts Lovable (`feat/frontend`) | Carlos | 16h | 4,0h | **-75%** |
| Backend Express, Seed e Assistente (`feat/backend`) | Gabriel e Talita | 12h | 4,0h | **-67%** |
| Testes (QA), Auditoria de Requisitos e Git (`feat/qa-testes`) | Guilherme Pacífico | 6h | 3,0h | **-50%** |
| **Total Consolidado do MVP** | **Equipe Completa** | **48h** | **15,5h** | **~68% mais rápido** |

---

## 3. Conclusão Técnica de QA
O desenvolvimento assistido por IA (*Vibe Coding*) acelerou em **68%** a entrega do MVP, com destaque para a velocidade de prototipação da interface via Lovable. Contudo, a auditoria de QA demonstrou que ferramentas geradoras de UI tendem a criar fluxos desacoplados do banco de dados (usando mocks locais) e a omitir regras críticas de domínio comercial — como bloqueio de estoque negativo (**RF06**) e cálculo de troco (**RF04**). A atuação de testes garantiu o alinhamento real entre o código gerado e os requisitos especificados.