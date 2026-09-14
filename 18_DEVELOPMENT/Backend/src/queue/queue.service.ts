import { Injectable, Logger } from '@nestjs/common';

export interface JobData {
  id: string;
  type: string;
  payload: Record<string, any>;
  attempts?: number;
}

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);

  async addJob(queueName: string, jobType: string, payload: Record<string, any>): Promise<JobData> {
    const job: JobData = {
      id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      type: jobType,
      payload,
      attempts: 0,
    };

    this.logger.log(`[QueueService] Dispatched job '${jobType}' to queue '${queueName}'. Job ID: ${job.id}`);
    return job;
  }
}
