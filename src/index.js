const PATTERN = /console\.(log|error|warn|info)/g;

/**
 * Danger plugin to prevent merging code that still has `console.log`s inside it.
 */
export default async function noConsole(options = {}) {
  const whitelist = options.whitelist || [];
  if (!Array.isArray(whitelist)) throw new Error('[danger-plugin-no-console] whitelist option has to be an array.');

  const files = danger.git.modified_files.concat(danger.git.created_files)
  const contents = await Promise.all(
    files.map(file => danger.github.utils.fileContents(file).then(content => ({
      file,
      content,
    })))
  )

  contents.forEach(({ file, content }) => {
    let matches = content.match(PATTERN);
    if (!matches) return;
    matches = matches.filter(match => !whitelist.includes(PATTERN.exec(match)[1]));
    if (matches.length === 0) return;

    fail(`${matches.length} console statement(s) left in ${file}.`);
  })
}
