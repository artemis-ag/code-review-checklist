const marked = require('marked');

module.exports = (app) => {
  // watch for pull requests & their changes
  app.on(['pull_request.opened', 'pull_request.edited', 'pull_request.synchronize'], async context => {
    const startTime = (new Date).toISOString();

    // lookup the pr body/description
    const pr = context.payload.pull_request;
    const body = pr.body;

    const parsedMarkdown = marked.lexer(body, { gfm: true });
    const lists = parsedMarkdown.filter(token => {
      // any bullet lists with checklist items underneath
      if (token.type === 'list') {
        const optionItems = token.items[1]
        return optionItems && optionItems.type === 'list'
      }
    });

    // needs at least 1 checklist
    const hasLists = lists.length > 0

    let hasListCheck = {
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
    };

    context.github.checks.create(context.repo(hasListCheck))

    if (!hasLists) { return }

    // check if all checklists are completed
    const guideComplete = lists.every(list => token.items[1].items.some(item => item.checked === true));

    let guideCheck = {
      name: 'pr-review-guide-completed',
      head_sha: pr.head.sha,
      started_at: startTime,
      status: 'in_progress',
      output: {
        title: 'PR Review in progress',
        summary: 'The PR Guide still needs to be completed',
        text: 'Please check off the relevant items in the PR Guide'
      }
    };

    // all finished?
    if (guideComplete) {
      check.status = 'completed';
      check.conclusion = 'success';
      check.completed_at = (new Date).toISOString();
      check.output.title = 'PR Review complete';
      check.output.summary = 'The PR Guide has been completed';
    };

    // send check back to GitHub
    return context.github.checks.create(context.repo(guideCheck));
  });
};
