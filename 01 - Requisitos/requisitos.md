# Documento de Requisitos — Sistema PDV (MVP)

## 1. Visão Geral do Projeto
O sistema é um **Ponto de Venda (PDV) web e controle de estoque** focado na agilidade de atendimento e simplicidade para pequenos comércios (como mercearias e lojas de bairro). O objetivo é substituir o controle manual em papel ("caderninho") por uma ferramenta digital rápida, intuitiva e funcional.

## 2. Público-Alvo / Personas
- **Operador de Caixa / Vendedor:** Precisa registrar vendas rapidamente, consultar preços sem esforço e calcular trocos sem erros.
- **Administrador / Dono do Comércio:** Precisa cadastrar novos produtos, monitorar o estoque atual e acompanhar o resumo das vendas do dia.

## 3. Requisitos Funcionais (RF)
- **RF01 - Cadastro de Produtos:** O sistema deve permitir ao administrador cadastrar, editar e remover produtos informando código, nome, preço e quantidade em estoque.
- **RF02 - Consulta de Estoque:** O sistema deve exibir a listagem atualizada de produtos disponíveis e seus respetivos estoques em tempo real.
- **RF03 - Frente de Caixa (PDV):** O operador deve conseguir adicionar produtos ao carrinho digitando ou selecionando o item, informando a quantidade desejada.
- **RF04 - Cálculo de Pagamento e Troco:** O sistema deve calcular automaticamente o valor total da venda, permitir selecionar a forma de pagamento (Dinheiro, Pix, Cartão) e calcular o troco quando necessário.
- **RF05 - Baixa Automática de Estoque:** Ao finalizar uma venda, o sistema deve descontar imediatamente a quantidade vendida do estoque geral.
- **RF06 - Validação de Estoque Insuficiente:** O sistema deve bloquear a venda caso a quantidade solicitada de um produto seja maior do que a disponível em estoque.

## 4. Requisitos Não Funcionais (RNF)
- **RNF01 - Usabilidade:** A interface do frente de caixa deve ser limpa, responsiva e de fácil operação para minimizar o tempo de atendimento.
- **RNF02 - Desempenho:** O registro de vendas e a atualização do estoque devem ocorrer de forma instantânea (sem travamentos).
- **RNF03 - Persistência de Dados:** As informações de produtos e vendas devem ser armazenadas de forma segura em base de dados relacional.
- **RNF04 - Tecnologias do MVP:** Desenvolvido em arquitetura web moderna utilizando Node.js, Express e JavaScript/React, integrando ferramentas de IA no processo de desenvolvimento (*Vibe Coding*).

## 5. Diagrama de Casos de Uso (Estrutura Básica)
```mermaid
graph TD
    A[Administrador] -->|Cadastra Produtos| C[(Banco de Dados / Estoque)]
    A -->|Monitora Estoque| C
    B[Operador de Caixa] -->|Consulta Preços| C
    B -->|Registra Venda / PDV| C
    B -->|Gera Baixa no Estoque| C