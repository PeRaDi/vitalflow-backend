import { Injectable } from '@nestjs/common';
import { UUID } from 'crypto';

import { DatabaseService } from '../db/database.service';
import { TransactionsService } from '../items/services/transactions.service';

import { ItemMetrics } from './interfaces/item-metrics.interface';

@Injectable()
export class AiMonitorService {
    constructor(
        private readonly databaseService: DatabaseService,
        private readonly transactionsService: TransactionsService,
    ) {}

    async getItemMetrics(itemId: number): Promise<ItemMetrics | null> {
        const query = `SELECT * FROM ai_monitor WHERE item_id = $1`;
        const result = await this.databaseService.query(query, [itemId]);
        if (result.length === 0) {
            return null;
        }

        return {
            itemId: result[0].item_id,
            mape: result[0].mape,
            cv: result[0].cv,
            forecast: result[0].forecast,
            dailyForecast: result[0].daily_forecast,
            reorderPoint: result[0].reorder_point,
            safetyStock: result[0].safety_stock,
            category: result[0].abc_xyz_category,
            serviceLevel: result[0].service_level,
            directionalAccuracy: result[0].directional_accuracy,
            trendFactor: result[0].trend_factor,
            lastTrainerJobId: result[0].last_trainer_job_id,
            lastForecastJobId: result[0].last_forecast_job_id,
            lastTrainedAt: result[0].last_trained_at,
            lastForecastedAt: result[0].last_forecasted_at,
        } as ItemMetrics;
    }

    async handleTrainerSuccess(itemId: number, jobId: UUID, mape: number, directional_accuracy: number): Promise<void> {
        const metrics = await this.getItemMetrics(itemId);
        if (!metrics) {
            await this.databaseService.query(
                `INSERT INTO ai_monitor (item_id, mape, directional_accuracy, last_trainer_job_id, last_trained_at)
                 VALUES ($1, $2, $3, $4, NOW())`,
                [itemId, mape, directional_accuracy, jobId],
            );
        } else {
            await this.databaseService.query(
                `UPDATE ai_monitor SET mape = $1, directional_accuracy = $2, last_trainer_job_id = $3, last_trained_at = NOW()
                 WHERE item_id = $4`,
                [mape, directional_accuracy, jobId, itemId],
            );
        }
    }

    async handleForecasterSuccess(
        itemId: number,
        jobId: UUID,
        cv: number,
        forecast: number,
        dailyForecast: number,
        reorderPoint: number,
        safetyStock: number,
        category: string,
        serviceLevel: number,
        trendFactor: number,
    ): Promise<void> {
        const metrics = await this.getItemMetrics(itemId);
        if (!metrics) {
            await this.databaseService.query(
                `INSERT INTO ai_monitor (item_id, cv, forecast, daily_forecast, reorder_point, safety_stock, abc_xyz_category, service_level, trend_factor, last_forecaster_job_id, last_forecasted_at)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())`,
                [
                    itemId,
                    cv,
                    forecast,
                    dailyForecast,
                    reorderPoint,
                    safetyStock,
                    category,
                    serviceLevel,
                    trendFactor,
                    jobId,
                ],
            );
        } else {
            await this.databaseService.query(
                `UPDATE ai_monitor SET cv = $1, forecast = $2, daily_forecast = $3, reorder_point = $4, safety_stock = $5, abc_xyz_category = $6, service_level = $7, trend_factor = $8, last_forecaster_job_id = $9, last_forecasted_at = NOW()
                 WHERE item_id = $10`,
                [
                    cv,
                    forecast,
                    dailyForecast,
                    reorderPoint,
                    safetyStock,
                    category,
                    serviceLevel,
                    trendFactor,
                    jobId,
                    itemId,
                ],
            );
        }
    }

    async handleItemConsumed(itemId: number): Promise<void> {
        const today = (await this.transactionsService.getConsumptionStats(itemId)).today;
        const itemMetrics = await this.getItemMetrics(itemId);
        const stocked = await this.transactionsService.getCurrentStock(itemId);

        if (today >= itemMetrics.dailyForecast * 2) {
            console.warn(
                `Item ${itemId} consumed more than forecasted today: ${today} vs ${itemMetrics.dailyForecast}`,
            );
            await this.transactionsService.pushAIJob(itemId, 'forecast');
            return;
        }

        if (stocked < itemMetrics.reorderPoint * 1.25) {
            console.warn(`Item ${itemId} stock is almost at reorder point: ${stocked} vs ${itemMetrics.reorderPoint}`);
            await this.transactionsService.pushAIJob(itemId, 'forecast');
        }
    }
}
