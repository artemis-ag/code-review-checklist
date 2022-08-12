const { listCompleted, listsFromMarkdown } = require('./lib/markdown-checks')

module.exports = (app) => {
  // watch for pull requests & their changes
  app.on(['pull_request.opened', 'pull_request.edited', 'pull_request.synchronize'], async context => {
    const startTime = (new Date()).toISOString()

    // lookup the pr body/description
    const pr = context.payload.pull_request
    const lists = listsFromMarkdown(pr.body)

    // needs at least 1 checklist
    const hasLists = lists.length > 0

    const hasListCheck = {
      name: 'pr-review-guide-created',
      head_sha: pr.head.sha,
      started_at: startTime,
      status: 'completed',
      conclusion: hasLists ? 'success' : 'failure',
      output: {
        title: 'PR Review Guide',
        summary: 'PRs should have a guide for reviewers',
        text: 'Please make a thoughtful review guide for your reviewer'
      }
    }

    context.octokit.checks.create(context.repo(hasListCheck))

    if (!hasLists) { return }

    // check if all checklists are completed
    const guideComplete = lists.every(listCompleted)

    const guideCheck = {
      name: 'pr-review-guide-completed',
      head_sha: pr.head.sha,
      started_at: startTime,
      status: 'in_progress',
      output: {
        title: 'PR Review in progress',
        summary: 'The PR Guide still needs to be completed',
        text: 'Please check off the relevant items in the PR Guide'
      }
    }

    // all finished?
    if (guideComplete) {
      guideCheck.status = 'completed'
      guideCheck.conclusion = 'success'
      guideCheck.completed_at = (new Date()).toISOString()
      guideCheck.output.title = 'PR Review complete'
      guideCheck.output.summary = 'The PR Guide has been completed'
    };

    // send check back to GitHub
    return context.octokit.checks.create(context.repo(guideCheck))
  })
}
