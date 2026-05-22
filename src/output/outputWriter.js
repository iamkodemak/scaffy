const fs = require('fs');
const path = require('path');

/**
 * Ensures a directory exists, creating it recursively if needed.
 * @param {string} dirPath
 */
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Writes a single file to disk, creating parent directories as needed.
 * @param {string} filePath - Absolute or relative path to write.
 * @param {string} content  - File content.
 * @param {{ overwrite?: boolean }} [options]
 */
function writeFile(filePath, content, options = {}) {
  const { overwrite = false } = options;
  const absPath = path.resolve(filePath);

  if (!overwrite && fs.existsSync(absPath)) {
    throw new Error(`File already exists: ${absPath}. Use overwrite option to replace it.`);
  }

  ensureDir(path.dirname(absPath));
  fs.writeFileSync(absPath, content, 'utf8');
  return absPath;
}

/**
 * Writes multiple files described as an array of { path, content } objects.
 * @param {Array<{ path: string, content: string }>} files
 * @param {{ overwrite?: boolean, baseDir?: string }} [options]
 * @returns {string[]} List of absolute paths written.
 */
function writeFiles(files, options = {}) {
  const { overwrite = false, baseDir = process.cwd() } = options;

  if (!Array.isArray(files) || files.length === 0) {
    throw new Error('writeFiles requires a non-empty array of file descriptors.');
  }

  return files.map(({ path: filePath, content }) => {
    const resolvedPath = path.isAbsolute(filePath)
      ? filePath
      : path.join(baseDir, filePath);
    return writeFile(resolvedPath, content, { overwrite });
  });
}

module.exports = { ensureDir, writeFile, writeFiles };
