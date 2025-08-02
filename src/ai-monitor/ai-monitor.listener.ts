import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Job } from 'src/rabbitmq/interfaces/job.interface';
import { AiMonitorService } from './ai-monitor.service';

@Injectable()
export class AiMonitorListener {
    constructor(private readonly aiMonitorService: AiMonitorService) {}

    @OnEvent('job.ai.success')
    async handleJobSuccess(payload: { job: Job }) {
        const job: Job = payload.job;
        switch (job.queue) {
            case 'TRAINER':
                // Handle success for trainer jobs
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
                // Handle success for forecaster jobs
                console.log(`Forecaster job succeeded: ${payload.job.id}`);
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
}
// {
//   "job_id": "189445d6-03fb-4ecb-a6aa-43690dc1155c",
//   "item_id": 2,
//   "model_performance": {
//     "test_r2": 0.944381658931752,
//     "approach": "Adaptive_All_Seasonality",
//     "test_mae": 26.982466194033623,
//     "train_r2": 0.9446946448892134,
//     "test_mape": 4.164480732887498,
//     "test_rmse": 34.97945142773956,
//     "input_size": 4,
//     "train_rmse": 31.594237516770406,
//     "best_config": "All_Seasonality",
//     "use_prophet": true,
//     "directional_accuracy": 81.61559888579387,
//     "seasonality_features": [
//       "weekly",
//       "yearly",
//       "monthly"
//     ]
//   },
//   "evaluation_metrics": {
//     "mae": 26.982466194033623,
//     "mse": 1223.562022185591,
//     "mape": 4.164480732887498,
//     "rmse": 34.97945142773956,
//     "r2_score": 0.944381658931752,
//     "train_r2": 0.9446946448892134,
//     "train_mae": 24.251071308690193,
//     "train_mse": 998.1958442661027,
//     "train_rmse": 31.594237516770406,
//     "test_samples": 360,
//     "train_samples": 1436,
//     "directional_accuracy": 81.61559888579387
//   },
//   "evaluation_report_path": "evaluation_report_item_2.json"
// }
