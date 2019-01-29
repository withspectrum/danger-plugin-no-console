const PATTERN = /console\.(log|error|warn|info)/
const GLOBAL_PATTERN = new RegExp(PATTERN.source, 'g')
const JS_FILE = /\.(js|ts)x?$/i

const findConsole = (content, whitelist) => {
  let matches = content.match(GLOBAL_PATTERN)
  if (!matches) return []

  matches = matches.filter(match => {
    const singleMatch = PATTERN.exec(match)
    if (!singleMatch || singleMatch.length === 0) return false
    return !whitelist.includes(singleMatch[1])
  })

  return matches
}

/**
 * Danger plugin to prevent merging code that still has `console.log`s inside it.
 */
export default async function noConsole(options = {}) {
  const whitelist = options.whitelist || []
  if (!Array.isArray(whitelist))
    throw new Error(
      '[danger-plugin-no-console] whitelist option has to be an array.',
    )

  const diffs = danger.git.created_files
    .concat(danger.git.modified_files)
    .filter(file => JS_FILE.test(file))
    .map(file => {
      return danger.git.diffForFile(file).then(diff => ({
        file,
        diff,
      }))
    })

  const additions = await Promise.all(diffs)

  additions
    .filter(({ diff }) => !!diff)
    .forEach(({ file, diff }) => {
      const matches = findConsole(diff.added, whitelist)
      if (matches.length === 0) return

      fail(`${matches.length} console statement(s) added in ${file}.`)
    })
}
