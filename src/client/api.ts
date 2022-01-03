import storage from "./storage";
import { ApiMessage } from "./types/api";
import { ListUsersResp, LoginResp } from "./types/user";
import { CreateTemplateResp, ListTemplatesResp } from "./types/template";
import {
  CreateOutputResp,
  DownloadOutputResp,
  ListOutputsResp,
  Output,
} from "./types/output";
import { newErrorAlert } from "./App";

const baseUrl = (): URL => {
  const host = process.env.SERVER_HOST || "http://localhost";
  const port = process.env.SERVER_PORT || "3000";
  return new URL(`${host}:${port}/api/v1`);
};

const url = (p: string): string => {
  let path = p;
  if (!p.startsWith("/")) {
    path = "/" + path;
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
      "Content-Type": "application/json",
    }),
  };
};

const newGetReq = (): RequestInit => {
  const r = req();
  r.method = "GET";
  return r;
};

const newPostReq = (body: { [key: string]: unknown }): RequestInit => {
  const r = req();
  r.method = "POST";
  r.body = JSON.stringify(body);
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
    return "";
  }
  return "?" + qp.join("&");
};

export default {
  login: async (email: string, password: string): Promise<LoginResp> => {
    const path = "/login";
    const res = await fetch(url(path), newPostReq({ email, password }));

    if (res.status !== 200) {
      return res.json();
    }

    const json = await res.json();
    storage.login(json.token, json.user);
    return json;
  },
  logout: async (): Promise<void> => {
    storage.logout();
  },
  user: {
    listUsers: async (
      page: number,
      limit: number,
      archived = false
    ): Promise<ListUsersResp> => {
      const path = "/users" + queryParams({ page, limit, archived });
      const res = await authenticated(url(path), newGetReq());
      if (res.status !== 200) {
        throw res.json();
      }

      return res.json();
    },
  },
  template: {
    createTemplate: async (
      userId: string,
      file: File
    ): Promise<CreateTemplateResp> => {
      const path = `/users/${userId}/templates`;
      const b = { name: file.name, size: file.size, contents: "" };

      return new Promise<CreateTemplateResp>((resolve, reject) => {
        new Promise<{ [key: string]: unknown }>((fResolve, fReject) => {
          const reader = new FileReader();
          reader.readAsText(file, "UTF-8");
          reader.onload = (e) => {
            b.contents = e.target?.result as string;
            fResolve(b);
          };
          reader.onerror = () => {
            fReject(newErrorAlert(`Failed to upload template`));
          };
        }).then((reqBody) => {
          console.log("upload", reqBody);
          authenticated(url(path), newPostReq(reqBody)).then(
            (res: Response) => {
              if (res.status !== 201) {
                reject(res.json());
                return;
              }
              resolve(res.json());
            }
          );
        });
      });
    },
    listTemplates: async (
      userId: string,
      page: number,
      limit: number,
      archived = false
    ): Promise<ListTemplatesResp> => {
      const path =
        `/users/${userId}/templates` + queryParams({ page, limit, archived });
      const res = await authenticated(url(path), newGetReq());

      if (res.status === 404) {
        return { templates: [] };
      }

      if (res.status !== 200) {
        throw res.json();
      }

      return res.json();
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
        throw res.json();
      }
      return res.json();
    },
    listAllOutputs: async (
      userId: string,
      page: number,
      limit: number,
      archived = false
    ): Promise<ListOutputsResp> => {
      const path =
        `/users/${userId}/outputs` + queryParams({ page, limit, archived });
      const res = await authenticated(url(path), newGetReq());

      if (res.status === 404) {
        return { outputs: [] };
      }

      if (res.status !== 200) {
        throw res.json();
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
      const path =
        `/users/${userId}/templates/${templateId}/outputs` +
        queryParams({ page, limit, archived });
      const res = await authenticated(url(path), newGetReq());

      if (res.status === 404) {
        return { outputs: [] };
      }

      if (res.status !== 200) {
        throw res.json();
      }

      return res.json();
    },
    downloadOutput: async (output: Output): Promise<DownloadOutputResp> => {
      const path = `/users/${output.userId}/templates/${output.templateId}/outputs/${output.id}/download`;
      const res = await authenticated(url(path), newGetReq());
      if (res.status !== 200) {
        throw res.json();
      }

      let fileName = output.name;
      try {
        const fnHeader = res.headers.get("Content-Disposition");
        const matches = fnHeader?.match(/filename="(.*)";/);
        if (matches && matches.length === 1) {
          fileName = matches[0];
        }
      } catch (err) {
        console.error("invalid content disposition header", err);
      }

      return {
        fileName,
        contents: await res.blob(),
      };
    },
    deleteOutput: async (output: Output): Promise<void> => {
      const path = `/users/${output.userId}/templates/${output.templateId}/outputs/${output.id}`;
      const res = await authenticated(url(path), newGetReq());
      if (res.status !== 204) {
        throw res.json();
      }
    },
  },
};
