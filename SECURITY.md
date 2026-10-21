# Security policy

## Reporting

Please use GitHub's **Private Vulnerability Reporting** feature when enabled in the repository Security settings. Do not post exploits, tokens, or sensitive client examples publicly.

## Data model

Proposal values are kept in the current browser tab, with manual, user-initiated PDF, Markdown, or JSON exports. No analytics, accounts, API calls, or third-party scripts are used. A restrictive Content Security Policy forbids outbound connections (`connect-src 'none'`). The hosting provider will still see connection metadata when assets are requested.

Source code is open for independent review. The safeguards reduce accidental disclosure but cannot guarantee that arbitrary browser extensions, malicious local software, or compromised hosting cannot access browser data.

## Security boundaries

- Exported JSON is not encrypted; handle backups with the same care as other client documents.
- The proposal preview renders imported strings using `textContent`, not raw HTML.
- The local development server binds to 127.0.0.1 and rejects dotfiles, traversal, and methods other than GET/HEAD.
- Do not rely on this tool as legal, financial, tax, or compliance advice.
- Turn on GitHub branch protection, secret scanning/push protection (when available), and private vulnerability reporting before accepting outside contributions.
