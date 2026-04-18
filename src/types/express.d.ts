import { User } from '../models/User';
import { Domain } from '../models/Domain';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        username: string;
        domainId: number;
        userLevel: number;
        sitebuilder: boolean;
      };
      domain?: Domain;
    }
  }
}
