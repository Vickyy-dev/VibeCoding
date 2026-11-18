# Contexto do Projeto — Sistema PDV (Vibe Coding)

## Visão Geral
Sistema web de Ponto de Venda (PDV) e controle de estoque voltado para pequenos comércios (mercearias, lanchonetes, lojas de bairro). O foco é agilidade no caixa, simplicidade de uso e controle básico de vendas e estoque.

## Estrutura de Pastas
- `01 - Requisitos`: Documentação de requisitos (RF/RNF), regras de negócio e diagramas.
- `02 - mockup`: Wireframes e rascunhos visuais das telas.
- `03 - Designer System`: Paleta de cores, tipografia e padrões de componentes.
- `04 - Prompt`: Histórico dos melhores prompts utilizados no desenvolvimento com IA.
- `05 - Frontend`: Código da interface web (HTML, CSS, JavaScript / React).
- `06 - Backend`: API, regras de negócio e banco de dados (Node.js, Express, SQLite/MySQL).
- `07 - Testes`: Relatórios de QA, bugs identificados e métricas de desenvolvimento.

## Regras de Negócio Principais (MVP)
1. **Cadastro de Produtos:** Todo produto deve ter código/ID, nome, preço de venda e quantidade atual em estoque.
2. **Frente de Caixa (PDV):** Permitir adicionar produtos ao carrinho, calcular o subtotal automaticamente, informar valor recebido e calcular o troco.
3. **Baixa Automática de Estoque:** Ao finalizar uma venda, a quantidade vendida de cada item deve ser subtraída imediatamente do estoque.
4. **Validação de Estoque:** O sistema não deve permitir finalizar a venda de um produto se a quantidade solicitada for maior que o estoque disponível.
5. **Histórico de Vendas:** Registrar data/hora, itens vendidos, valor total e forma de pagamento (Dinheiro, Pix, Cartão).

## Diretrizes para a IA
- Gerar código limpo, modular e bem comentado.
- Manter a interface responsiva, intuitiva e com alto contraste para facilitar a operação rápida no caixa.
- Sempre respeitar a separação de pastas (`05 - Frontend` para interface e `06 - Backend` para servidor/banco).