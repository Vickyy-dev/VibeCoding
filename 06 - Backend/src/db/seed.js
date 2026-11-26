import dotenv from "dotenv";
import { pool } from "./connection.js";

dotenv.config();

const INITIAL_PRODUCTS = [
  {
    codigo: "PROD-001",
    nome: "Fone Bluetooth Recondicionado Studio",
    descricao: "Fone sem fio revisado, bateria testada e almofadas higienizadas.",
    categoria: "eletronicos",
    condicao: "usado",
    preco: 149.90,
    preco_original: 249.90,
    estoque: 6,
    imagem_url: "/assets/prod-headphones.jpg",
  },
  {
    codigo: "PROD-002",
    nome: "Teclado Mecânico Compacto Eco",
    descricao: "Teclado mecânico novo com switches táteis e estrutura durável.",
    categoria: "eletronicos",
    condicao: "novo",
    preco: 219.90,
    preco_original: 259.90,
    estoque: 10,
    imagem_url: "/assets/prod-keyboard.jpg",
  },
  {
    codigo: "PROD-003",
    nome: "Kit Café Especial & Prensa Francesa",
    descricao: "Café de origem sustentável com prensa francesa em vidro e aço.",
    categoria: "casa",
    condicao: "novo",
    preco: 89.90,
    preco_original: 109.90,
    estoque: 15,
    imagem_url: "/assets/prod-coffee.jpg",
  },
  {
    codigo: "PROD-004",
    nome: "Luminária de Mesa Vintage Restaurada",
    descricao: "Luminária metálica recuperada artesanalmente com soquete LED bivolt.",
    categoria: "casa",
    condicao: "usado",
    preco: 74.90,
    preco_original: 130.00,
    estoque: 4,
    imagem_url: "/assets/prod-lamp.jpg",
  },
  {
    codigo: "PROD-005",
    nome: "Tênis Urbano Solado Reciclado",
    descricao: "Tênis casual novo produzido com borracha reaproveitada.",
    categoria: "moda",
    condicao: "novo",
    preco: 189.90,
    preco_original: 229.90,
    estoque: 8,
    imagem_url: "/assets/prod-sneakers.jpg",
  },
  {
    codigo: "PROD-006",
    nome: "Mochila Notebook Lona Reaproveitada",
    descricao: "Mochila resistente para notebook até 15.6\" feita de lona reutilizada.",
    categoria: "acessorios",
    condicao: "usado",
    preco: 119.90,
    preco_original: 179.90,
    estoque: 5,
    imagem_url: "/assets/prod-backpack.jpg",
  },
  {
    codigo: "PROD-007",
    nome: "Blusa Básica ReUse de Algodão Reciclado",
    descricao:
      "Blusa usada em ótimo estado, confeccionada em tecido com fibras de algodão reciclado. Reaproveitar a peça e usar fibras recicladas ajuda a reduzir o consumo de matéria-prima virgem, embora toda produção tenha algum impacto ambiental.",
    categoria: "moda",
    condicao: "usado",
    preco: 89.90,
    preco_original: 129.90,
    estoque: 1,
    imagem_url: "/assets/prod-blusa-sustentavel.svg",
  },
  {
    codigo: "PROD-008",
    nome: "Short Casual de Sarja Leve Areia",
    descricao:
      "Short casual novo de sarja leve em tom areia, com cintura média e bolsos funcionais.",
    categoria: "moda",
    condicao: "novo",
    preco: 119.90,
    preco_original: 159.90,
    estoque: 8,
    imagem_url: "/assets/prod-short-casual.svg",
  },
];

async function runSeed() {
  const conn = await pool.getConnection();
  try {
    await conn.query(`
      CREATE TABLE IF NOT EXISTS clientes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(120) NOT NULL,
        email VARCHAR(160) NOT NULL UNIQUE,
        senha_hash VARCHAR(255) NOT NULL,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS produtos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        codigo VARCHAR(50) NOT NULL UNIQUE,
        nome VARCHAR(150) NOT NULL,
        descricao TEXT,
        categoria VARCHAR(50) NOT NULL,
        condicao ENUM('novo', 'usado') NOT NULL DEFAULT 'novo',
        preco DECIMAL(10,2) NOT NULL,
        preco_original DECIMAL(10,2),
        estoque INT NOT NULL DEFAULT 0,
        imagem_url VARCHAR(255),
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS vendas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        cliente_id INT NULL,
        subtotal DECIMAL(10,2) NOT NULL,
        frete DECIMAL(10,2) NOT NULL DEFAULT 0,
        desconto_pix DECIMAL(10,2) NOT NULL DEFAULT 0,
        valor_total DECIMAL(10,2) NOT NULL,
        valor_pago DECIMAL(10,2) NOT NULL,
        troco DECIMAL(10,2) NOT NULL DEFAULT 0,
        forma_pagamento ENUM('pix', 'card', 'boleto') NOT NULL,
        data_venda TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_vendas_cliente FOREIGN KEY (cliente_id) REFERENCES clientes(id)
      )
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS itens_venda (
        id INT AUTO_INCREMENT PRIMARY KEY,
        venda_id INT NOT NULL,
        produto_id INT NOT NULL,
        quantidade INT NOT NULL,
        preco_unitario DECIMAL(10,2) NOT NULL,
        CONSTRAINT fk_itens_venda FOREIGN KEY (venda_id) REFERENCES vendas(id),
        CONSTRAINT fk_itens_produto FOREIGN KEY (produto_id) REFERENCES produtos(id)
      )
    `);

    for (const p of INITIAL_PRODUCTS) {
      await conn.query(
        `INSERT IGNORE INTO produtos
          (codigo, nome, descricao, categoria, condicao, preco, preco_original, estoque, imagem_url)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          p.codigo,
          p.nome,
          p.descricao,
          p.categoria,
          p.condicao,
          p.preco,
          p.preco_original,
          p.estoque,
          p.imagem_url,
        ]
      );
    }

    console.log("Seed concluído: tabelas verificadas e produtos iniciais inseridos.");
  } finally {
    conn.release();
    await pool.end();
  }
}

runSeed().catch((err) => {
  console.error("Erro ao executar seed:", err.message);
  process.exit(1);
});
