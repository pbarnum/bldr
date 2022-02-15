import { Pagination } from './api';
import { Template } from './template';
import { User } from './user';

export interface Output {
  id: string;
  userId: string;
  user: User;
  templateId: string;
  template: Template;
  name: string;
  contents: string;
  amountReplaced: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface CreateOutputResp {
  template: Output;
}

export interface ListOutputsResp {
  pagination?: Pagination;
  outputs: Output[];
}

export interface GetOutputResp {
  template: Output;
}

export interface UpdateOutputResp {
  template: Output;
}

export interface DownloadOutputResp {
  fileName: string;
  contents: Blob;
}

export interface RestoreOutputResp {
  template: Output;
}
