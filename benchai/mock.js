// The one scripted assistant turn every chat kit renders, so results are comparable.
// play() yields kit-neutral events; each libs/<kit>.jsx adapts them to that kit's own data model
// (AI SDK UI message chunks, assistant-ui content parts, AG-UI events…). No network, no API key.

export const PROMPT = 'Summarise our branching policy and clean up stale branches.';
export const FOLLOW_UP = 'Done. **feature/old-nav** was deleted. I kept main, release/* and anything with an open pull request.';
export const TICK_MS = 8;

export const TOOL = { id: 'call_search', name: 'search_docs', args: { query: 'branching policy', limit: 3 },
  result: { results: [
    { title: 'Branching policy', url: 'https://docs.example.com/eng/branching' },
    { title: 'Release process', url: 'https://docs.example.com/eng/releases' },
    { title: 'Repository retention', url: 'https://docs.example.com/eng/retention' },
  ] } };
export const APPROVAL = { id: 'call_delete', name: 'delete_branch', args: { branch: 'feature/old-nav', reason: 'merged 94 days ago' } };
export const SOURCES = [
  { id: 'src_1', url: 'https://docs.example.com/eng/branching', title: 'Branching policy (internal docs)' },
  { id: 'src_2', url: 'https://docs.example.com/eng/retention', title: 'Repository retention rules' },
];

const CODE = `\`\`\`ts
type Branch = { name: string; mergedAt?: Date; openPr: boolean };

const PROTECTED = [/^main$/, /^release\\//];
const STALE_DAYS = 90;

export function staleBranches(branches: Branch[], now = new Date()) {
  return branches.filter((b) => {
    if (PROTECTED.some((re) => re.test(b.name))) return false;
    if (b.openPr) return false;
    if (!b.mergedAt) return false;
    const days = (now.getTime() - b.mergedAt.getTime()) / 86_400_000;
    return days > STALE_DAYS;
  });
}

// Dry run first: print what would go, then ask before deleting.
export function describe(branches: Branch[]) {
  return branches.map((b) => \`\${b.name} (merged \${b.mergedAt?.toISOString().slice(0, 10)})\`);
}
\`\`\``;

export const TEXT = `## Branching policy in brief

Our policy keeps **main** always releasable and treats every other branch as short-lived. Work happens on topic
branches named after the change, for example \`feature/billing-export\` or \`fix/login-redirect\`, and each one should
merge within a few days. Long-running branches are the main source of painful merges, so the policy is designed to
make them rare and visible.

### The rules that matter

- **main is protected.** Nobody pushes to it directly; every change arrives through a pull request with one approving
  review and a green build.
- **Release branches are cut, not grown.** A \`release/*\` branch is created from main when we freeze a version and
  only receives cherry-picked fixes after that point.
- **Topic branches are disposable.** Once a branch is merged, the work lives in main and the branch has no further
  purpose. Keeping it around only adds noise to branch lists and search results.
- **Anything with an open pull request is off limits.** Even if it looks abandoned, someone may still be reviewing it,
  so clean-up never touches a branch that has an open pull request.
- **Ninety days is the line.** A merged branch older than ninety days is considered stale and can be removed without
  asking its author, as long as it is not protected.

### What counts as stale

The retention rules define a stale branch as one that meets *all* of these conditions at once. It has been merged
into main, the merge happened more than ninety days ago, it does not match a protected pattern, and no pull request
is open against it. Branches that were never merged are treated differently: they are flagged to their authors
rather than deleted, because they may contain unfinished work that exists nowhere else.

| Branch pattern | Protected | Deleted automatically | Notes |
|---|---|---|---|
| main | Yes | Never | Always releasable |
| release/* | Yes | Never | Cherry-picks only |
| feature/*, fix/* | No | After 90 days merged | Must have no open PR |
| Unmerged branches | No | Never | Author is notified instead |

### How the clean-up works

The clean-up is deliberately cautious. It starts with a dry run that lists every branch it would remove, with the date
each one was merged, so a person can scan the list before anything happens. Only then does it delete, one branch at
a time, and it records each deletion in the audit log with the branch name, the commit it pointed to and who approved
the run. Because the commit is recorded, any deleted branch can be restored in seconds if it turns out to be needed.

Here is the selection logic the clean-up job uses. It is intentionally small so that it is easy to review:

${CODE}

The protected patterns and the ninety-day threshold are the only two settings. Changing either one goes through the
same review as any other change to the repository settings, which keeps the behaviour predictable for everyone.

### Why we bother

Stale branches are not harmful on their own, but they add up. A repository with hundreds of old branches makes it
harder to find the work that matters, slows down tooling that lists or searches branches, and hides the branches
that genuinely need attention, such as unmerged work that has been forgotten. Regular clean-up keeps the list short
enough that every branch on it means something. It also nudges the team towards small, frequent merges, which is the
habit the whole policy is built around.

### Restoring a deleted branch

Restoring is a single command because the audit log keeps the commit each deleted branch pointed to. Find the entry
for the branch, copy its commit, and create a new branch with the same name at that commit. Nothing else is needed:
the history, the pull request and the review comments are all still attached to the commits in main, so the restored
branch behaves exactly like the original. In practice this is rarely necessary, but knowing it is cheap and quick is
what makes the team comfortable letting the clean-up run on a schedule rather than by hand.

### What I found in this repository

I checked the branch list against these rules. Most branches are either protected, recently merged or still have open
pull requests, so they stay. One branch, **feature/old-nav**, was merged ninety-four days ago, has no open pull request
and does not match a protected pattern, so it qualifies for removal under the retention rules. Two unmerged branches
are older than ninety days; I have not touched them, and I would suggest pinging their authors instead.

For background, see the [Git branching guide](https://git-scm.com/book/en/v2/Git-Branching-Branching-Workflows) and
GitHub's notes on [protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository).

Deleting a branch is reversible from the audit log, but it still changes shared state, so I will ask before doing it.`;

