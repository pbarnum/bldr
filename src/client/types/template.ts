import { Pagination } from "./api";

export interface Template {
  id: string;
  userId: string;
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

// export interface DeleteTemplateResp {}

export interface RestoreTemplateResp {
  template: Template;
}
