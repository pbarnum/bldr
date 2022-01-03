import fs from 'fs';
import path from 'path';
import * as Global from './global';

export const ListFiles = (dir: string): Promise<Global.FileList> =>
  new Promise((resolve, reject) => {
    const files: Global.FileList = [];
    try {
      fs.readdirSync(dir).forEach((file: string) => {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        files.push({
          name: path.basename(file),
          size: stats.size,
          createdAt: stats.birthtime,
        });
      });
    } catch (e) {
      console.error('failed to read templates directory', e);
      reject([]);
    }
    resolve(files);
  });

export const GetFileContents = (filePath: string): Promise<string> =>
  new Promise((resolve, reject) => {
    try {
      const stats = fs.statSync(filePath);
      if (!stats.isFile()) {
        reject('');
        return;
      }
      resolve(fs.readFileSync(filePath).toString('utf8'));
    } catch (e) {
      console.error('failed to get template file contents', e);
      reject('');
    }
  });

export const SaveOutputContents = (filePath: string, data: string): Promise<boolean> =>
  new Promise((resolve, reject) => {
    try {
      fs.writeFileSync(filePath, data);
      resolve(true);
    } catch (e) {
      console.error('failed to get template file contents', e);
      reject(false);
    }
  });

export const DeleteOutputFile = (filePath: string): Promise<boolean> =>
  new Promise((resolve, reject) => {
    try {
      fs.rmSync(filePath);
      resolve(true);
    } catch (e) {
      console.error('failed to get template file contents', e);
      reject(false);
    }
  });
