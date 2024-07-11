import * as core from '@actions/core';

export function getArguments(): string {
  let args = ''
  const testFiltercriteria = core.getInput('testFiltercriteria')
  if(testFiltercriteria) {
    args += `/TestCaseFilter:${testFiltercriteria} `
  }

  const runSettingsFile = core.getInput('runSettingsFile')
  if(runSettingsFile) {
    args += `/Settings:${runSettingsFile} `
  }

  const pathToCustomTestAdapters = core.getInput('pathToCustomTestAdapters')
  if(pathToCustomTestAdapters) {
    args += `/TestAdapterPath:${pathToCustomTestAdapters} `
  }

  const runInParallel = core.getInput('runInParallel')
  if(runInParallel && runInParallel.toUpperCase() === "TRUE") {
    args += `/Parallel `
  }

  const runTestsInIsolation = core.getInput('runTestsInIsolation')
  if(runTestsInIsolation && runTestsInIsolation.toUpperCase() === "TRUE") {
    args += `/InIsolation `
  }

  const codeCoverageEnabled = core.getInput('codeCoverageEnabled')
  if(codeCoverageEnabled && codeCoverageEnabled.toUpperCase() === "TRUE") {
    args += `/EnableCodeCoverage `
  }

  const platform = core.getInput('platform')
  if(platform && (platform === "x86" || platform === "x64" || platform === "ARM")) {
    args += `/Platform:${platform} `
  }

  const otherConsoleOptions = core.getInput('otherConsoleOptions')
  if(otherConsoleOptions) {
    args += `${otherConsoleOptions} `
  }

  return args
}

