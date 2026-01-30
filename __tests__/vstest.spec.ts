import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import type * as glob from '@actions/glob'
import { jest } from '@jest/globals'
import { when } from 'jest-when'
import mock from 'mock-fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const coreMock = {
  debug: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  getInput: jest.fn(),
  setFailed: jest.fn(),
  warning: jest.fn()
}

jest.unstable_mockModule('@actions/core', () => coreMock)

const core = await import('@actions/core')
const Search = await import('../src/search')
const { Inputs, NoFileOptions } = await import('../src/constants')
const { uploadArtifact } = await import('../src/uploadArtifact')


describe('vstest Action Unit Tests', ()=>{

  beforeEach(() => {
      jest.clearAllMocks()
  })
  
  afterEach(() => {
      jest.resetAllMocks()
  })

  it('test filesToUpload with valid filenames', async () => {
      // Arrange
      const expectFiles:string[] = [
        "C:\\Source\\Repos\\vstest-action\\tempFolder\\A.txt",
        "C:\\Source\\Repos\\vstest-action\\tempFolder\\Program.cs",
        "C:\\Source\\Repos\\vstest-action\\tempFolder\\vstest-functional-test.csproj"
    ] 
      jest.mock('fs')
      mock({
            // Recursively loads all node_modules
          'node_modules': mock.load(path.resolve(__dirname, '../node_modules')),
          'tempFolder': {
              'A.txt': '# Hello world!',                
              'Program.cs': `using Microsoft.VisualStudio.TestTools.UnitTesting;
              namespace SimpleTestProject
              {
                  [TestClass]
                  public class UnitTest1
                  {
                      [TestMethod]
                      public void TestMethod1()
                      {
                      }
                  }
              }`,
              'vstest-functional-test.csproj': `<Project Sdk="Microsoft.NET.Sdk">

              <PropertyGroup>
                <TargetFramework>net6.0</TargetFramework>
                <Nullable>enable</Nullable>
            
                <IsPackable>false</IsPackable>
              </PropertyGroup>
            
              <ItemGroup>
                <PackageReference Include="Microsoft.NET.Test.Sdk" Version="16.11.0" />
                <PackageReference Include="MSTest.TestAdapter" Version="2.2.7" />
                <PackageReference Include="MSTest.TestFramework" Version="2.2.7" />
                <PackageReference Include="coverlet.collector" Version="3.1.0" />
              </ItemGroup>
            
            </Project>`
          }
      })

      const searchFolder = "tempFolder" as string

      // Act
      const result = await Search.findFilesToUpload(searchFolder)

      // Assert
      expect(result.filesToUpload.length).toEqual(expectFiles.length)
      expect(result.filesToUpload[0].split("\\").slice(-1)).toEqual(expectFiles[0].split("\\").slice(-1))
      mock.restore()
  })

  it('test filesToUpload with filenames that conflict', async () => {
      // Arrange
      const expectFiles:string[] = [
          "C:\\Source\\Repos\\vstest-action\\tempFolder\\A.txt",
          "C:\\Source\\Repos\\vstest-action\\tempFolder\\Program.cs",
          "C:\\Source\\Repos\\vstest-action\\tempFolder\\a.txt",
          "C:\\Source\\Repos\\vstest-action\\tempFolder\\vstest-functional-test.csproj"
      ] 
      jest.mock('fs')
      mock({
            // Recursively loads all node_modules
          'node_modules': mock.load(path.resolve(__dirname, '../node_modules')),
          'tempFolder': {
              'A.txt': '# Hello world!',                
              'a.txt': '# hello world!',
              'Program.cs': `using Microsoft.VisualStudio.TestTools.UnitTesting;
              namespace SimpleTestProject
              {
                  [TestClass]
                  public class UnitTest1
                  {
                      [TestMethod]
                      public void TestMethod1()
                      {
                      }
                  }
              }`,
              'vstest-functional-test.csproj': `<Project Sdk="Microsoft.NET.Sdk">

              <PropertyGroup>
                <TargetFramework>net6.0</TargetFramework>
                <Nullable>enable</Nullable>
            
                <IsPackable>false</IsPackable>
              </PropertyGroup>
            
              <ItemGroup>
                <PackageReference Include="Microsoft.NET.Test.Sdk" Version="16.11.0" />
                <PackageReference Include="MSTest.TestAdapter" Version="2.2.7" />
                <PackageReference Include="MSTest.TestFramework" Version="2.2.7" />
                <PackageReference Include="coverlet.collector" Version="3.1.0" />
              </ItemGroup>
            
            </Project>`
          }
      })

      const searchFolder = "tempFolder" as string
      const globOptions : glob.GlobOptions = 
      {
          followSymbolicLinks:false,
          implicitDescendants: false,
          omitBrokenSymbolicLinks: false
      }

      // Act
      const result = await Search.findFilesToUpload(searchFolder)

      // Assert        
      expect(result.filesToUpload.length).toEqual(expectFiles.length)
      expect(result.filesToUpload[0].split("\\").slice(-1)).toEqual(expectFiles[0].split("\\").slice(-1))
      mock.restore()
  })
  
  it('test filesToUpload with complex search folder', async () => {
      // Arrange
      const expectFiles:string[] = [
          "C:\\Source\\Repos\\vstest-action\\base1\\folder1\\A.txt",
          "C:\\Source\\Repos\\vstest-action\\base1\\folder1\\Program.cs",
          "C:\\Source\\Repos\\vstest-action\\base1\\folder1\\vstest-functional-test.csproj",
          "C:\\Source\\Repos\\vstest-action\\base2\\folder2\\A.txt",
          "C:\\Source\\Repos\\vstest-action\\base2\\folder2\\Program.cs",
          "C:\\Source\\Repos\\vstest-action\\base2\\folder2\\vstest-functional-test.csproj"
      ] 
      jest.mock('fs')
      mock({
            // Recursively loads all node_modules
          'node_modules': mock.load(path.resolve(__dirname, '../node_modules')),
          'base1/folder1/': {
              'A.txt': '# Hello world!',                
              'Program.cs': `using Microsoft.VisualStudio.TestTools.UnitTesting;
              namespace SimpleTestProject
              {
                  [TestClass]
                  public class UnitTest1
                  {
                      [TestMethod]
                      public void TestMethod1()
                      {
                      }
                  }
              }`,
              'vstest-functional-test.csproj': `<Project Sdk="Microsoft.NET.Sdk">

              <PropertyGroup>
                <TargetFramework>net6.0</TargetFramework>
                <Nullable>enable</Nullable>
            
                <IsPackable>false</IsPackable>
              </PropertyGroup>
            
              <ItemGroup>
                <PackageReference Include="Microsoft.NET.Test.Sdk" Version="16.11.0" />
                <PackageReference Include="MSTest.TestAdapter" Version="2.2.7" />
                <PackageReference Include="MSTest.TestFramework" Version="2.2.7" />
                <PackageReference Include="coverlet.collector" Version="3.1.0" />
              </ItemGroup>
            
            </Project>`
          },
          'base2/folder2/': {
              'A.txt': '# Hello world!',                
              'Program.cs': `using Microsoft.VisualStudio.TestTools.UnitTesting;
              namespace SimpleTestProject
              {
                  [TestClass]
                  public class UnitTest1
                  {
                      [TestMethod]
                      public void TestMethod1()
                      {
                      }
                  }
              }`,
              'vstest-functional-test.csproj': `<Project Sdk="Microsoft.NET.Sdk">

              <PropertyGroup>
                <TargetFramework>net6.0</TargetFramework>
                <Nullable>enable</Nullable>
            
                <IsPackable>false</IsPackable>
              </PropertyGroup>
            
              <ItemGroup>
                <PackageReference Include="Microsoft.NET.Test.Sdk" Version="16.11.0" />
                <PackageReference Include="MSTest.TestAdapter" Version="2.2.7" />
                <PackageReference Include="MSTest.TestFramework" Version="2.2.7" />
                <PackageReference Include="coverlet.collector" Version="3.1.0" />
              </ItemGroup>
            
            </Project>`
          }            
      })

      const searchPatterns: string[] = ['base1/folder1/*', 'base2/folder2/*']
      const searchFolder: string = searchPatterns.join('\n')
      const globOptions : glob.GlobOptions = 
      {
          followSymbolicLinks:false,
          implicitDescendants: true,
          omitBrokenSymbolicLinks: false
      }

      // Act
      const result = await Search.findFilesToUpload(searchFolder, globOptions)

      // Assert        
      expect(result.filesToUpload.length).toEqual(expectFiles.length)
      expect(result.filesToUpload[0].split("\\").slice(-1)).toEqual(expectFiles[0].split("\\").slice(-1))
      mock.restore()
  })

  test.each([[NoFileOptions.warn, core.warning], [NoFileOptions.error, core.setFailed], [NoFileOptions.ignore, core.info]])('test uploadArtifact with ifNoFilesFound set to %s',  async (a, expected) => {
    // Arrange
    jest.mock('fs')
    mock({
          // Recursively loads all node_modules
        'node_modules': mock.load(path.resolve(__dirname, '../node_modules')),
        'tempFolder': {
            'A.txt': '# Hello world!',                
            'Program.cs': `using Microsoft.VisualStudio.TestTools.UnitTesting;
            namespace SimpleTestProject
            {
                [TestClass]
                public class UnitTest1
                {
                    [TestMethod]
                    public void TestMethod1()
                    {
                    }
                }
            }`,
            'vstest-functional-test.csproj': `<Project Sdk="Microsoft.NET.Sdk">

            <PropertyGroup>
              <TargetFramework>net6.0</TargetFramework>
              <Nullable>enable</Nullable>
          
              <IsPackable>false</IsPackable>
            </PropertyGroup>
          
            <ItemGroup>
              <PackageReference Include="Microsoft.NET.Test.Sdk" Version="16.11.0" />
              <PackageReference Include="MSTest.TestAdapter" Version="2.2.7" />
              <PackageReference Include="MSTest.TestFramework" Version="2.2.7" />
              <PackageReference Include="coverlet.collector" Version="3.1.0" />
            </ItemGroup>
          
          </Project>`
        }
    })
    
    const coreGetInputMock = coreMock.getInput;
    when(coreGetInputMock)
    .calledWith(Inputs.Name).mockReturnValue('vstest-functional-test.csproj')
    .calledWith(Inputs.IfNoFilesFound).mockReturnValue('warn')
    .calledWith(Inputs.RetentionDays).mockReturnValue('30');

    // Act
    uploadArtifact();

    // Assert
    expect(expected).toBeCalled
  });

})
