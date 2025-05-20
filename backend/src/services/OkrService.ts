// /home/ubuntu/admin_project/d1-admin-main/backend/src/services/OkrService.ts
import { ObjectiveModel } from "../models/ObjectiveModel.js";
import { KeyResultModel } from "../models/KeyResultModel.js";
import { Objective, KeyResult, KRType, KRStatus, OkrOverviewMetrics } from "../types/okrTypes.js";

// Placeholder for user roles and permissions check
const checkUserPermission = (userId: string, action: string, resourceId?: string): boolean => {
  // In a real app, this would involve checking user roles and permissions against the action and resource
  // For now, let's assume admin has all permissions, and others might have limited access.
  // This needs to be fleshed out based on the defined roles (Administradores, Líderes, Colaboradores)
  console.log(`Checking permission for user ${userId} to ${action} on resource ${resourceId || 'general'}`);
  return true; // Defaulting to true for now
};

export class OkrService {
  // --- Objective Methods ---
  async createObjective(
    userId: string,
    data: { title: string; responsible: string; quarter: string; description?: string; ownerId?: string; tags?: string[] }
  ): Promise<Objective | null> {
    if (!checkUserPermission(userId, "createObjective")) {
      throw new Error("Permission denied to create objective.");
    }
    return ObjectiveModel.create(data);
  }

  async getObjectiveById(userId: string, objectiveId: string): Promise<Objective | null> {
    if (!checkUserPermission(userId, "getObjective", objectiveId)) {
      // Potentially allow broader read access based on roles
    }
    const objective = await ObjectiveModel.findById(objectiveId);
    return objective || null;
  }

  async getAllObjectives(userId: string, quarter?: string): Promise<Objective[]> {
    if (!checkUserPermission(userId, "getAllObjectives")) {
      // Filter based on user's team/department or if they are admin
    }
    let objectives = await ObjectiveModel.findAll();
    if (quarter) {
      objectives = objectives.filter(obj => obj.quarter === quarter);
    }
    // Further filtering based on user permissions might be needed here
    return objectives;
  }

  async updateObjective(
    userId: string,
    objectiveId: string,
    data: Partial<Omit<Objective, "id" | "keyResults" | "createdAt" | "updatedAt">>
  ): Promise<Objective | null> {
    const objective = await ObjectiveModel.findById(objectiveId);
    if (!objective) return null;
    if (!checkUserPermission(userId, "updateObjective", objectiveId)) {
      // Check if user is owner or admin
      throw new Error("Permission denied to update objective.");
    }
    const updatedObjective = await ObjectiveModel.update(objectiveId, data);
    return updatedObjective || null;
  }

  async deleteObjective(userId: string, objectiveId: string): Promise<boolean> {
    const objective = await ObjectiveModel.findById(objectiveId);
    if (!objective) return false;
    if (!checkUserPermission(userId, "deleteObjective", objectiveId)) {
      // Check if user is owner or admin
      throw new Error("Permission denied to delete objective.");
    }
    return ObjectiveModel.delete(objectiveId);
  }

  // --- Key Result Methods ---
  async addKeyResult(
    userId: string,
    objectiveId: string,
    krData: Omit<KeyResult, "id" | "objectiveId" | "lastUpdated" | "notes">
  ): Promise<Objective | null> {
    const objective = await ObjectiveModel.findById(objectiveId);
    if (!objective) {
      throw new Error("Objective not found");
    }
    if (!checkUserPermission(userId, "addKeyResult", objectiveId)) {
      throw new Error("Permission denied to add key result to this objective.");
    }

    const newKr = await KeyResultModel.createNew(
      objectiveId,
      krData.title,
      krData.responsible,
      krData.type,
      krData.targetValue,
      krData.startDate,
      krData.endDate,
      krData.confidenceLevel,
      krData.description,
      krData.unit,
      krData.status,
      krData.currentValue
    );

    await ObjectiveModel.addKeyResult(objectiveId, newKr);
    return ObjectiveModel.findById(objectiveId);
  }

