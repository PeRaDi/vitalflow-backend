export class TrainerPayloadDto {
    job_id: string;
    result: {
        success: boolean;
        data?: any;
        error?: string;
    };
}
