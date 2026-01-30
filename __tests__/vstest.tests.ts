import * as fs from 'node:fs';
import {jest} from '@jest/globals';
import {when} from 'jest-when';

const coreMock = {
  debug: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  getInput: jest.fn(),
  setFailed: jest.fn(),
  warning: jest.fn()
};
const execMock = {
  exec: jest.fn(),
  getExecOutput: jest.fn()
};
const globMock = {
  create: jest.fn()
};
const searchMock = {
  findFilesToUpload: jest.fn()
};

jest.unstable_mockModule('@actions/core', () => coreMock);
jest.unstable_mockModule('@actions/exec', () => execMock);
jest.unstable_mockModule('@actions/glob', () => globMock);
jest.unstable_mockModule('../src/search', () => searchMock);

const core = await import('@actions/core');
const exec = await import('@actions/exec');
const glob = await import('@actions/glob');
const Search = await import('../src/search');
const {getInputs} = await import('../src/input-helper');
const {Inputs} = await import('../src/constants');
const {uploadArtifact} = await import('../src/uploadArtifact');
const {getTestAssemblies} = await import('../src/getTestAssemblies');
const {getArguments} = await import('../src/getArguments');
// const fs = require('fs')

describe('vstest Action Unit Tests', ()=>{

    beforeEach(() => {
        jest.clearAllMocks();
        searchMock.findFilesToUpload.mockResolvedValue({
            filesToUpload: null,
            rootDirectory: ''
        });
    });
    
    afterEach(() => {
        jest.resetAllMocks();
    })
    
    it("test getArguments with no inputs", async () => {

        // Arrange
        const coreGetInputMock = coreMock.getInput;
        when(coreGetInputMock).calledWith('testFiltercriteria').mockReturnValue('')
        .calledWith('runSettingsFile').mockReturnValue('')
        .calledWith('pathToCustomTestAdapters').mockReturnValue('')
        .calledWith('runInParallel').mockReturnValue('false')
        .calledWith('runTestsInIsolation').mockReturnValue('false')
        .calledWith('codeCoverageEnabled').mockReturnValue('false')
        .calledWith('platform').mockReturnValue('')
        .calledWith('otherConsoleOptions').mockReturnValue('');
    
        // Act
        const args = getArguments();
    
        // Assert
        expect(args).not.toBeNull();
        expect(args).toBe('');
    
    });

    it("test getArguments with all expected inputs", async () => {

        const expectedResult = '/TestCaseFilter:testFilterCriteria /Settings:runSettingsFile /TestAdapterPath:pathToCustomTestAdapters /Parallel /InIsolation /EnableCodeCoverage /Platform:x64 otherConsoleOptions '
        // Arrange
        const coreGetInputMock = coreMock.getInput;
        when(coreGetInputMock).calledWith('testFiltercriteria').mockReturnValue('testFilterCriteria')
        .calledWith('runSettingsFile').mockReturnValue('runSettingsFile')
        .calledWith('pathToCustomTestAdapters').mockReturnValue('pathToCustomTestAdapters')
        .calledWith('runInParallel').mockReturnValue('true')
        .calledWith('runTestsInIsolation').mockReturnValue('true')
        .calledWith('codeCoverageEnabled').mockReturnValue('true')
        .calledWith('platform').mockReturnValue('x64')
        .calledWith('otherConsoleOptions').mockReturnValue('otherConsoleOptions');
    
        // Act
        const args = getArguments();
    
        // Assert
        expect(args).not.toBeNull();
        expect(args).toEqual(expectedResult);
    
    });

    it("test getTestAssemblies with valid searchResults", async () => {

        // Arrange
        const coreGetInputMock = coreMock.getInput;

        when(coreGetInputMock).calledWith('searchFolder').mockReturnValue('folderPath\\')
        .calledWith('testAssembly').mockReturnValue('testFile.sln');

        const returnValue1 = core.getInput('searchFolder');
        const returnValue2 = core.getInput('testAssembly');

        const filesToUploadValue = ["testFile.zip"];
        const rootDirectoryValue = "C:\\Users\\Public\\";

        const searchResults = {
            filesToUpload: filesToUploadValue,
            rootDirectory: rootDirectoryValue
        };

        const findFilesToUploadMock = searchMock.findFilesToUpload;
        when(findFilesToUploadMock).mockResolvedValue(searchResults);

        // Act
        const testAssembly = await getTestAssemblies();

        // Assert
        expect(testAssembly).not.toBeNull()
        findFilesToUploadMock.mockReset()
    });

    it("test getTestAssemblies with empty searchResults", async () => {

        // Arrange
        const coreGetInputMock = coreMock.getInput;

        when(coreGetInputMock).calledWith('searchFolder').mockReturnValue('folderPath\\')
        .calledWith('testAssembly').mockReturnValue('testFile.sln');

        const returnValue1 = core.getInput('searchFolder');
        const returnValue2 = core.getInput('testAssembly');

        const filesToUploadValue = [''];
        const rootDirectoryValue = "C:\\Users\\Public\\";

        const searchResults = {
            filesToUpload: filesToUploadValue,
            rootDirectory: rootDirectoryValue
        };

        const findFilesToUploadMock = searchMock.findFilesToUpload;
        when(findFilesToUploadMock).mockResolvedValue(searchResults);
        const expectedResult : string[] = new Array('');

        // Act
        const testAssembly = await getTestAssemblies();

        // Assert
        expect(testAssembly).toEqual(expectedResult)
        findFilesToUploadMock.mockReset()
    });

    it('getTestAssemblies throws exception', async () => {

        // Arrange
        const coreGetInputMock = coreMock.getInput;

        when(coreGetInputMock).calledWith('searchFolder').mockReturnValue('folderPath\\')
        .calledWith('testAssembly').mockReturnValue('testFile.sln');

        const returnValue1 = core.getInput('searchFolder');
        const returnValue2 = core.getInput('testAssembly');

        const filesToUploadValue = [''];
        const rootDirectoryValue = "C:\\Users\\Public\\";

        const searchResults = {
            filesToUpload: filesToUploadValue,
            rootDirectory: rootDirectoryValue
        };

        const findFilesToUploadMock = searchMock.findFilesToUpload;
        when(findFilesToUploadMock).mockImplementation(() => { throw new Error('Sample Error') });

        const coresStFailedSpyOn = coreMock.setFailed;

        // Act
        const testAssembly = await getTestAssemblies();
        findFilesToUploadMock.mockRestore();
        
        // Assert
        expect(testAssembly.length).toEqual(0)
        findFilesToUploadMock.mockReset()
    })

    it('test getInputs with valid values', async () => {
        // Arrange
        const coreGetInputMock = coreMock.getInput;
        const coreSetFailedMock = coreMock.setFailed;
        when(coreGetInputMock)
        .calledWith(Inputs.Name).mockReturnValue('testFile.sln')
        .calledWith(Inputs.IfNoFilesFound).mockReturnValue('warn')
        .calledWith(Inputs.RetentionDays).mockReturnValue('30');
        
        // Act
        const results = getInputs();

        // Assert
        expect(results).not.toBeNull();

    });

    it('test getInputs with invalid RetentionDays', async () => {
        // Arrange
        const coreGetInputMock = coreMock.getInput;
        const coreSetFailedMock = coreMock.setFailed;
        when(coreGetInputMock)
        .calledWith(Inputs.Name).mockReturnValue('testFile.sln')
        .calledWith(Inputs.IfNoFilesFound).mockReturnValue('warn')
        .calledWith(Inputs.RetentionDays).mockReturnValue('xx');
        
        // Act
        const results = getInputs();

        // Assert
        expect(results).not.toBeNull();

    });
    
    it('test getInputs with ifNoFilesFound values', async () => {
        // Arrange
        const coreGetInputMock = coreMock.getInput;
        const coreSetFailedMock = coreMock.setFailed;
        when(coreGetInputMock)
        .calledWith(Inputs.Name).mockReturnValue('testFile.sln')
        .calledWith(Inputs.IfNoFilesFound).mockReturnValue('ifNoFilesFound')
        .calledWith(Inputs.RetentionDays).mockReturnValue('30');
        
        // Act
        const results = getInputs();

        // Assert
        expect(results).not.toBeNull();

    });

    it('test findFilesToUpload with valid values', async () => {
        // Arrange
        const searchFolder = "C:\\Temp\\" as string;
        
        const globOptions : glob.GlobOptions = 
        {
            followSymbolicLinks:false,
            implicitDescendants: false,
            omitBrokenSymbolicLinks: false
        }

        // var globCreationResultMock = when(globCreateMock).calledWith(searchFolder,globOptions).mockReturnThis
        // var y = when(globCreationResultMock).calledWith().mockReturnValue(rawSearchResults)

        // Act
        const results = await Search.findFilesToUpload(searchFolder, globOptions)

        // Assert
        expect(results).not.toBeNull()

    });

    it('test findFilesToUpload with temp folder', async () => {
        // Arrange
        const searchFolder = "C:\\Temp\\branch1\\folder1\\vstest-functional-test.csproj C:\\Temp\\branch2\\folder2\\vstest-functional-test.csproj" as string
        const globOptions : glob.GlobOptions = 
        {
            followSymbolicLinks:false,
            implicitDescendants: false,
            omitBrokenSymbolicLinks: false
        }

        // Act
        const result = await Search.findFilesToUpload(searchFolder)

        // Assert        
        expect(result.filesToUpload).toBeNull
    })
    
    it('test findFilesToUpload with non-existent folder', async () => {
        // Arrange
        const searchFolder = "" as string

        // Act
        const result = await Search.findFilesToUpload(searchFolder)

        // Assert        
        expect(result.filesToUpload).toBeNull
    })


    it('test findFilesToUpload with temp subfolder', async () => {
        // Arrange
        const searchFolder = "C:\\Temp\\*\\*" as string
        const globOptions : glob.GlobOptions = 
        {
            followSymbolicLinks:false,
            implicitDescendants: false,
            omitBrokenSymbolicLinks: false
        }

        // Act
        const result = await Search.findFilesToUpload(searchFolder, globOptions)

        // Assert        
        expect(result.filesToUpload).toBeNull
    })

    it('test findFilesToUpload with temp folder without glob options', async () => {
        // Arrange
        const searchFolder = "C:\\Temp\\folder1" as string
        const globOptions : glob.GlobOptions = 
        {
            followSymbolicLinks:false,
            implicitDescendants: false,
            omitBrokenSymbolicLinks: false
        }

        // Act
        const result = await Search.findFilesToUpload(searchFolder)

        // Assert        
        expect(result.filesToUpload).toBeNull
    })

    it('test findFilesToUpload with zip file', async () => {
        // Arrange
        const searchFolder = "C:\\Temp\\testCase.zip" as string
        const globOptions : glob.GlobOptions = 
        {
            followSymbolicLinks:false,
            implicitDescendants: false,
            omitBrokenSymbolicLinks: false
        }

        // Act
        const result = await Search.findFilesToUpload(searchFolder, globOptions)

        // Assert        
        expect(result.filesToUpload).toBeNull
    })

    it('test uploadArtifact', async () => {
        coreMock.getInput;

        // Arrange
        const coreGetInputMock = coreMock.getInput;
        when(coreGetInputMock).calledWith('testFiltercriteria').mockReturnValue('')
        .calledWith('runSettingsFile').mockReturnValue('')
        .calledWith('pathToCustomTestAdapters').mockReturnValue('')
        .calledWith('runInParallel').mockReturnValue('false')
        .calledWith('runTestsInIsolation').mockReturnValue('false')
        .calledWith('codeCoverageEnabled').mockReturnValue('false')
        .calledWith('platform').mockReturnValue('')
        .calledWith('otherConsoleOptions').mockReturnValue('');
    
        // Act
        const args = uploadArtifact();
    
        // Assert
        expect(args).not.toBeNull();
    
    });

    it("test uploadArtifact with valid searchResults", async () => {

        // Arrange
        const coreGetInputMock = coreMock.getInput;

        when(coreGetInputMock).calledWith('searchFolder').mockReturnValue('folderPath\\')
        .calledWith('testAssembly').mockReturnValue('testFile.sln');

        const returnValue1 = core.getInput('searchFolder');
        const returnValue2 = core.getInput('testAssembly');

        const filesToUploadValue = ["testFile.zip"];
        const rootDirectoryValue = "C:\\Users\\Public\\";

        const searchResults = {
            filesToUpload: filesToUploadValue,
            rootDirectory: rootDirectoryValue
        };

        const findFilesToUploadMock = searchMock.findFilesToUpload;
        when(findFilesToUploadMock).mockResolvedValue(searchResults);

        // Act
        const testAssembly = await uploadArtifact();

        // Assert
        expect(testAssembly).not.toBeNull()
        findFilesToUploadMock.mockReset()
    });


    // test('test findFilesToUpload with empty searchFolder', async () => {
    //     var searchFolder = "" as string
    
    //     let result = await Search.findFilesToUpload(searchFolder)
    //     expect(result.filesToUpload).toBeNull
    // })
    
    // test('test findFilesToUpload', async () => {
    //     var searchFolder = process.env['RUNNER_SEARCH'] as string

    //     const expectedResult : string[] = new Array('');

    //     // jest.mock('fs');
    //     // jest.spyOn(stat.prototype, 'stats');
    
    //     let result = await Search.findFilesToUpload(searchFolder)
    //     expect(result.filesToUpload).toEqual(expectedResult);
    // })
    
    // test('vstest', async () => {
    //     await run()
    // })
});

