// /home/ubuntu/admin_project/d1-admin-main/backend/src/routes/okr.ts
import express from "express";
import * as okrController from "../controllers/okr/okrController.js";

const router = express.Router();

// Objectives routes
router.post("/objectives", okrController.createObjective);
router.get("/objectives", okrController.getAllObjectives);
router.get("/objectives/:objectiveId", okrController.getObjective);
router.put("/objectives/:objectiveId", okrController.updateObjective);
router.delete("/objectives/:objectiveId", okrController.deleteObjective);

// Key Results routes
router.post("/objectives/:objectiveId/keyresults", okrController.addKeyResultToObjective);
router.put("/objectives/:objectiveId/keyresults/:krId", okrController.updateKeyResult);
router.delete("/objectives/:objectiveId/keyresults/:krId", okrController.removeKeyResultFromObjective);
router.post("/objectives/:objectiveId/keyresults/:krId/notes", okrController.addNoteToKeyResult);

// Overview metrics
router.get("/overview", okrController.getOkrOverview);

export default router;
