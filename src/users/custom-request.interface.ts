import { Request } from 'express';

export interface CustomRequest extends Request {
  user?: { user_id: string };
}
