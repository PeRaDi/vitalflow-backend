import { Injectable } from '@nestjs/common';
import {
    ClientProxy,
    ClientProxyFactory,
    Transport,
} from '@nestjs/microservices';
import { TaskDTO } from './dto/task.dto';
import { ForecastResponse } from './responses/forecast.response';
import { TrainResponse } from './responses/train.response';

@Injectable()
export class RabbitMQService {
    private client: ClientProxy;

    constructor() {
        this.client = ClientProxyFactory.create({
            transport: Transport.RMQ,
            options: {
                urls: [process.env.RABBITMQ_URL],
                queue: process.env.RABBITMQ_QUEUE,
            },
        });
    }

    async insertTrainTask(task: TaskDTO): Promise<TrainResponse> {
        const response = await this.client
            .send('queue_trainer', task)
            .toPromise();
        return { success: response.success };
    }

    async insertForecastTask(task: TaskDTO): Promise<ForecastResponse> {
        const response = await this.client
            .send('queue_forecast', task)
            .toPromise();
        return { success: response.success, value: response.value };
    }
}
