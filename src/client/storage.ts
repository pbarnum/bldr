import jwt from 'jwt-decode';
import EventEmitter from './events';
import { events } from './types/events';
import { User } from './types/user';

enum keys {
  token = 'token',
  user = 'user',
}

// TODO: Centralize this enum
export enum scope {
  createUser = 'createUser',
  updateUser = 'updateUser',
  listUsers = 'listUsers',
  getUser = 'getUser',
  deleteUser = 'deleteUser',
  createTemplate = 'createTemplate',
  updateTemplate = 'updateTemplate',
  listTemplates = 'listTemplates',
  getTemplate = 'getTemplate',
  deleteTemplate = 'deleteTemplate',
  createOutput = 'createOutput',
  listOutputs = 'listOutputs',
  getOutput = 'getOutput',
  deleteOutput = 'deleteOutput',
}

const userScopes = [
  scope.getUser,
  scope.updateUser,
  scope.createTemplate,
  scope.getTemplate,
  scope.updateTemplate,
  scope.listTemplates,
  scope.deleteTemplate,
  scope.createOutput,
  scope.listOutputs,
  scope.getOutput,
  scope.deleteOutput,
];

const adminScopes = [...userScopes, scope.createUser, scope.listUsers, scope.deleteUser];

interface jwtScope {
  scp: string[];
}

const containsAll = (arr: string[], other: string[]) => other.every((v) => arr.includes(v));

export default {
  set token(token: string) {
    localStorage.setItem(keys.token, token);
  },
  get token(): string {
    const t = localStorage.getItem(keys.token);
    if (!t) {
      return '';
    }
    return t;
  },

  set user(user: User | undefined) {
    if (!user) {
      localStorage.setItem(keys.user, '');
      return;
    }
    localStorage.setItem(keys.user, JSON.stringify(user));
  },
  get user(): User | undefined {
    const user = localStorage.getItem(keys.user);
    if (user) {
      return JSON.parse(user);
    }
    return undefined;
  },

  login: function (token: string, user: User) {
    this.token = token;
    this.user = user;
    EventEmitter.emit(events.loggedIn, user);
  },

  logout: function () {
    this.token = '';
    this.user = undefined;
    EventEmitter.emit(events.loggedOut);
  },

  get isAdmin(): boolean {
    const token = this.token;
    if (!token) {
      return false;
    }
    const decoded = jwt<jwtScope>(token);
    return decoded && decoded.scp && containsAll(decoded.scp, adminScopes);
  },

  get isUser(): boolean {
    const token = this.token;
    if (!token) {
      return false;
    }
    const decoded = jwt<jwtScope>(token);
    return decoded && decoded.scp && containsAll(decoded.scp, userScopes);
  },

  hasScope: function (scope: string): boolean {
    const token = this.token;
    if (!token) {
      return false;
    }
    const decoded = jwt<jwtScope>(token);
    return decoded && decoded.scp && decoded.scp.includes(scope);
  },
};
