import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DatabaseService } from 'src/db/database.service';
import { ItemConsumption } from 'src/items/interfaces/item-consumption.interface';
import { ItemsService } from 'src/items/services/items.service';
import { TransactionsService } from 'src/items/services/transactions.service';
import { AiMonitorService } from './ai-monitor.service';

@Injectable()
export class AiMonitorCron implements OnModuleInit {
    constructor(
        private readonly databaseService: DatabaseService,
        private readonly aiMonitorService: AiMonitorService,
        private readonly itemsService: ItemsService,
        private readonly transactionsService: TransactionsService,
    ) {}

    onModuleInit() {
        this.handleCron();
    }

    @Cron('0 6 * * *')
    async handleCron() {
        const items = await this.itemsService.findAll();

        if (!items || items.length === 0) {
            console.log('No items found for AI monitoring.');
            return;
        }

        for (const item of items) {
            const metrics = await this.aiMonitorService.getItemMetrics(item.id);
            if (!metrics) {
                console.log(`No metrics found for item ID ${item.id}. Training new model.`);
                this.transactionsService.pushAIJob(item.id, 'train');
                continue;
            }

            // if last trained more than 7 days ago
            if (metrics.lastTrainedAt < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
                console.log(`Last trained more than 7 days ago for item ID ${item.id}. Training new model.`);
                this.transactionsService.pushAIJob(item.id, 'train');
                continue;
            }

            // if last trained more than 1 day ago
            if (metrics.lastTrainedAt < new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)) {
                const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
                const transactions = await this.transactionsService.getTimeframeHistory(
                    item.id,
                    thirtyDaysAgo,
                    new Date(),
                );

                const mapeIncreaseDetected = await this.checkMapeIncrease(
                    item.id,
                    metrics.forecast,
                    metrics.dailyForecast,
                    metrics.lastForecastedAt,
                );
                const demandShiftDetected = this.checkDemandShift(transactions);
                const trendShiftDetected = this.checkTrendShift(transactions, metrics.trendFactor);
                const cvShiftDetected = this.checkCVShift(transactions, metrics.cv);

                if (mapeIncreaseDetected || demandShiftDetected || trendShiftDetected || cvShiftDetected) {
                    console.log(
                        `Changes detected for item ID ${item.id}. Training new model. ${JSON.stringify({
                            mapeIncreaseDetected,
                            demandShiftDetected,
                            trendShiftDetected,
                            cvShiftDetected,
                        })}`,
                    );
                    this.transactionsService.pushAIJob(item.id, 'train');
                }
            }
        }
    }

    private async checkMapeIncrease(
        itemId: number,
        forecast: number,
        dailyForecast: number,
        lastForecastedAt: Date,
    ): Promise<boolean> {
        const now = new Date();

        const forecastHorizonDays = forecast / dailyForecast;
        const forecastEndDate = new Date(lastForecastedAt);
        forecastEndDate.setDate(forecastEndDate.getDate() + forecastHorizonDays);

        if (now < forecastEndDate) {
            return false;
        }

        const transactions = await this.transactionsService.getTimeframeHistory(
            itemId,
            new Date(Date.now() - forecastHorizonDays * 24 * 60 * 60 * 1000),
            new Date(),
        );

        if (!transactions || transactions.length === 0) {
            return false;
        }

        const totalConsumption = transactions.reduce((sum, transaction) => sum + transaction.quantity, 0);

        if (totalConsumption === 0) {
            return forecast > 0;
        }

        const mape = Math.abs(totalConsumption - forecast) / totalConsumption;
        return mape > 0.1;
    }

    private checkDemandShift(transactions: ItemConsumption[]): boolean {
        if (transactions.length < 14) {
            return false;
        }

        const recent7Days = transactions.slice(-7);
        const previous7Days = transactions.slice(-14, -7);

        if (recent7Days.length === 0 || previous7Days.length === 0) {
            return false;
        }

        const recentConsumption = recent7Days.reduce((sum, transaction) => sum + transaction.quantity, 0);
        const previousConsumption = previous7Days.reduce((sum, transaction) => sum + transaction.quantity, 0);

        if (previousConsumption === 0) {
            return recentConsumption > 0;
        }

        const demandShift = (recentConsumption - previousConsumption) / previousConsumption;
        return Math.abs(demandShift) > 0.2;
    }

    private checkTrendShift(transactions: ItemConsumption[], trendFactor: number): boolean {
        if (transactions.length < 14) {
            return false;
        }

        const recent7Days = transactions.slice(-7);
        const previous7Days = transactions.slice(-14, -7);

        if (recent7Days.length < 7 || previous7Days.length < 7) {
            return false;
        }

        const recent7DaysAverage = recent7Days.reduce((sum, transaction) => sum + transaction.quantity, 0) / 7;

        const previous7DaysAverage = previous7Days.reduce((sum, transaction) => sum + transaction.quantity, 0) / 7;

        if (previous7DaysAverage === 0) {
            return recent7DaysAverage > 0;
        }

        const currentTrendFactor = recent7DaysAverage / previous7DaysAverage;
        const trendFactorChange = Math.abs(currentTrendFactor - trendFactor);

        return trendFactorChange >= 0.15;
    }

    private checkCVShift(transactions: ItemConsumption[], cv: number): boolean {
        if (transactions.length < 14) {
            return false;
        }

        const recent14Days = transactions.slice(-14);

        if (recent14Days.length < 14) {
            return false;
        }

        const mean = recent14Days.reduce((sum, transaction) => sum + transaction.quantity, 0) / recent14Days.length;

        const variance =
            recent14Days.reduce((sum, transaction) => sum + Math.pow(transaction.quantity - mean, 2), 0) /
            (recent14Days.length - 1);

        const std = Math.sqrt(variance);
        const currentCV = mean > 0 ? std / mean : 0;

        const cvChange = Math.abs(currentCV - cv);
        return cvChange >= 0.05;
    }
}
