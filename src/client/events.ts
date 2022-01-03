import EventEmitter from "eventemitter3";

const eventEmitter = new EventEmitter();

/* eslint-disable  @typescript-eslint/no-explicit-any */
const Emitter = {
  on: (event: string, fn: (...data: any) => void) => eventEmitter.on(event, fn),
  once: (event: string, fn: (...data: any) => void) =>
    eventEmitter.once(event, fn),
  off: (event: string, fn: (...data: any) => void) =>
    eventEmitter.off(event, fn),
  emit: (event: string, ...payload: any) =>
    eventEmitter.emit(event, ...payload),
};

Object.freeze(Emitter);

export default Emitter;

// import * as FileSystem from './fs';
// import * as Settings from './settings';
// import * as Global from './global';
// import fs from 'fs';
// import path from 'path';

// ipcMain.handle(Global.Events.ListTemplateFiles, (event) => {
//   const settings = Settings.LoadOrNew();
//   return FileSystem.ListFiles(settings.templates.path);
// });

// ipcMain.handle(Global.Events.GetTemplateContents, (event, fileName: string) => {
//   const settings = Settings.LoadOrNew();
//   const file = path.join(settings.templates.path, fileName);
//   return FileSystem.GetFileContents(file);
// });

// ipcMain.handle(Global.Events.ListOutputFiles, (event) => {
//   const settings = Settings.LoadOrNew();
//   return FileSystem.ListFiles(settings.output.path);
// });

// ipcMain.handle(Global.Events.GetOutputContents, (event, fileName: string) => {
//   const settings = Settings.LoadOrNew();
//   const file = path.join(settings.templates.path, fileName);
//   return FileSystem.GetFileContents(file);
// });

// ipcMain.on(Global.Events.OpenFileDialog, (event, title?: string, label?: string) => {
//   const settings = Settings.LoadOrNew();
//   dialog
//     .showOpenDialog({
//       title: title || 'Open',
//       buttonLabel: label || 'Open',
//       properties: ['openFile', 'multiSelections', 'showHiddenFiles'],
//     })
//     .then((dialogResp) => {
//       dialogResp.filePaths.forEach((file) => {
//         const dest = path.join(settings.templates.path, path.basename(file));
//         fs.copyFile(file, dest, (err) => {
//           if (err) {
//             console.error('failed to copy file', file, err);
//           }
//         });
//       });
//     })
//     .catch(console.error);
// });

// ipcMain.handle(Global.Events.SaveCompiledFile, (event, fileName: string, compiledData: string) => {
//   const settings = Settings.LoadOrNew();
//   const file = path.join(settings.output.path, fileName);
//   return FileSystem.SaveOutputContents(file, compiledData);
// });

// ipcMain.handle(Global.Events.DeleteOutputFile, (event, fileName: string) => {
//   const settings = Settings.LoadOrNew();
//   const file = path.join(settings.output.path, fileName);
//   return FileSystem.DeleteOutputFile(file);
// });
