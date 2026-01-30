import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { jest } from '@jest/globals';
import * as io from '@actions/io';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataPath = new URL('./jest.setup.template.json', import.meta.url);
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

jest.setTimeout(60000); // in milliseconds

// Set temp and tool directories before importing (used to set global state)
const cachePath = path.join(__dirname, '__tests__', 'CACHE');
const tempPath = path.join(__dirname, '__tests__', 'TEMP');
const searchPath = path.join(__dirname, '__tests__', 'SEARCH');

// Define all the environment variables
process.env['RUNNER_SEARCH'] = searchPath;
process.env['RUNNER_TEMP'] = tempPath;
process.env['RUNNER_TOOL_CACHE'] = cachePath;

// Set up all the user defined variables and inputs from jest.setup.json
setUserVars();

function setUserVars() {
  data.envVars.forEach(function (envVar) {
    process.env[envVar.name] = envVar.value;
  });
  data.inputs.forEach(function (input) {
    setVar(input.name, input.value);
  });
}

if (!fs.existsSync(tempPath)) {
  io.mkdirP(tempPath);
}

function setVar(name, value) {
  process.env[`INPUT_${name.replace(/ /g, '_').toUpperCase()}`] = value;
}
