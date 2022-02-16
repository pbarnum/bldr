import { Pagination } from './api';

export interface Scope {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Role {
  id: string;
  name: string;
  scopes: Scope[];
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  templateCount: number;
  outputCount: number;
  roles: Role[];
  verifyToken: string;
  resetToken: string;
  verifiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface GetRolesResp {
  roles: Role[];
}

export interface CreateUserReq {
  firstName: string;
  lastName: string;
  email: string;
}

export interface UpdateUserReq {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  roles: Role[];
}

export interface LoginResp {
  token: string;
  user: User;
}

export interface VerifyEmailResp {
  user: User;
}

export interface CreateUserResp {
  user: User;
}

export interface ListUsersResp {
  pagination: Pagination;
  users: User[];
}

export interface GetUserResp {
  user: User;
}

export interface UpdateUserResp {
  user: User;
}

export interface RestoreUserResp {
  user: User;
}