// Deterministic 2–6 character chunks (seeded LCG), so every kit receives byte-identical deltas.
export function chunks(text, seed = 7) {
  const out = [];
  let s = seed;
  for (let i = 0; i < text.length;) {
    s = (s * 1103515245 + 12345) % 2147483648;
    const n = 2 + (s % 5);
    out.push(text.slice(i, i + n));
    i += n;
  }
  return out;
}

const wait = (ms, signal) => new Promise((resolve, reject) => {
  const t = setTimeout(resolve, ms);
  signal?.addEventListener('abort', () => { clearTimeout(t); reject(Object.assign(new Error('aborted'), { name: 'AbortError' })); }, { once: true });
});

// Kit-neutral event stream. `afterApproval` replays only the follow-up once the user approved or denied.
// Events: tool-start, tool-result, text-start, text-delta, text-end, source, approval-request, finish.
export async function* play({ signal, afterApproval } = {}) {
  const mark = (k) => { if (window.__bench) window.__bench.marks[k] ??= performance.now(); };
  if (afterApproval) {
    yield { type: 'text-start', id: 'txt_follow' };
    for (const c of chunks(afterApproval === 'denied' ? 'Understood, I left feature/old-nav in place.' : FOLLOW_UP)) {
      await wait(TICK_MS, signal); yield { type: 'text-delta', id: 'txt_follow', delta: c };
    }
    yield { type: 'text-end', id: 'txt_follow' };
    mark('followup_done');
    yield { type: 'finish' };
    return;
  }
  mark('run_start');
  await wait(300, signal);
  yield { type: 'tool-start', ...TOOL };
  await wait(400, signal);
  yield { type: 'tool-result', ...TOOL };
  await wait(150, signal);
  yield { type: 'text-start', id: 'txt_main' };
  mark('stream_start');
  for (const c of chunks(TEXT)) { await wait(TICK_MS, signal); yield { type: 'text-delta', id: 'txt_main', delta: c }; }
  yield { type: 'text-end', id: 'txt_main' };
  mark('stream_end');
  for (const s of SOURCES) yield { type: 'source', ...s };
  await wait(200, signal);
  yield { type: 'approval-request', ...APPROVAL };
  mark('approval_requested');
  yield { type: 'finish', awaitingApproval: true };
}

export function initBench(lib, selectors) {
  window.__bench = Object.assign(window.__bench ?? {}, { lib, sel: selectors, marks: {}, notes: {} });
  document.getElementById('lib').textContent = lib;
}
