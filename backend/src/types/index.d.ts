
import { File } from 'multer';

declare global {
  namespace Express {
    interface Request {
      files?:
        | {
            [fieldname: string]: File[];
          }
        | File[]
        | undefined;
    }
  }
}

interface JwtPayload {
  userId: string;
  username: string;
  iat?: number;
  exp?: number;
}
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
      admin?: JwtPayload;
    }
  }
}