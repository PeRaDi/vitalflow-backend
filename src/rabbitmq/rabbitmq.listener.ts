import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { UUID } from 'crypto';

import { TrainerPayloadDto } from './dto/train.response';
import { RabbitMQService } from './rabbitmq.service';

@Controller()
export class RabbitMQListener {
    constructor(private readonly rabbitMQService: RabbitMQService) {}

    @EventPattern('trainer')
    async handleTrainerMessages(@Payload() payload: TrainerPayloadDto): Promise<void> {
        try {
            const { job_id, result } = payload;

            if (result.success) {
                await this.rabbitMQService.handleSuccess(job_id as UUID, result.data);
            } else if (result.error === 'NOT_FOUND' || result.data?.status === 'NOT_FOUND') {
                await this.rabbitMQService.handleNotFound(job_id as UUID);
            } else {
                await this.rabbitMQService.handlerError(job_id as UUID, result.error);
            }
        } catch (error) {
            console.error('Error handling trainer message:', error);
            throw error;
        }
    }

    @EventPattern('forecaster')
    async handleForecasterMessages(@Payload() payload: TrainerPayloadDto): Promise<void> {
        try {
            const { job_id, result } = payload;

            if (result.success) {
                await this.rabbitMQService.handleSuccess(job_id as UUID, result.data);
            } else if (result.error === 'NOT_FOUND' || result.data?.status === 'NOT_FOUND') {
                await this.rabbitMQService.handleNotFound(job_id as UUID);
            } else {
                await this.rabbitMQService.handlerError(job_id as UUID, result.error);
            }
        } catch (error) {
            console.error('Error handling forecaster message:', error);
            throw error;
        }
    }
}
