import { newErrorAlert } from './App';
import storage from './storage';
import { CreateOutputResp, DownloadOutputResp, ListOutputsResp, Output } from './types/output';
import { CreateTemplateResp, DownloadTemplateResp, ListTemplatesResp, Template } from './types/template';
import {
  CreateUserReq,
  CreateUserResp,
  GetRolesResp,
  ListUsersResp,
  LoginResp,
  RestoreUserResp,
  UpdateUserReq,
  UpdateUserResp,
  VerifyEmailResp,
} from './types/user';

interface Server {
  host: string;
  port: string;
}

interface Window {
  server: Server;
}

const baseUrl = (): URL => {
  const host = (window as unknown as Window)?.server?.host || 'http://localhost';
  const port = (window as unknown as Window)?.server?.port || '';
  return new URL(`${host}:${port}/api/v1`);
};

const url = (p: string): string => {
  let path = p;
  if (!p.startsWith('/')) {
    path = '/' + path;
  }
  return baseUrl().toString() + path;
};

const authenticated = (path: string, req: RequestInit): Promise<Response> => {
  const h = new Headers({ Authorization: `Bearer ${storage.token}` });
  new Headers(req.headers || {}).forEach((v, k) => {
    h.append(k, v);
  });
  req.headers = h;
  return fetch(path, req);
};

const req = (): RequestInit => {
  return {
    headers: new Headers({
      'Content-Type': 'application/json',
    }),
  };
};

const newGetReq = (): RequestInit => {
  const r = req();
  r.method = 'GET';
  return r;
};

const newDeleteReq = (): RequestInit => {
  const r = req();
  r.method = 'DELETE';
  return r;
};

const newPostReq = (body?: unknown): RequestInit => {
  const r = req();
  r.method = 'POST';
  if (body) {
    r.body = JSON.stringify(body);
  }
  return r;
};

const newPatchReq = (body?: unknown): RequestInit => {
  const r = req();
  r.method = 'PATCH';
  if (body) {
    r.body = JSON.stringify(body);
  }
  return r;
};

const queryParams = (obj: { [key: string]: unknown }) => {
  const qp: string[] = [];
  Object.keys(obj).forEach((k) => {
    if (obj[k]) {
      qp.push(`${k}=${obj[k]}`);
    }
  });
  if (qp.length === 0) {
    return '';
  }
  return '?' + qp.join('&');
};

