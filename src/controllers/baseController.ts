import { Request, Response } from 'express';

export interface BaseResponse<T> {
  status: number;
  message: string;
  data?: T;
  error?: object;
}

export abstract class BaseController {
  protected abstract service: any; // Update with the appropriate service type

  protected async handleRequest<T>(req: Request, res: Response, action: () => Promise<T>): Promise<void> {
    try {
      const result = await action();
      const response: BaseResponse<T> = {
        status: 200,
        message: 'Success',
        data: result,
      };
      res.json(response);
    } catch (error:any) {
      console.error(error);
      const response: BaseResponse<null> = {
        status: 500,
        message: 'Something went wrong',
        error: error.meta.cause || error,
      };
      res.status(500).json(response);
    }
  }

  protected async handleNotFound(req: Request, res: Response, message: string = 'Not found'): Promise<void> {
    const response: BaseResponse<null> = {
      status: 404,
      message,
    };
    res.status(404).json(response);
  }

  protected async handleBadRequest(req: Request, res: Response, message: string = 'Bad request'): Promise<void> {
    const response: BaseResponse<null> = {
      status: 400,
      message,
    };
    res.status(400).json(response);
  }
}
