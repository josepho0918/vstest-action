import * as core from '@actions/core';
import {UploadArtifactOptions} from '@actions/artifact';
import {findFilesToUpload} from './search';
import {getInputs} from './input-helper';
import {NoFileOptions} from './constants';

export async function uploadArtifact() {
  try {
    const inputs = getInputs()
    const searchResult = await findFilesToUpload(inputs.searchPath)

    if (searchResult.filesToUpload.length === 0) {
      // No files were found, different use cases warrant different types of behavior if nothing is found
      switch (inputs.ifNoFilesFound) {
        case NoFileOptions.warn: {
          core.warning(
            `No files were found with the provided path: ${inputs.searchPath}. No artifacts will be uploaded.`
          )
          break
        }
        case NoFileOptions.error: {
          core.setFailed(
            `No files were found with the provided path: ${inputs.searchPath}. No artifacts will be uploaded.`
          )
          break
        }
        case NoFileOptions.ignore: {
          core.info(
            `No files were found with the provided path: ${inputs.searchPath}. No artifacts will be uploaded.`
          )
          break
        }
      }
    } else {
      const s = searchResult.filesToUpload.length === 1 ? '' : 's'
      core.info(
        `With the provided path, there will be ${searchResult.filesToUpload.length} file${s} uploaded`
      )
      core.debug(`Root artifact directory is ${searchResult.rootDirectory}`)

      if (searchResult.filesToUpload.length > 10000) {
        core.warning(
          `There are over 10,000 files in this artifact, consider create an archive before upload to improve the upload performance.`
        )
      }

      const { DefaultArtifactClient } = await import('@actions/artifact');
      const artifactClient = new DefaultArtifactClient()
      const options: UploadArtifactOptions = {}
      if (inputs.retentionDays) {
        options.retentionDays = inputs.retentionDays
      }

      const {id, size} = await artifactClient.uploadArtifact(
        inputs.artifactName,
        searchResult.filesToUpload,
        searchResult.rootDirectory,
        options
      )

      core.info(`Created artifact with id: ${id} (bytes: ${size}`)
    }
  } catch (err: unknown) {
    core.error(err instanceof Error ? err.message : "Unknown error type")
  }
}
