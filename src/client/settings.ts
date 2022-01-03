import fs from "fs";
import os from "os";
import path from "path";
import * as Global from "./global";

const storageDir = path.join(os.homedir(), ".bldr");

export const DefaultSettings = {
  window: {
    height: 600,
    width: 800,
  },
  templates: {
    path: path.join(storageDir, "templates"),
  },
  output: {
    path: path.join(storageDir, "output"),
  },
};

export const LoadOrNew = (): Global.Settings => {
  try {
    fs.accessSync(storageDir, fs.constants.F_OK);
  } catch (e) {
    console.log("creating home directory");
    fs.mkdirSync(storageDir);
  }

  const settingsPath = path.join(storageDir, "settings.json");
  try {
    fs.accessSync(settingsPath, fs.constants.F_OK);
  } catch (e) {
    console.log("saving default settings");
    fs.writeFileSync(settingsPath, JSON.stringify(DefaultSettings));
  }

  const b = fs.readFileSync(settingsPath);
  const loadedSettings: Global.Settings = JSON.parse(b.toString());

  try {
    fs.accessSync(loadedSettings.templates.path, fs.constants.F_OK);
  } catch (e) {
    console.log("creating templates directory");
    fs.mkdirSync(loadedSettings.templates.path);
  }

  try {
    fs.accessSync(loadedSettings.output.path, fs.constants.F_OK);
  } catch (e) {
    console.log("creating output directory");
    fs.mkdirSync(loadedSettings.output.path);
  }

  return Object.assign(DefaultSettings, loadedSettings);
};
