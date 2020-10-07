const core = require('@actions/core');
const action = require('./action');

// most @actions toolkit packages have async methods
async function run() {
  try {
    const inputFolder = core.getInput('folder');
    const inputWorkspace = core.getInput('workspace');
    const inputDryRun = core.getInput('dry-run');
    const inputVerbosity = core.getInput('verbosity');
    const inputFailFast = core.getInput('fail-fast');
    const enableAnnotations = core.getInput('enable-annotations');

    await action.execute(inputFolder, inputWorkspace, inputDryRun, inputVerbosity, inputFailFast, enableAnnotations);
  } catch (error) {
    core.setFailed(error);
  }
}

run();
