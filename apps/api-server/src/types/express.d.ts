import { User } from '@app/database';

declare global {
  namespace Express {
    interface Request {
      user: User;
    }
  }
}
