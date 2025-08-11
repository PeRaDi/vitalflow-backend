import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { Job } from '../rabbitmq/interfaces/job.interface';

import { AiMonitorService } from './ai-monitor.service';

@Injectable()
export class AiMonitorListener {
    constructor(private readonly aiMonitorService: AiMonitorService) {}

    @OnEvent('job.ai.success')
    async handleJobSuccess(payload: { job: Job }) {
        const job: Job = payload.job;
        switch (job.queue) {
            case 'TRAINER':
                console.log(`Trainer job succeeded: ${job.id}`);
                const trainerResult = this.parseTrainerResult(job.result);
                this.aiMonitorService.handleTrainerSuccess(
                    job.itemId,
                    job.id,
                    trainerResult.mape,
                    trainerResult.directionalAccuracy,
                );
                break;
            case 'FORECASTER':
                console.log(`Forecaster job succeeded: ${payload.job.id}`);
                const forecasterResult = this.parseForecasterResult(job.result);
                this.aiMonitorService.handleForecasterSuccess(
                    job.itemId,
                    job.id,
                    forecasterResult.cv,
                    forecasterResult.forecast,
                    forecasterResult.dailyForecast,
                    forecasterResult.reorderPoint,
                    forecasterResult.safetyStock,
                    forecasterResult.category,
                    forecasterResult.serviceLevel,
                    forecasterResult.trendFactor,
                );
                break;
            default:
                console.warn(`Unknown job queue: ${payload.job.queue}`);
                break;
        }
    }

    parseTrainerResult(result: object): { mape: number; directionalAccuracy: number } {
        return {
            mape: result['evaluation_metrics']['mape'],
            directionalAccuracy: result['evaluation_metrics']['directional_accuracy'],
        };
    }
    parseForecasterResult(result: any): {
        cv: number;
        forecast: number;
        dailyForecast: number;
        reorderPoint: number;
        safetyStock: number;
        category: string;
        serviceLevel: number;
        trendFactor: number;
    } {
        return {
            cv: result['cv'],
            forecast: result['ai_forecast'],
            dailyForecast: result['daily_forecast'],
            reorderPoint: result['reorder_point'],
            safetyStock: result['safety_stock'],
            category: result['abc_xyz_category'],
            serviceLevel: result['service_level'],
            trendFactor: result['trend_factor'],
        };
    }

    @OnEvent('item.consumed')
    async handleItemConsumed(payload: { itemId: number }) {
        this.aiMonitorService.handleItemConsumed(payload.itemId);
    }
}
