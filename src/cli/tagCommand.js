/**
 * tagCommand.js
 * CLI command handler for managing and querying scaffold template tags.
 */

const {
  registerTags,
  getTags,
  findByTags,
  listAllTags,
  removeTags,
} = require('../scaffold/scaffoldTagManager');

/**
 * Handle the `tag` CLI command.
 * @param {object} args - Parsed CLI arguments
 * @param {object} [out=console] - Output interface
 */
function tagCommand(args, out = console) {
  const subcommand = args._[1];

  switch (subcommand) {
    case 'add': {
      const { template, tags } = args;
      if (!template) return out.error('--template is required');
      if (!tags) return out.error('--tags is required (comma-separated)');
      const tagList = tags.split(',').map(t => t.trim()).filter(Boolean);
      registerTags(template, tagList);
      out.log(`Tags [${tagList.join(', ')}] registered for template "${template}".`);
      break;
    }

    case 'get': {
      const { template } = args;
      if (!template) return out.error('--template is required');
      const result = getTags(template);
      if (result.length === 0) {
        out.log(`No tags found for template "${template}".`);
      } else {
        out.log(`Tags for "${template}": ${result.join(', ')}`);
      }
      break;
    }

    case 'find': {
      const { tags } = args;
      if (!tags) return out.error('--tags is required (comma-separated)');
      const tagList = tags.split(',').map(t => t.trim()).filter(Boolean);
      const matches = findByTags(tagList);
      if (matches.length === 0) {
        out.log(`No templates found with tags: ${tagList.join(', ')}`);
      } else {
        out.log(`Templates matching [${tagList.join(', ')}]: ${matches.join(', ')}`);
      }
      break;
    }

    case 'list': {
      const all = listAllTags();
      if (all.length === 0) {
        out.log('No tags registered.');
      } else {
        out.log(`All tags: ${all.join(', ')}`);
      }
      break;
    }

    case 'remove': {
      const { template } = args;
      if (!template) return out.error('--template is required');
      removeTags(template);
      out.log(`Tags removed for template "${template}".`);
      break;
    }

    default:
      out.error(`Unknown tag subcommand: "${subcommand}". Use add, get, find, list, or remove.`);
  }
}

module.exports = { tagCommand };
