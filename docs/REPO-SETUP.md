# Repository Setup Guide (one-time GitHub configuration)

These settings can't live in files — configure them in the GitHub UI.

## Settings → General
- [ ] Add description + website (nadidoug.com) + topics: `portfolio`, `fullstack`, `react`, `ai`
- [ ] Disable Wiki and Projects if unused (reduces clutter)
- [ ] Squash merging only; auto-delete head branches

## Settings → Branches (Branch Protection on `main`)
- [ ] Require pull request before merging (even solo — it shows discipline in the history)
- [ ] Require status checks: `lint-and-test`, `secret-scan`, `CodeQL`
- [ ] Block force pushes

## Settings → Code security and analysis — enable ALL:
- [ ] Dependency graph + Dependabot alerts + Dependabot security updates
- [ ] Secret scanning **and push protection**
- [ ] Private vulnerability reporting (powers SECURITY.md reporting link)
- [ ] CodeQL default setup (or keep the committed workflow)

## Profile polish
- [ ] Pin this repo + 3–5 best project repos
- [ ] Profile README (github.com/nadidoug/nadidoug repo) mirroring the portfolio header
- [ ] Enable 2FA + signed commits (`git config commit.gpgsign true`) — "Verified" badges on commits read senior

## Badges already in README
License · Maintained · Security policy. After first CI run, add:
`![CI](https://github.com/nadidoug/nadi-portfolio/actions/workflows/ci.yml/badge.svg)`

## Cadence
- Review Dependabot PRs weekly (grouped minor/patch keeps noise low)
- Update legal doc dates when content changes; review annually
