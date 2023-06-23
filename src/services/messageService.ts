import { Worker } from "bullmq";

export class MessageService {
  addMailWorker = async (schedulerId:string, payload:any): Promise<any> => {
    const worker = new Worker('emailQueue', async job => {
      await this.sendMail(payload);
    })
  }

  sendMail = async (payload:any): Promise<any> => {
    const url = `${process.env.EMAIL_SERVICE_URL}/send-email`;
    const requestOptions = {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: payload.email,
        message: payload.data
      })
    };

    fetch(url, requestOptions)
      .then(response => response.json())
      .then(data => {
        console.log('Response:', data);
      })
      .catch(error => {
        console.error('Error:', error.message);
        throw error;
      });
  } 

}