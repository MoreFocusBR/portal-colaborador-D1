import { pool } from '../index.js';
import { KeyResult, KRType, KRStatus } from '../types/okrTypes.js';
import { v4 as uuidv4 } from 'uuid'; // Assuming uuid is installed or will be

// Placeholder for data storage (e.g., in-memory, database interaction with ObjectiveModel)
// KRs are typically part of an Objective, so direct DB might not be needed if always accessed via Objective

export class KeyResultModel implements KeyResult {
  id: string;
  objectiveId: string;
  title: string;
  description?: string;
  responsible: string;
  type: KRType;
  targetValue: number;
  currentValue: number;
  unit?: string;
  status: KRStatus;
  startDate: Date;
  endDate: Date;
  confidenceLevel: number;
  notes?: string[];
  lastUpdated: Date;

  constructor(
    objectiveId: string,
    title: string,
    responsible: string,
    type: KRType,
    targetValue: number,
    startDate: Date,
    endDate: Date,
    confidenceLevel: number,
    description?: string,
    unit?: string,
    initialStatus: KRStatus = KRStatus.PLANNED,
    initialValue: number = 0
  ) {
    this.id = uuidv4();
    this.objectiveId = objectiveId;
    this.title = title;
    this.responsible = responsible;
    this.type = type;
    this.targetValue = targetValue;
    this.currentValue = initialValue;
    this.unit = unit;
    this.status = initialStatus;
    this.startDate = startDate;
    this.endDate = endDate;
    this.confidenceLevel = confidenceLevel;
    this.description = description;
    this.notes = [];
    this.lastUpdated = new Date();
  }

  updateProgress(currentValue: number, status?: KRStatus, confidenceLevel?: number): void {
    this.currentValue = currentValue;
    if (status) {
      this.status = status;
    }
    if (confidenceLevel !== undefined) {
      this.confidenceLevel = confidenceLevel;
    }
    this.lastUpdated = new Date();
    // Potentially trigger a recalculation in the parent ObjectiveModel here if tightly coupled
  }

  addNote(note: string): void {
    this.notes?.push(note);
    this.lastUpdated = new Date();
  }

  // Static methods for KR management would typically be part of ObjectiveModel
  // or a dedicated KR service if KRs can be managed independently (less common for OKR structure)
  // For example, creating a KR would usually involve adding it to an Objective.

  // Example: A static method to create a KR instance (not saving it, just creating the object)
  static async createNew(
    objectiveId: string,
    title: string,
    responsible: string,
    type: KRType,
    targetValue: number,
    startDate: Date,
    endDate: Date,
    confidenceLevel: number,
    description?: string,
    unit?: string,
    status: KRStatus = KRStatus.PLANNED,
    currentValue: number = 0
  ): Promise<KeyResult> {
    try {
      const result = await pool.query(
        `INSERT INTO key_results (
          id, objective_id, title, responsible, type, target_value, 
          current_value, start_date, end_date, confidence_level, 
          description, unit, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *`,
        [
          uuidv4(), objectiveId, title, responsible, type, targetValue,
          currentValue, startDate, endDate, confidenceLevel,
          description, unit, status
        ]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Erro ao criar key result:', error);
      throw error;
    }
  }

  static async update(id: string, data: Partial<KeyResult>): Promise<KeyResult | null> {
    const updateFields = Object.keys(data).map((key, index) => 
      `${key.toLowerCase()} = $${index + 1}`
    ).join(', ');
    
    try {
      const result = await pool.query(
        `UPDATE key_results 
         SET ${updateFields}, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $${Object.keys(data).length + 1}
         RETURNING *`,
        [...Object.values(data), id]
      );
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Erro ao atualizar key result:', error);
      throw error;
    }
  }
}

