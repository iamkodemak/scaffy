function formatScaffoldSummary(result) {
  const { files, variables, dryRun } = result;
  const lines = [];

  lines.push(dryRun ? '=== Dry Run Summary ===' : '=== Scaffold Summary ===');
  lines.push('');
  lines.push(`Files ${dryRun ? 'that would be written' : 'written'}: ${files.length}`);

  for (const file of files) {
    const filePath = file.path || file.name || '(unknown)';
    lines.push(`  - ${filePath}`);
  }

  lines.push('');
  lines.push('Variables used:');
  const varEntries = Object.entries(variables);
  if (varEntries.length === 0) {
    lines.push('  (none)');
  } else {
    for (const [key, value] of varEntries) {
      lines.push(`  ${key}: ${JSON.stringify(value)}`);
    }
  }

  if (dryRun) {
    lines.push('');
    lines.push('No files were written (dry run mode).');
  }

  return lines.join('\n');
}

function printScaffoldSummary(result, logger = console) {
  logger.log(formatScaffoldSummary(result));
}

module.exports = { formatScaffoldSummary, printScaffoldSummary };
