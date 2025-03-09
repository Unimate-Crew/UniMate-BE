// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { User } from '@app/database';

declare global {
  namespace Express {
    interface User extends User {}
  }
}
