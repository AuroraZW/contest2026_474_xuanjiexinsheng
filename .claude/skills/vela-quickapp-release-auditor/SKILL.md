---
name: vela-quickapp-release-auditor
description: Audit a Vela or openvela QuickApp release before a contest submission or release handoff. Use when checking a production RPK, its source manifest and lockfile, required submission files, AI coding logs, reusable Skill presence, Apache-2.0 licensing, package/version consistency, or accidental API keys and signing private keys.
---

# Vela QuickApp release audit

Treat every failed check as a release blocker unless the caller explicitly accepts it. Never print, copy, or repair a discovered secret.

## Run the deterministic audit

Run from any directory:

```bash
python3 <skill-dir>/scripts/audit_release.py \
  --repo <repository-root> \
  --app quickapp/<app-directory> \
  --rpk <path-to-production-release.rpk>
```

The script checks:

- required QuickApp source files and production RPK naming;
- source and packaged manifest package/version equality;
- ZIP integrity, `META-INF/CERT`, the entry page, and all declared page bundles;
- tracked signing private keys and high-confidence API key patterns in tracked source and RPK text;
- repository README, Apache-2.0 license, third-party notice, AI logs, and at least one project Skill;
- official contest JSONL validation when the collector validator is available;
- SHA-256 and file size for release handoff.

## Interpret the result

1. Report `FAIL` items first with their exact path or mismatch.
2. Keep `WARN` items visible; decide whether they affect reproducibility.
3. Do not call the release ready until the command exits with code 0.
4. Record the final SHA-256 beside the exact RPK filename and source commit.
5. Re-run after any source, manifest, signing, log, or RPK change.

Do not run dependency upgrade or autofix commands during an audit. Do not add private signing material to the repository.