  async updateKeyResult(
    userId: string,
    objectiveId: string,
    krId: string,
    krUpdateData: Partial<Omit<KeyResult, "id" | "objectiveId">>
  ): Promise<Objective | null> {
    const objective = await ObjectiveModel.findById(objectiveId);
    if (!objective) {
      throw new Error("Objective not found");
    }
    if (!objective.keyResults) {
      throw new Error("No key results found for this objective");
    }
    const krIndex = objective.keyResults.findIndex(kr => kr.id === krId);
    if (krIndex === -1) {
      throw new Error("Key Result not found");
    }

    // Permission check: User might be responsible for the KR or an admin/leader
    const krToUpdate = objective.keyResults[krIndex];
    if (!checkUserPermission(userId, "updateKeyResult", objectiveId) && userId !== krToUpdate.responsible) {
      throw new Error("Permission denied to update this key result.");
    }

    // Update specific fields of the KeyResult
    Object.assign(objective.keyResults[krIndex], krUpdateData, { lastUpdated: new Date() });
    // Persist KR update in DB
    await KeyResultModel.update(krId, { ...krUpdateData, lastUpdated: new Date() });
    // Optionally, recalculate metrics for the objective
    await ObjectiveModel.update(objectiveId, { keyResults: objective.keyResults });
    return await ObjectiveModel.findById(objectiveId);
  }

  async removeKeyResult(userId: string, objectiveId: string, krId: string): Promise<Objective | null> {
    const objective = await ObjectiveModel.findById(objectiveId);
    if (!objective) {
      throw new Error("Objective not found");
    }
    if (!checkUserPermission(userId, "removeKeyResult", objectiveId)) {
      throw new Error("Permission denied to remove key result from this objective.");
    }
    // Remove KR from DB
    await ObjectiveModel.removeKeyResult(objectiveId, krId);
    return await ObjectiveModel.findById(objectiveId);
  }

  async addNoteToKeyResult(
    userId: string,
    objectiveId: string,
    krId: string,
    note: string
  ): Promise<KeyResult | null> {
    const objective = await ObjectiveModel.findById(objectiveId);
    if (!objective || !objective.keyResults) return null;

    const kr = objective.keyResults.find(k => k.id === krId);
    if (!kr) return null;

    if (!checkUserPermission(userId, "addNoteToKeyResult", objectiveId)) {
        throw new Error("Permission denied to add note to this key result.");
    }

    if (!kr.notes) {
        kr.notes = [];
    }
    kr.notes.push(note);
    kr.lastUpdated = new Date();
    await KeyResultModel.update(krId, { notes: kr.notes, lastUpdated: kr.lastUpdated });
    await ObjectiveModel.update(objectiveId, { keyResults: objective.keyResults });
    return kr;
  }

  // --- Metrics Calculation ---
  // Based on user requirements for OVERVIEW section
  async getOkrOverviewMetrics(userId: string, quarter: string): Promise<OkrOverviewMetrics> {
    if (!checkUserPermission(userId, "getOkrOverview")) {
        // Permissions might depend on what data is being aggregated
    }
    const objectives = await this.getAllObjectives(userId, quarter);
    if (!objectives || objectives.length === 0) {
      return {
        daysLeft: this.calculateDaysLeftInQuarter(quarter),
        overallProgress: 0,
        tasksCompleted: 0,
        totalTasks: 0,
        netConfidenceScore: 0,
      };
    }

    let totalOverallProgress = 0;
    let totalConfidenceScore = 0;
    let completedKRs = 0;
    let totalKRs = 0;

    objectives.forEach(obj => {
      // obj.calculateMetrics(); // Ensure metrics are up-to-date (REMOVED - metrics are calculated in ObjectiveModel)
      totalOverallProgress += obj.overallProgress || 0;
      totalConfidenceScore += obj.netConfidenceScore || 0;
      (obj.keyResults || []).forEach(kr => {
        totalKRs++;
        if (kr.status === KRStatus.COMPLETED) {
          completedKRs++;
        }
      });
    });

    return {
      daysLeft: this.calculateDaysLeftInQuarter(quarter),
      overallProgress: objectives.length > 0 ? totalOverallProgress / objectives.length : 0,
      tasksCompleted: completedKRs,
      totalTasks: totalKRs,
      netConfidenceScore: objectives.length > 0 ? totalConfidenceScore / objectives.length : 0,
    };
  }

  private calculateDaysLeftInQuarter(quarterString: string): number {
    // e.g., quarterString = "Q3 2024"
    const [quarterPart, yearPart] = quarterString.split(" ");
    const year = parseInt(yearPart);
    let monthEnd = 0;

    switch (quarterPart) {
      case "Q1": monthEnd = 3; break; // March
      case "Q2": monthEnd = 6; break; // June
      case "Q3": monthEnd = 9; break; // September
      case "Q4": monthEnd = 12; break; // December
      default: return 0; // Invalid quarter
    }

    const today = new Date();
    // Last day of the quarter month
    const endDateOfQuarter = new Date(year, monthEnd, 0); // Day 0 of next month is last day of current month

    if (today > endDateOfQuarter) return 0; // Quarter has passed

    const diffTime = Math.abs(endDateOfQuarter.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
}

