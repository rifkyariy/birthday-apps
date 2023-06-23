const { Queue } = require('bullmq')
import {MessageService} from './messageService';

export class SchedulerService {
  private messageService: MessageService;
  private connectionOptions: { connection: { host: string; port: string; }}

  constructor(messageService: MessageService) {
    this.messageService = messageService;
    
    this.connectionOptions = {
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORt || '6379'
      }
    };
  }

  async createScheduler(schedulerId:string, payload:any, schedulerOptions:any): Promise<any> {
    console.log('createScheduler', schedulerId, payload, schedulerOptions);

    // testing using
    const testTZ = { 
      repeat: { 
        tz: 'Asia/Jakarta', 
        cron: '20 8 23 6 *' ,
        limit: 5
      }
    };

    // 
    const queueScheduler = new Queue('emailQueue',  this.connectionOptions);
    queueScheduler.add(schedulerId, payload, testTZ)
    this.messageService.addMailWorker(schedulerId, payload);
  }

  async deleteScheduler(schedulerId:any, payload:any, schedulerOptions:any): Promise<any> {
    // return await this.queue.add(jobData, { delay });
    console.log('deleteScheduler', schedulerId, payload, schedulerOptions);
  }

}