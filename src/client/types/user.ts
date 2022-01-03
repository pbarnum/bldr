import { Pagination } from "./api";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface LoginResp {
  token: string;
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

// export interface DeleteUserResp {}

export interface RestoreUserResp {
  user: User;
}
