const { Queue } = require('bullmq')
import { Job, Worker, JobsOptions } from 'bullmq';
import {MessageService} from './messageService';
import { Event } from '@prisma/client';


export class SchedulerService {
  private messageService: MessageService;
  private connectionOptions: { connection: { host: string; port: string; }}

  constructor(messageService: MessageService) {
    this.messageService = messageService;
    
    this.connectionOptions = {
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || '6379'
      }
    };

    
  }

  // Create Scheduler
  async createScheduler(event:Event): Promise<void> {
    const {schedulerId, schedulerOptions} = event;
    const payload = event.message;

    // testing using cron timezone
    const testTZ = { 
      repeat: { 
        tz: 'Asia/Jakarta', 
        cron: '27 12 30 6 *',
        limit: 3,
      },
    };

    // dummy retry options 
    const retryOptions: JobsOptions = {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000, // 1, 2, 4,
      },
    };

    // queue scheduler
    const queueScheduler = new Queue('emailQueue', this.connectionOptions);
    queueScheduler.add(event.schedulerId, payload, schedulerOptions);

    // testing with dummy
    // queueScheduler.add(event.schedulerId, payload, { ...testTZ, ...retryOptions });

    // send to message service
    const worker = new Worker('emailQueue', async (job: Job) => {
      // try send message and catch error
      try {
        await this.messageService.sendMail(job.data);
      } catch (error:any) {
        console.error('Error:', error.message);
        throw new Error(error);
      }
    });

    const jobs: Job[] = await queueScheduler.getRepeatableJobs();

    console.log('scheduler created', schedulerId, payload, schedulerOptions);
  }

  // delete scheduler with scheduler id 
  // example of scheduler id : eda90b81-b3c9-46e9-9c03-448a64dd6738-birthday
  async deleteScheduler(schedulerId:string): Promise<void> {
    const queueScheduler = new Queue('emailQueue',  this.connectionOptions);

    // get all jobs
    const jobs: any = await queueScheduler.getRepeatableJobs();

    const selectedJob = jobs.filter((job:any) => job.name === schedulerId);
    console.log('selectedScheduler', selectedJob)

    await queueScheduler.removeRepeatableByKey(selectedJob[0].key)

    console.log('scheduler deleted', schedulerId);
  }

}