export enum KRType {
    BOOLEAN = 'boolean',
    PERCENTAGE = 'percentage',
    CURRENCY = 'currency',
    NUMBER = 'number'
}

export enum KRStatus {
    PLANNED = 'planned',
    IN_PROGRESS = 'in_progress',
    AT_RISK = 'at_risk',
    COMPLETED = 'completed'
}

export interface KeyResult {
    id: string;
    objectiveId: string;
    title: string;
    responsible: string;
    type: KRType;
    targetValue: number;
    currentValue?: number;
    startDate: Date;
    endDate: Date;
    confidenceLevel: number;
    description?: string;
    unit?: string;
    status: KRStatus;
    lastUpdated?: Date;
    notes?: string[];
}

export interface Objective {
    id?: string;
    title: string;
    responsible: string;
    quarter: string;
    description?: string;
    ownerId?: string;
    tags?: string[];
    keyResults?: KeyResult[];
    overallProgress?: number;
    netConfidenceScore?: number;
    createdAt?: Date;
    updatedAt?: Date;
}

// Para a seção OVERVIEW
export interface OkrOverviewMetrics {
    daysLeft: number;
    overallProgress: number;
    tasksCompleted: number;
    totalTasks: number;
    netConfidenceScore: number;
}

