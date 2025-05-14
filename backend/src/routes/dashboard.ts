import express from 'express';
import { pool } from '../index';

const router = express.Router();

// Endpoint: /dashboard/total-vendas
router.get('/total-vendas', async (req, res) => {
  try {
    const { dataInicio, dataFim, canal, status } = req.query;
    if (!dataInicio || !dataFim) {
      return res.status(400).json({ error: 'dataInicio e dataFim são obrigatórios' });
    }
    const query = `
      SELECT
        SUM(CASE
          WHEN "OrigemPedido" = 'Comercial' THEN "ValorTotal"
          WHEN "NotaFiscalNumero" > 0 AND "OrigemPedido" IN ('FULL_CFOP_5905', 'Mercado Livre', 'SHOPIFY', 'Shopify Manual', 'AMAZON') THEN "ValorTotal"
          ELSE 0
        END) AS total_vendas,
        COUNT(*) AS num_pedidos
      FROM "Venda"
      WHERE "DataVenda" BETWEEN $1 AND $2
        AND ($3::text IS NULL OR "OrigemPedido" = $3)
        AND ($4::text IS NULL OR "DescricaoStatus" = $4)
    `;
    const values = [dataInicio, dataFim, canal || null, status || null];
    const result = await pool.query(query, values);
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar total de vendas' });
  }
});

// Endpoint: /dashboard/vendas-dia
router.get('/vendas-dia', async (req, res) => {
  try {
    const { canal, status } = req.query;
    const query = `
      SELECT
        SUM("ValorTotal") AS vendas_dia
      FROM "Venda"
      WHERE "DataVenda" = CURRENT_DATE
        AND ($1::text IS NULL OR "OrigemPedido" = $1)
        AND ($2::text IS NULL OR "DescricaoStatus" = $2)
    `;
    const values = [canal || null, status || null];
    const result = await pool.query(query, values);
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar vendas do dia' });
  }
});

// Endpoint: /dashboard/vendas-canais
router.get('/vendas-canais', async (req, res) => {
  try {
    const { dataInicio, dataFim, status } = req.query;
    if (!dataInicio || !dataFim) {
      return res.status(400).json({ error: 'dataInicio e dataFim são obrigatórios' });
    }
    const query = `
      SELECT
        "OrigemPedido",
        SUM("ValorTotal") AS total
      FROM "Venda"
      WHERE "DataVenda" BETWEEN $1 AND $2
        AND ($3::text IS NULL OR "DescricaoStatus" = $3)
      GROUP BY "OrigemPedido"
    `;
    const values = [dataInicio, dataFim, status || null];
    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar vendas por canal' });
  }
});

// Endpoint: /dashboard/ranking-venda
router.get('/ranking-venda', async (req, res) => {
  try {
    const { dataInicio, dataFim, canal, status } = req.query;
    if (!dataInicio || !dataFim) {
      return res.status(400).json({ error: 'dataInicio e dataFim são obrigatórios' });
    }
    const query = `
      SELECT
        i."DescricaoProduto",
        ROUND(percentile_cont(0.5) WITHIN GROUP (ORDER BY i."PrecoUnitarioVenda") * SUM(i."Quantidade")) AS valor
      FROM "ItensVenda" i
      JOIN "Venda" v ON v."Codigo" = i."CodigoVenda"
      WHERE v."DataVenda" BETWEEN $1 AND $2
        AND ($3::text IS NULL OR v."OrigemPedido" = $3)
        AND ($4::text IS NULL OR v."DescricaoStatus" = $4)
      GROUP BY i."DescricaoProduto"
      ORDER BY valor DESC
      LIMIT 20
    `;
    const values = [dataInicio, dataFim, canal || null, status || null];
    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar ranking de venda' });
  }
});

// Endpoint: /dashboard/ranking-lucratividade
router.get('/ranking-lucratividade', async (req, res) => {
  try {
    const { dataInicio, dataFim, canal, status } = req.query;
    if (!dataInicio || !dataFim) {
      return res.status(400).json({ error: 'dataInicio e dataFim são obrigatórios' });
    }
    const query = `
      SELECT
        i."DescricaoProduto",
        ROUND((percentile_cont(0.5) WITHIN GROUP (ORDER BY i."PrecoUnitarioVenda") - percentile_cont(0.5) WITHIN GROUP (ORDER BY i."PrecoUnitarioCusto")) * SUM(i."Quantidade")) AS lucro
      FROM "ItensVenda" i
      JOIN "Venda" v ON v."Codigo" = i."CodigoVenda"
      WHERE v."DataVenda" BETWEEN $1 AND $2
        AND ($3::text IS NULL OR v."OrigemPedido" = $3)
        AND ($4::text IS NULL OR v."DescricaoStatus" = $4)
      GROUP BY i."DescricaoProduto"
      ORDER BY lucro DESC
      LIMIT 20
    `;
    const values = [dataInicio, dataFim, canal || null, status || null];
    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar ranking de lucratividade' });
  }
});

// Endpoint: /dashboard/pedidos-por-uf
router.get('/pedidos-por-uf', async (req, res) => {
  try {
    const { dataInicio, dataFim, canal, status } = req.query;
    if (!dataInicio || !dataFim) {
      return res.status(400).json({ error: 'dataInicio e dataFim são obrigatórios' });
    }
    const query = `
      SELECT
        "EntregaUnidadeFederativa" AS uf,
        COUNT(*) AS num_pedidos
      FROM "Venda"
      WHERE "DataVenda" BETWEEN $1 AND $2
        AND ($3::text IS NULL OR "OrigemPedido" = $3)
        AND ($4::text IS NULL OR "DescricaoStatus" = $4)
      GROUP BY "EntregaUnidadeFederativa"
      ORDER BY num_pedidos DESC
    `;
    const values = [dataInicio, dataFim, canal || null, status || null];
    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar pedidos por UF' });
  }
});

// Endpoint: /dashboard/serie-temporal
router.get('/serie-temporal', async (req, res) => {
  try {
    const { dataInicio, dataFim, canal, status } = req.query;
    if (!dataInicio || !dataFim) {
      return res.status(400).json({ error: 'dataInicio e dataFim são obrigatórios' });
    }
    const query = `
      SELECT
        DATE_TRUNC('month', "DataVenda") AS mes,
        SUM(CASE
          WHEN "OrigemPedido" = 'Comercial' THEN "ValorTotal"
          WHEN "NotaFiscalNumero" > 0 AND "OrigemPedido" IN ('FULL_CFOP_5905', 'Mercado Livre', 'SHOPIFY', 'Shopify Manual', 'AMAZON') THEN "ValorTotal"
          ELSE 0
        END) AS total_vendas,
        COUNT(*) AS num_pedidos
      FROM "Venda"
      WHERE "DataVenda" BETWEEN $1 AND $2
        AND ($3::text IS NULL OR "OrigemPedido" = $3)
        AND ($4::text IS NULL OR "DescricaoStatus" = $4)
      GROUP BY mes
      ORDER BY mes
    `;
    const values = [dataInicio, dataFim, canal || null, status || null];
    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar série temporal' });
  }
});

export default router; 