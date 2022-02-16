import { Pagination } from './api';
import { User } from './user';

export interface TemplateOption {
  label: string;
  value: string;
}

export interface TemplateVariable {
  label: string;
  value: string;
}

const TemplateVariableRegex = new RegExp(/{[\w-]+}/, 'mg');
export { TemplateVariableRegex };

export interface Template {
  id: string;
  userId: string;
  user: User;
  totalVariables: number;
  uniqueVariables: number;
  outputCount: number;
  name: string;
  size: number;
  contents: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface CreateTemplateResp {
  template: Template;
}

export interface ListTemplatesResp {
  pagination?: Pagination;
  templates: Template[];
}

export interface GetTemplateResp {
  template: Template;
}

export interface UpdateTemplateResp {
  template: Template;
}

export interface DownloadTemplateResp {
  fileName: string;
  contents: Blob;
}

export interface RestoreTemplateResp {
  template: Template;
}
