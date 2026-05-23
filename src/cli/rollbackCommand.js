const { parseArgs } = require('./parseArgs');
const { rollbackLastRun, rollbackFiles } = require('../scaffold/scaffoldRollback');
const { setLogLevel, setLogOutput } = require('../scaffold/scaffoldLogger');

/**
 * Handles the `scaffy rollback` CLI sub-command.
 *
 * Usage:
 *   scaffy rollback [--dry-run] [--files file1 file2 ...]
 */
async function rollbackCommand(argv = process.argv.slice(2), options = {}) {
  const args = parseArgs(argv);
  const dryRun = args.flags['dry-run'] || args.flags['dryRun'] || false;
  const explicitFiles = args.positional.length > 0 ? args.positional : null;

  const logger = options.logger || {
    log: (msg) => console.log(msg),
    error: (msg) => console.error(msg),
  };

  if (options.logLevel) {
    setLogLevel(options.logLevel);
  }

  if (options.logOutput) {
    setLogOutput(options.logOutput);
  }

  try {
    let result;

    if (explicitFiles) {
      logger.log(`Rolling back ${explicitFiles.length} specified file(s)...`);
      result = await rollbackFiles(explicitFiles, { dryRun, logger });
    } else {
      logger.log('Rolling back last scaffold run...');
      result = await rollbackLastRun({ dryRun, logger });
    }

    logger.log(
      `Rollback complete. Removed: ${result.removed.length}, Failed: ${result.failed.length}`
    );

    if (result.failed.length > 0) {
      result.failed.forEach(({ filePath, error }) => {
        logger.error(`  ✗ ${filePath}: ${error}`);
      });
      return { success: false, ...result };
    }

    return { success: true, ...result };
  } catch (err) {
    logger.error(`Rollback failed: ${err.message}`);
    return { success: false, removed: [], failed: [], error: err.message };
  }
}

module.exports = { rollbackCommand };
