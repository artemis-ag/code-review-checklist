const marked = require('marked');

module.exports.listCompleted = (list) => list.items.some(({ checked }) => checked)

module.exports.listsFromMarkdown = (markdown) => {
  const parsedMarkdown = marked.lexer(markdown, { gfm: true });
  const topLevelLists = parsedMarkdown.filter(token => token.type === 'list')

  // get top level lists
  const topLevelChecklists = topLevelLists.filter(list => list.items[0] && list.items[0].task)
  const nonTopLevelChecklists = topLevelLists.filter(list => list.items[0] && !list.items[0].task)
                                             .map(list => list.items)
                                             .reduce((acc, val) => acc.concat(val), [])
                                             .map(nestedList => nestedList.tokens && nestedList.tokens[1])
                                             .filter(list => list.items && list.items[0] && list.items[0].task)



  return topLevelChecklists.concat(nonTopLevelChecklists)
}
