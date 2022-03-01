import { JwtToken } from "./types/JwtToken";

declare global {
  declare namespace Express {
    export interface Request {
      user?: JwtToken
    }
  }
}