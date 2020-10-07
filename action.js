const exec = require('@actions/exec');
const path = require('path');


function checkArgumentsValidity(inputFolder, inputWorkspace, inputVerbosity) {
  const hasInputFolder = inputFolder !== ''
  const hasInputWorkspace = inputWorkspace !== ''

  if (hasInputFolder && hasInputWorkspace) {
    throw "You cannot have 'folder' and 'workspace' defined at the same time!";
  }

  const validVerbosity = ['', 'q', 'quiet', 'm', 'minimal', 'n', 'normal', 'd', 'detailed', 'diag', 'diagnostic']

  let isVerbosityValid = false;

  for (const value in validVerbosity) {
    if (inputVerbosity === validVerbosity[value]) {
      isVerbosityValid = true;
      break;
    }
  }

  if (!isVerbosityValid) {
    throw "'verbosity' value isn't valid!"
  }
}

function constructCommandLineArguments(inputFolder, inputWorkspace, inputDryRun, inputVerbosity) {
  let result = ['format', '--check']

  if (inputFolder !== '') {
    result.push('--folder')
    result.push(inputFolder)
  } else if (inputWorkspace !== '') {
    result.push('--workspace')
    result.push(inputWorkspace)
  }

  if (inputDryRun == true) {
    result.push('--dry-run')
  }

  if (inputVerbosity !== '') {
    result.push('--verbosity')
    result.push(inputVerbosity)
  }

  return result;
}

async function execute(inputFolder, inputWorkspace, inputDryRun, inputVerbosity, inputFailFast, enableAnnotations) {
  checkArgumentsValidity(inputFolder, inputWorkspace, inputVerbosity);

  const commandLineArguments = constructCommandLineArguments(inputFolder, inputWorkspace, inputDryRun, inputVerbosity);

  const execOptions = {
    ignoreReturnCode: true,
  };

  let targetBaseDirectory = '';

  // If workspace is specified, we need to append the base directory to all dotnet format errors.
  if (inputWorkspace !== '') {
    targetBaseDirectory = path.dirname(inputWorkspace);
  }


  execOptions.listeners = {
    stdout: (data) => {
      if (enableAnnotations) {
        const output = data.toString()
        const regex = /(.*)\((.*),(.*)\): (.*)/gm

        let match;

        while ((match = regex.exec(output)) !== null) {
          if (match.index === regex.lastIndex) {
              regex.lastIndex++;
          }

          const fileName = match[1].trim();
          const lineNumber = match[2];
          const colNumber = match[3];
          const message = match[4];
          console.log("::error file=" + path.join(targetBaseDirectory, fileName) + ",line=" + lineNumber + ",col=" + colNumber + "::" + message)
        }
      }
    },
  };

  console.log(commandLineArguments)
  let result = await exec.exec('dotnet', commandLineArguments, execOptions)

  if (result && inputFailFast) {
    throw "Formatting error found!"
  }
}



module.exports = {
  'execute': execute
};
