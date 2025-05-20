// /home/ubuntu/admin_project/d1-admin-main/backend/src/models/ObjectiveModel.ts
import { Objective, KeyResult, KRType, KRStatus } from '../types/okrTypes.js';
import { v4 as uuidv4 } from 'uuid'; // Assuming uuid is installed or will be
import { pool } from '../index.js';

// Placeholder for data storage (e.g., in-memory, database interaction)
const objectivesDB: Objective[] = [];

export class ObjectiveModel implements Objective {
  id: string;
  title: string;
  description?: string;
  responsible: string;
  keyResults: KeyResult[];
  overallProgress?: number;
  netConfidenceScore?: number;
  quarter: string;
  ownerId?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;

  constructor(
    title: string,
    responsible: string,
    quarter: string,
    description?: string,
    ownerId?: string,
    tags?: string[]
  ) {
    this.id = uuidv4();
    this.title = title;
    this.responsible = responsible;
    this.quarter = quarter;
    this.description = description;
    this.ownerId = ownerId;
    this.tags = tags || [];
    this.keyResults = [];
    this.createdAt = new Date();
    this.updatedAt = new Date();
    // Initial calculation for progress and NCS might be needed or done separately
    this.calculateMetrics();
  }

  // Example method to add a key result
  addKeyResult(kr: KeyResult): void {
    this.keyResults.push(kr);
    this.updatedAt = new Date();
    this.calculateMetrics();
  }

  // Example method to update a key result
  updateKeyResult(updatedKr: KeyResult): void {
    const index = this.keyResults.findIndex(kr => kr.id === updatedKr.id);
    if (index !== -1) {
      this.keyResults[index] = updatedKr;
      this.updatedAt = new Date();
      this.calculateMetrics();
    }
  }

  // Example method to remove a key result
  removeKeyResult(krId: string): void {
    this.keyResults = this.keyResults.filter(kr => kr.id !== krId);
    this.updatedAt = new Date();
    this.calculateMetrics();
  }

  // Placeholder for metric calculation
  calculateMetrics(): void {
    if (this.keyResults.length === 0) {
      this.overallProgress = 0;
      this.netConfidenceScore = 0;
      return;
    }

    let totalProgress = 0;
    let totalConfidence = 0;
    // Assuming simple average for now, can be weighted based on KR importance later
    this.keyResults.forEach(kr => {
      // Progress calculation depends on KRType
      let krProgress = 0;
      if (kr.type === KRType.BOOLEAN) {
        krProgress = (kr.currentValue ?? 0) >= (kr.targetValue ?? 0) ? 100 : 0; // 1 for true, 0 for false if target is 1
      } else if (kr.targetValue > 0) {
        krProgress = ((kr.currentValue ?? 0) / (kr.targetValue ?? 1)) * 100;
      }
      totalProgress += Math.min(Math.max(krProgress, 0), 100); // Cap progress at 0-100
      totalConfidence += kr.confidenceLevel;
    });

    this.overallProgress = totalProgress / this.keyResults.length;
    this.netConfidenceScore = totalConfidence / this.keyResults.length;
  }

  

  static async create(data: Partial<Objective>): Promise<Objective> {
    const { title, responsible, quarter, description, ownerId, tags } = data;
    
    try {
      const result = await pool.query(
        `INSERT INTO objectives (id, title, responsible, quarter, description, owner_id, tags)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [uuidv4(), title, responsible, quarter, description, ownerId, tags]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Erro ao criar objetivo:', error);
      throw error;
    }
  }

  static async findById(id: string): Promise<Objective | null> {
    try {
      const objectiveResult = await pool.query(
        'SELECT * FROM objectives WHERE id = $1',
        [id]
      );

      if (objectiveResult.rows.length === 0) {
        return null;
      }

      const keyResultsResult = await pool.query(
        'SELECT * FROM key_results WHERE objective_id = $1',
        [id]
      );

      const objective = objectiveResult.rows[0];
      objective.keyResults = keyResultsResult.rows;

      return objective;
    } catch (error) {
      console.error('Erro ao buscar objetivo:', error);
      throw error;
    }
  }

  static async findAll(): Promise<Objective[]> {
    try {
      const result = await pool.query(`
        SELECT o.*, 
               json_agg(kr.*) as key_results
        FROM objectives o
        LEFT JOIN key_results kr ON kr.objective_id = o.id
        GROUP BY o.id
        ORDER BY o.created_at DESC
      `);
      return result.rows.map(row => ({
        ...row,
        keyResults: row.key_results[0] ? row.key_results : []
      }));
    } catch (error) {
      console.error('Erro ao listar objetivos:', error);
      throw error;
    }
  }

  static async update(id: string, data: Partial<Objective>): Promise<Objective | null> {
    const updateFields = Object.keys(data).map((key, index) => 
      `${key.toLowerCase()} = $${index + 1}`
    ).join(', ');
    
    try {
      const result = await pool.query(
        `UPDATE objectives 
         SET ${updateFields}, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $${Object.keys(data).length + 1}
         RETURNING *`,
        [...Object.values(data), id]
      );
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Erro ao atualizar objetivo:', error);
      throw error;
    }
  }

  static async delete(id: string): Promise<boolean> {
    try {
      const result = await pool.query(
        'DELETE FROM objectives WHERE id = $1',
        [id]
      );
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.error('Erro ao deletar objetivo:', error);
      throw error;
    }
  }

  // Método para calcular métricas
  static async calculateMetrics(objectiveId: string): Promise<void> {
    try {
      const result = await pool.query(`
        WITH kr_metrics AS (
          SELECT 
            objective_id,
            AVG(CASE 
              WHEN type = 'binary' THEN 
                CASE WHEN current_value >= target_value THEN 100 ELSE 0 END
              ELSE 
                LEAST(GREATEST((current_value / NULLIF(target_value, 0)) * 100, 0), 100)
            END) as overall_progress,
            AVG(confidence_level) as net_confidence_score
          FROM key_results
          WHERE objective_id = $1
          GROUP BY objective_id
        )
        UPDATE objectives o
        SET 
          overall_progress = kr.overall_progress,
          net_confidence_score = kr.net_confidence_score,
          updated_at = CURRENT_TIMESTAMP
        FROM kr_metrics kr
        WHERE o.id = kr.objective_id
      `, [objectiveId]);
    } catch (error) {
      console.error('Erro ao calcular métricas:', error);
      throw error;
    }
  }

  static async addKeyResult(objectiveId: string, keyResult: KeyResult): Promise<boolean> {
    try {
      await pool.query(
        'UPDATE objectives SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
        [objectiveId]
      );
      await this.calculateMetrics(objectiveId);
      return true;
    } catch (error) {
      console.error('Erro ao adicionar key result:', error);
      throw error;
    }
  }

  static async removeKeyResult(objectiveId: string, krId: string): Promise<boolean> {
    try {
      const result = await pool.query(
        'DELETE FROM key_results WHERE id = $1 AND objective_id = $2',
        [krId, objectiveId]
      );
      if ((result.rowCount ?? 0) > 0) {
        await this.calculateMetrics(objectiveId);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao remover key result:', error);
      throw error;
    }
  }
}

