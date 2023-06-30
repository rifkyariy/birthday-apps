import { Worker } from "bullmq";
export class MessageService {
  addMailWorker = async (payload:any): Promise<any> => {
    const worker = new Worker('emailQueue', async job => {
      return await this.sendMail(payload);
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

    console.log('send mail')
    try {
      const response = await fetch(url, requestOptions);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Response:', data);
      } else {
        throw new Error('Server encountered some errors, please try again later');
      }
    } catch (error:any) {
      console.error('Error:', error.message);
      
      // throw error;
      throw new Error(error);
    }    
  } 
}
