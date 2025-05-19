// /home/ubuntu/admin_project/d1-admin-main/backend/src/controllers/okr/okrController.ts
import { Request, Response } from "express";
import { OkrService } from "../../services/OkrService.js";
import { KeyResult, Objective } from "../../types/okrTypes";

const okrService = new OkrService();

// Mock user ID - in a real app, this would come from auth middleware
const getUserIdFromRequest = (req: Request): string => {
  // return (req as any).user?.id || "mockUserId_admin"; // Example if using Passport.js or similar
  return "mockUserId_admin"; // Placeholder
};

export const createObjective = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserIdFromRequest(req);
    const objectiveData = req.body as Omit<Objective, "id" | "keyResults" | "createdAt" | "updatedAt" | "overallProgress" | "netConfidenceScore" | "calculateMetrics" | "addKeyResult" | "updateKeyResult" | "removeKeyResult">;
    const newObjective = await okrService.createObjective(userId, objectiveData);
    res.status(201).json(newObjective);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getObjective = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserIdFromRequest(req);
    const { objectiveId } = req.params;
    const objective = await okrService.getObjectiveById(userId, objectiveId);
    if (objective) {
      res.status(200).json(objective);
    } else {
      res.status(404).json({ message: "Objective not found" });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllObjectives = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserIdFromRequest(req);
    const { quarter } = req.query;
    const objectives = await okrService.getAllObjectives(userId, quarter as string | undefined);
    res.status(200).json(objectives);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateObjective = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserIdFromRequest(req);
    const { objectiveId } = req.params;
    const objectiveData = req.body as Partial<Omit<Objective, "id" | "keyResults" | "createdAt" | "updatedAt">>;
    const updatedObjective = await okrService.updateObjective(userId, objectiveId, objectiveData);
    if (updatedObjective) {
      res.status(200).json(updatedObjective);
    } else {
      res.status(404).json({ message: "Objective not found" });
    }
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteObjective = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserIdFromRequest(req);
    const { objectiveId } = req.params;
    const success = await okrService.deleteObjective(userId, objectiveId);
    if (success) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: "Objective not found" });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const addKeyResultToObjective = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserIdFromRequest(req);
    const { objectiveId } = req.params;
    const krData = req.body as Omit<KeyResult, "id" | "objectiveId" | "lastUpdated" | "notes">;
    const updatedObjective = await okrService.addKeyResult(userId, objectiveId, krData);
    if (updatedObjective) {
      res.status(200).json(updatedObjective);
    } else {
      res.status(404).json({ message: "Objective not found" });
    }
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateKeyResult = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserIdFromRequest(req);
    const { objectiveId, krId } = req.params;
    const krUpdateData = req.body as Partial<Omit<KeyResult, "id" | "objectiveId">>;
    const updatedObjective = await okrService.updateKeyResult(userId, objectiveId, krId, krUpdateData);
    if (updatedObjective) {
      res.status(200).json(updatedObjective);
    } else {
      res.status(404).json({ message: "Objective or Key Result not found" });
    }
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const removeKeyResultFromObjective = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserIdFromRequest(req);
    const { objectiveId, krId } = req.params;
    const updatedObjective = await okrService.removeKeyResult(userId, objectiveId, krId);
    if (updatedObjective) {
      res.status(200).json(updatedObjective);
    } else {
      res.status(404).json({ message: "Objective or Key Result not found" });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const addNoteToKeyResult = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = getUserIdFromRequest(req);
        const { objectiveId, krId } = req.params;
        const { note } = req.body;
        if (!note || typeof note !== "string") {
            res.status(400).json({ message: "Note content is required and must be a string." });
            return;
        }
        const updatedKr = await okrService.addNoteToKeyResult(userId, objectiveId, krId, note);
        if (updatedKr) {
            res.status(200).json(updatedKr);
        } else {
            res.status(404).json({ message: "Objective or Key Result not found" });
        }
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const getOkrOverview = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserIdFromRequest(req);
    const { quarter } = req.query;
    if (!quarter || typeof quarter !== "string") {
      res.status(400).json({ message: "Quarter parameter is required." });
      return;
    }
    const overviewMetrics = await okrService.getOkrOverviewMetrics(userId, quarter);
    res.status(200).json(overviewMetrics);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

