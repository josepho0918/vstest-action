import * as core from '@actions/core';
import {findFilesToUpload} from './search';

export async function getTestAssemblies(): Promise<string[]> {
  try {
    const searchFolder = core.getInput('searchFolder')
    const testAssembly = core.getInput('testAssembly')

    core.debug(`Pattern to search test assemblies: ${searchFolder + testAssembly}`)
    const searchResult = await findFilesToUpload(searchFolder + testAssembly)
    
    return searchResult.filesToUpload
  } catch (err: unknown) {
    core.error(err instanceof Error ? err.message : "Unknown error type")
  }
  return []
}
