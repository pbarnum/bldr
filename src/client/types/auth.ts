import { ApiMessage } from './api';

export interface LoginResp extends ApiMessage {
  token: string;
}
