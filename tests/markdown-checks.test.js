const marked = require('marked');

const { listCompleted, listsFromMarkdown } = require('./../lib/markdown-checks')

const {
  uncompleteCheckListMarkdown,
  partiallyCompletedCheckListMarkdown,
  completedCheckListMarkdown
} = require('./fixtures/markdown')

const {
  completedList,
  uncompletedList
} = require('./fixtures/json')

describe('listsFromMarkdown', () => {
  it('parses the correct number of lists', () => {
    const parsedLists = listsFromMarkdown(uncompleteCheckListMarkdown)
    expect(parsedLists.length).toEqual(3)
  })
})

describe('listCompleted', () => {
  it('correctly identifies a parsed list as uncompleted', () => {
    expect(listCompleted(uncompletedList)).toBeFalsy()
  })

  it('correctly identifies a parsed list as completed', () => {
    expect(listCompleted(completedList)).toBeTruthy()
  })
})

describe('parsing and analyzing a list', () => {
  it('correctly identifies uncompleted markdown as uncompleted', () => {
    const parsedLists = listsFromMarkdown(uncompleteCheckListMarkdown)
    expect(parsedLists.every(listCompleted)).toBeFalsy()
  })

  it('correctly identifies partially completed markdown as uncompleted', () => {
    const parsedLists = listsFromMarkdown(partiallyCompletedCheckListMarkdown)
    expect(parsedLists.every(listCompleted)).toBeFalsy()
  })

  it('correctly identifies completed markdown as uncompleted', () => {
    const parsedLists = listsFromMarkdown(completedCheckListMarkdown)
    expect(parsedLists.every(listCompleted)).toBeTruthy()
  })
})