export default {
  auth: {
    login: async (email: string, password: string): Promise<LoginResp> => {
      const path = '/login';
      const res = await fetch(url(path), newPostReq({ email, password }));

      if (res.status !== 200) {
        throw await res.json();
      }

      const json = await res.json();
      storage.login(json.token, json.user);
      return json;
    },
    logout: async (): Promise<void> => {
      storage.logout();
    },
    verify: async (email: string, token: string): Promise<VerifyEmailResp> => {
      const path = `/verify?token=${token}&email=${email}`;
      const res = await fetch(url(path), newGetReq());
      if (res.status !== 200) {
        throw await res.json();
      }
      return await res.json();
    },
    changePassword: async (
      token: string,
      email: string,
      password: string,
      confirmPassword: string
    ): Promise<LoginResp> => {
      const path = '/passwordreset';
      const res = await fetch(url(path), newPostReq({ token, email, password, confirmPassword }));

      if (res.status !== 200) {
        throw await res.json();
      }

      return res.json();
    },
    resetPassword: async (email: string): Promise<LoginResp> => {
      const path = '/reset';
      const res = await fetch(url(path), newPostReq({ email }));

      if (res.status !== 200) {
        throw await res.json();
      }

      return res.json();
    },
    getRoles: async (): Promise<GetRolesResp> => {
      const path = '/roles';
      const res = await fetch(url(path), newGetReq());

      if (res.status !== 200) {
        throw await res.json();
      }

      return res.json();
    },
  },
  user: {
    createUser: async (user: CreateUserReq): Promise<CreateUserResp> => {
      const path = '/users';
      const res = await authenticated(url(path), newPostReq(user));
      if (res.status !== 201) {
        throw await res.json();
      }
      return await res.json();
    },
    listUsers: async (page: number, limit: number, archived = false): Promise<ListUsersResp> => {
      const path = '/users' + queryParams({ page, limit, archived });
      const res = await authenticated(url(path), newGetReq());
      if (res.status !== 200) {
        throw await res.json();
      }
      return res.json();
    },
    updateUser: async (user: UpdateUserReq): Promise<UpdateUserResp> => {
      const path = `/users/${user.id}`;
      const res = await authenticated(url(path), newPatchReq(user));
      if (res.status !== 200) {
        throw await res.json();
      }
      return await res.json();
    },
    deleteUser: async (id: string): Promise<void> => {
      const path = `/users/${id}`;
      const res = await authenticated(url(path), newDeleteReq());
      if (res.status !== 204) {
        throw await res.json();
      }
    },
    restoreUser: async (id: string): Promise<RestoreUserResp> => {
      const path = `/users/${id}/restore`;
      const res = await authenticated(url(path), newPatchReq());
      if (res.status !== 200) {
        throw await res.json();
      }
      return res.json();
    },
  },
  template: {
    createTemplate: async (userId: string, file: File): Promise<CreateTemplateResp> => {
      const path = `/users/${userId}/templates`;
      const b = { name: file.name, size: file.size, contents: '' };

      return new Promise<CreateTemplateResp>((resolve, reject) => {
        new Promise<{ [key: string]: unknown }>((fResolve, fReject) => {
          const reader = new FileReader();
          reader.readAsText(file, 'UTF-8');
          reader.onload = (e) => {
            b.contents = e.target?.result as string;
            fResolve(b);
          };
          reader.onerror = () => {
            fReject(newErrorAlert(`Failed to upload template`));
          };
        }).then((reqBody) => {
          authenticated(url(path), newPostReq(reqBody)).then((res: Response) => {
            if (res.status !== 201) {
              reject(res.json());
              return;
            }
            resolve(res.json());
          });
        });
      });
    },
    listTemplates: async (
      userId: string,
      page: number,
      limit: number,
      archived = false
    ): Promise<ListTemplatesResp> => {
      const path = `/users/${userId}/templates` + queryParams({ page, limit, archived });
      const res = await authenticated(url(path), newGetReq());

      if (res.status === 404) {
        return { templates: [] };
      }

      if (res.status !== 200) {
        throw await res.json();
      }

      return res.json();
    },
    downloadTemplate: async (template: Template): Promise<DownloadTemplateResp> => {
      const path = `/users/${template.userId}/templates/${template.id}/download`;
      const res = await authenticated(url(path), newGetReq());
      if (res.status !== 200) {
        throw await res.json();
      }

      let fileName = template.name;
      try {
        const fnHeader = res.headers.get('Content-Disposition');
        const matches = fnHeader?.match(/filename="(.*)";/);
        if (matches && matches.length === 1) {
          fileName = matches[0];
        }
      } catch (err) {
        console.error('invalid content disposition header', err);
      }

      return {
        fileName,
        contents: await res.blob(),
      };
    },
    deleteTemplate: async (template: Template): Promise<void> => {
      const path = `/users/${template.userId}/templates/${template.id}`;
      const res = await authenticated(url(path), newDeleteReq());
      if (res.status !== 204) {
        throw await res.json();
      }
    },
  },
  output: {
    createOutput: async (
      userId: string,
      templateId: string,
      name: string,
      variables: { [key: string]: string }
    ): Promise<CreateOutputResp> => {
      const path = `/users/${userId}/templates/${templateId}/outputs`;
      const b = { name, variables };

      const res = await authenticated(url(path), newPostReq(b));
      if (res.status !== 201) {
        throw await res.json();
      }
      return res.json();
    },
    listAllOutputs: async (userId: string, page: number, limit: number, archived = false): Promise<ListOutputsResp> => {
      const path = `/users/${userId}/outputs` + queryParams({ page, limit, archived });
      const res = await authenticated(url(path), newGetReq());

      if (res.status === 404) {
        return { outputs: [] };
      }

      if (res.status !== 200) {
        throw await res.json();
      }

      return res.json();
    },
    listOutputs: async (
      userId: string,
      templateId: string,
      page: number,
      limit: number,
      archived = false
    ): Promise<ListOutputsResp> => {
      const path = `/users/${userId}/templates/${templateId}/outputs` + queryParams({ page, limit, archived });
      const res = await authenticated(url(path), newGetReq());

      if (res.status === 404) {
        return { outputs: [] };
      }

      if (res.status !== 200) {
        throw await res.json();
      }

      return res.json();
    },
    downloadOutput: async (output: Output): Promise<DownloadOutputResp> => {
      const path = `/users/${output.userId}/templates/${output.templateId}/outputs/${output.id}/download`;
      const res = await authenticated(url(path), newGetReq());
      if (res.status !== 200) {
        throw await res.json();
      }

      let fileName = output.name;
      try {
        const fnHeader = res.headers.get('Content-Disposition');
        const matches = fnHeader?.match(/filename="(.*)";/);
        if (matches && matches.length === 1) {
          fileName = matches[0];
        }
      } catch (err) {
        console.error('invalid content disposition header', err);
      }

      return {
        fileName,
        contents: await res.blob(),
      };
    },
    deleteOutput: async (output: Output): Promise<void> => {
      const path = `/users/${output.userId}/templates/${output.templateId}/outputs/${output.id}`;
      const res = await authenticated(url(path), newDeleteReq());
      if (res.status !== 204) {
        throw await res.json();
      }
    },
  },
};
