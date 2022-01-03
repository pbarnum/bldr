export enum Events {
  ListTemplateFiles = "__event_list_template_files",
  ListOutputFiles = "__event_list_output_files",
  GetTemplateContents = "__event_get_template_contents",
  GetOutputContents = "__event_get_output_contents",
  AddNewTemplate = "__event_add_new_template",
  OpenFileDialog = "__event_open_file_dialog",
  SaveCompiledFile = "__event_save_compiled_file",
  DeleteOutputFile = "__event_delete_output_file",
}

export interface File {
  name: string;
  size: number;
  createdAt: Date;
}

export type FileList = File[];

export interface TemplateOption {
  label: string;
  value: string;
}

export interface TemplateVariable {
  label: string;
  value: string;
}

interface Window {
  height: number;
  width: number;
}

interface Templates {
  path: string;
}

interface Output {
  path: string;
}

// interface Api {
//   send: (channel: Events, ...args: any[]) => void;
//   get: <T>(channel: Events, ...args: any[]) => Promise<T>;
// }

// declare global {
//   interface Window {
//     api: Api;
//   }
// }

export interface Settings {
  window: Window;
  templates: Templates;
  output: Output;
}

const TemplateVariableRegex = new RegExp(/{[\w-]+}/, "mg");

export { TemplateVariableRegex };
