import { UUID } from 'crypto';

export interface ItemMetrics {
    itemId: number;
    mape: number;
    cv: number;
    forecast: number;
    dailyForecast: number;
    reorderPoint: number;
    safetyStock: number;
    category: string;
    serviceLevel: number;
    directionalAccuracy: number;
    trendFactor: number;
    lastTrainerJobId: UUID;
    lastForecastJobId: UUID;
    lastTrainedAt: Date;
    lastForecastedAt: Date;
}
