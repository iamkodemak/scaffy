const fs = require('fs');
const path = require('path');

/**
 * Computes a simple line-based diff between existing file content and new content.
 * Returns an object describing additions, deletions, and whether the file is new.
 */
function diffContent(existingContent, newContent) {
  if (existingContent === null) {
    return { isNew: true, additions: newContent.split('\n').length, deletions: 0, hunks: [] };
  }

  const oldLines = existingContent.split('\n');
  const newLines = newContent.split('\n');

  const hunks = [];
  let additions = 0;
  let deletions = 0;

  const maxLen = Math.max(oldLines.length, newLines.length);
  for (let i = 0; i < maxLen; i++) {
    const oldLine = oldLines[i] !== undefined ? oldLines[i] : null;
    const newLine = newLines[i] !== undefined ? newLines[i] : null;

    if (oldLine === null) {
      hunks.push({ type: 'add', lineNo: i + 1, content: newLine });
      additions++;
    } else if (newLine === null) {
      hunks.push({ type: 'remove', lineNo: i + 1, content: oldLine });
      deletions++;
    } else if (oldLine !== newLine) {
      hunks.push({ type: 'remove', lineNo: i + 1, content: oldLine });
      hunks.push({ type: 'add', lineNo: i + 1, content: newLine });
      additions++;
      deletions++;
    }
  }

  return { isNew: false, additions, deletions, hunks };
}

/**
 * Computes diffs for a map of { filePath -> newContent } against the filesystem.
 * @param {Record<string, string>} files
 * @param {string} baseDir
 * @returns {Record<string, object>}
 */
function diffFiles(files, baseDir = process.cwd()) {
  const results = {};

  for (const [filePath, newContent] of Object.entries(files)) {
    const absolutePath = path.resolve(baseDir, filePath);
    let existingContent = null;

    if (fs.existsSync(absolutePath)) {
      existingContent = fs.readFileSync(absolutePath, 'utf8');
    }

    results[filePath] = diffContent(existingContent, newContent);
  }

  return results;
}

/**
 * Formats a diff result into a human-readable string.
 * @param {string} filePath
 * @param {object} diff
 * @returns {string}
 */
function formatDiff(filePath, diff) {
  const lines = [];
  const status = diff.isNew ? '[NEW]' : '[MODIFIED]';
  lines.push(`${status} ${filePath} (+${diff.additions} -${diff.deletions})`);

  for (const hunk of diff.hunks) {
    const prefix = hunk.type === 'add' ? '+' : '-';
    lines.push(`  ${prefix} ${hunk.lineNo}: ${hunk.content}`);
  }

  return lines.join('\n');
}

module.exports = { diffContent, diffFiles, formatDiff };
