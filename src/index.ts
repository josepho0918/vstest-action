import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as path from 'path';
import {uploadArtifact} from './uploadArtifact'
import {getTestAssemblies} from './getTestAssemblies'
import {getArguments} from './getArguments'
import {getVsTestPath} from './getVsTestPath'

export async function run() {
  try {
    const testFiles = await getTestAssemblies();
    if (testFiles.length == 0) {
      throw new Error('No matched test files!');
    }

    core.debug(`Matched test files are:`);
    testFiles.forEach(function (file) {
      core.debug(`${file}`);
    });

    core.info(`Setting test tools...`);
    const workerZipPath = path.join(__dirname, 'win-x64.zip');

    core.info(`Unzipping test tools...`);
    core.debug(`workerZipPath is ${workerZipPath}`);
    await exec.exec(`powershell Expand-Archive -Path ${workerZipPath} -DestinationPath ${__dirname}`);

    const vsTestPath = getVsTestPath();
    core.debug(`VsTestPath: ${vsTestPath}`);

    const args = getArguments();
    core.debug(`Arguments: ${args}`);

    core.info(`Running tests...`);
    await exec.exec(`${vsTestPath} ${testFiles.join(' ')} ${args} /Logger:TRX`);
  } catch (err: unknown) {
    core.setFailed(err instanceof Error ? err.message : 'Unknown error type');
  }

  // Always attempt to upload test result artifact
  try {
    await uploadArtifact();
  } catch (err: unknown) {
    core.setFailed(err instanceof Error ? err.message : 'Unknown error type');
  }
}

run();