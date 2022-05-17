import { IJwtToken } from "./global/types/JwtToken";

declare global {
  declare namespace Express {
    export interface Request {
      user?: IJwtToken
    }
  }
}