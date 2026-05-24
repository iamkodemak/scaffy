/**
 * scaffoldProgressBar.js
 * Renders a simple ASCII progress bar from scaffold progress data.
 */

const STATUS_ICONS = {
  pending: '○',
  running: '◑',
  done: '●',
  failed: '✗',
};

function renderBar(percent, width = 20) {
  if (typeof percent !== 'number' || percent < 0 || percent > 100) {
    throw new Error('percent must be a number between 0 and 100');
  }
  const filled = Math.round((percent / 100) * width);
  const empty = width - filled;
  return `[${'█'.repeat(filled)}${'░'.repeat(empty)}] ${percent}%`;
}

function renderStepList(steps) {
  if (!Array.isArray(steps)) throw new Error('steps must be an array');
  return steps
    .map(s => {
      const icon = STATUS_ICONS[s.status] || '?';
      const suffix = s.status === 'failed' ? ` (${s.error})` : '';
      return `  ${icon} ${s.label}${suffix}`;
    })
    .join('\n');
}

function renderProgress(steps, summary, output = process.stdout) {
  const bar = renderBar(summary.percent);
  const stepList = renderStepList(steps);
  const lines = [
    `Progress: ${bar}  (${summary.done}/${summary.total} steps)`,
    stepList,
  ].join('\n');
  if (output && typeof output.write === 'function') {
    output.write(lines + '\n');
  }
  return lines;
}

module.exports = { renderBar, renderStepList, renderProgress };
