const path = require('path');

/**
 * A dry-run writer that records what would be written without touching the filesystem.
 * Useful for previewing scaffold output before committing changes.
 */
class DryRunWriter {
  constructor() {
    /** @type {Array<{ path: string, content: string }>} */
    this._records = [];
  }

  /**
   * Records a single file write operation.
   * @param {string} filePath
   * @param {string} content
   * @param {{ overwrite?: boolean }} [options]
   */
  writeFile(filePath, content, options = {}) {
    const absPath = path.resolve(filePath);
    const existing = this._records.find((r) => r.path === absPath);

    if (existing && !options.overwrite) {
      throw new Error(`Dry-run conflict: ${absPath} would be written more than once.`);
    }

    if (existing) {
      existing.content = content;
    } else {
      this._records.push({ path: absPath, content });
    }

    return absPath;
  }

  /**
   * Records multiple file write operations.
   * @param {Array<{ path: string, content: string }>} files
   * @param {{ overwrite?: boolean, baseDir?: string }} [options]
   * @returns {string[]}
   */
  writeFiles(files, options = {}) {
    const { overwrite = false, baseDir = process.cwd() } = options;

    if (!Array.isArray(files) || files.length === 0) {
      throw new Error('writeFiles requires a non-empty array of file descriptors.');
    }

    return files.map(({ path: filePath, content }) => {
      const resolvedPath = path.isAbsolute(filePath)
        ? filePath
        : path.join(baseDir, filePath);
      return this.writeFile(resolvedPath, content, { overwrite });
    });
  }

  /** Returns all recorded file operations. */
  getRecords() {
    return [...this._records];
  }

  /** Clears all recorded operations. */
  reset() {
    this._records = [];
  }

  /**
   * Prints a summary of what would be written.
   * @param {{ logger?: (msg: string) => void }} [options]
   */
  printSummary(options = {}) {
    const log = options.logger || console.log;
    log(`Dry-run summary — ${this._records.length} file(s) would be written:`);
    this._records.forEach((r) => log(`  [write] ${r.path}`));
  }
}

module.exports = { DryRunWriter };
