const { Queue } = require('bullmq')
import { Job } from 'bullmq';
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

  async createScheduler(schedulerId:string, payload:any, schedulerOptions:any): Promise<void> {

    // testing using cron timezone
    const testTZ = { 
      repeat: { 
        tz: 'Asia/Jakarta', 
        cron: '20 8 23 6 *' ,
        limit: 5
      }
    };

    // 
    const queueScheduler = new Queue('emailQueue',  this.connectionOptions);
    queueScheduler.add(schedulerId, payload, schedulerOptions)
    this.messageService.addMailWorker(schedulerId, payload);

    const jobs: Job[] = await queueScheduler.getRepeatableJobs();
    console.log('list of jobs', jobs);

    console.log('scheduler created', schedulerId, payload, schedulerOptions);
    return 
  }

  async deleteScheduler(schedulerId:string): Promise<void> {
    const queueScheduler = new Queue('emailQueue',  this.connectionOptions);
    console.log('deleteScheduler', schedulerId);

    const jobs: any = await queueScheduler.getRepeatableJobs();
    console.log('list of jobs', jobs);

    for(let i = 0; i < jobs.length; i++) {
      if(jobs[i].name === schedulerId){
        await queueScheduler.removeRepeatableByKey(jobs[i].key);
      }
    }

    console.log('scheduler deleted', schedulerId);
  }

}