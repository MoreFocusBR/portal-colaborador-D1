// /home/ubuntu/admin_project/d1-admin-main/frontend/src/services/okrApiService.ts
import { Objective, KeyResult, OkrOverviewMetrics } from '../../../backend/src/types/okrTypes'; // Adjust path as needed
import { getAuthToken } from "../utils/auth"; // Para obter o token

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api'; // Adjust if your API is elsewhere

// Helper function to get the auth token
  const authToken = getAuthToken();

export const getOkrOverview = async (quarter: string): Promise<OkrOverviewMetrics> => {
  const url = `${API_BASE_URL}/okr/overview?quarter=${quarter}`;
  
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Error fetching OKR overview: ${response.statusText}`);
  }
  
  return await response.json();
};

export const getAllObjectives = async (quarter?: string): Promise<Objective[]> => {
  const url = `${API_BASE_URL}/okr/objectives${quarter ? `?quarter=${quarter}` : ''}`;
  
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Error fetching objectives: ${response.statusText}`);
  }
  
  return await response.json();
};

export const getObjectiveById = async (objectiveId: string): Promise<Objective> => {
  const url = `${API_BASE_URL}/okr/objectives/${objectiveId}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Error fetching objective: ${response.statusText}`);
  }
  
  return await response.json();
};

export const createObjective = async (objectiveData: Omit<Objective, 'id' | 'keyResults' | 'createdAt' | 'updatedAt' | 'overallProgress' | 'netConfidenceScore'>): Promise<Objective> => {
  const url = `${API_BASE_URL}/okr/objectives`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify(objectiveData),
  });

  if (!response.ok) {
    throw new Error(`Error creating objective: ${response.statusText}`);
  }
  
  return await response.json();
};

export const updateObjective = async (objectiveId: string, objectiveData: Partial<Omit<Objective, 'id' | 'keyResults' | 'createdAt' | 'updatedAt'>>): Promise<Objective> => {
  const url = `${API_BASE_URL}/okr/objectives/${objectiveId}`;

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify(objectiveData),
  });

  if (!response.ok) {
    throw new Error(`Error updating objective: ${response.statusText}`);
  }
  
  return await response.json();
};

export const deleteObjective = async (objectiveId: string): Promise<void> => {
  const url = `${API_BASE_URL}/okr/objectives/${objectiveId}`;

  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Error deleting objective: ${response.statusText}`);
  }
};

export const addKeyResult = async (objectiveId: string, krData: Omit<KeyResult, 'id' | 'objectiveId' | 'lastUpdated' | 'notes' | 'progressPercentage'>): Promise<Objective> => {
  const url = `${API_BASE_URL}/okr/objectives/${objectiveId}/keyresults`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify(krData),
  });

  if (!response.ok) {
    throw new Error(`Error adding key result: ${response.statusText}`);
  }
  
  return await response.json();
};

export const updateKeyResult = async (objectiveId: string, krId: string, krUpdateData: Partial<Omit<KeyResult, 'id' | 'objectiveId' | 'progressPercentage'>>): Promise<Objective> => {
  const url = `${API_BASE_URL}/okr/objectives/${objectiveId}/keyresults/${krId}`;

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify(krUpdateData),
  });

  if (!response.ok) {
    throw new Error(`Error updating key result: ${response.statusText}`);
  }
  
  return await response.json();
};

export const removeKeyResult = async (objectiveId: string, krId: string): Promise<Objective> => {
  const url = `${API_BASE_URL}/okr/objectives/${objectiveId}/keyresults/${krId}`;

  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Error removing key result: ${response.statusText}`);
  }
  
  return await response.json();
};

export const addNoteToKeyResult = async (objectiveId: string, krId: string, note: string): Promise<KeyResult> => {
  const url = `${API_BASE_URL}/okr/objectives/${objectiveId}/keyresults/${krId}/notes`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({ note }),
  });

  if (!response.ok) {
    throw new Error(`Error adding note to key result: ${response.statusText}`);
  }
  
  return await response.json();
};

// You might need to define a more specific type for the frontend if backend types are not directly usable or complete
export type { Objective, KeyResult, OkrOverviewMetrics } from '../../../backend/src/types/okrTypes'; // Re-export for convenience

export enum KRType {
    BOOLEAN = 'boolean',
    PERCENTAGE = 'percentage',
    CURRENCY = 'currency',
    NUMBER = 'number',
}

export enum KRStatus {
    PLANNED = 'planned',
    IN_PROGRESS = 'in_progress',
    AT_RISK = 'at_risk',
    COMPLETED = 'completed'
}