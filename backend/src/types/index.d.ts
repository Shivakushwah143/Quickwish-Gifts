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
      rawBody?: Buffer;
    }
  }
}

export interface JwtPayload {
  userId?: string;
  userID?: string;
  username?: string;
  email?: string;
  role?: string;
  creatorId?: string;
  iat?: number;
  exp?: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: "CUSTOMER" | "ADMIN" | "CREATOR";
        email?: string;
        username?: string;
        creatorId?: string;
      };
      admin?: {
        userId: string;
        role: "ADMIN";
        username?: string;
      };
      traceId?: string;
    }
  }
}

export {};
