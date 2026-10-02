# Backups

Two separate things need backing up before risky changes, and they're
restored two separate ways:

## 1. Code — git tag

Every backup is paired with a git tag marking the exact commit the site was
at when the database snapshot was taken. To revert the code:

```bash
git checkout <tag-name>          # inspect it on a detached HEAD, or
git reset --hard <tag-name>       # move main back to it (destructive — see warning below)
```

Current tags are listed with `git tag -l "backup-*"`.

## 2. Database — JSON snapshot

This project's database has no separate dev/staging copy (see the root
`CLAUDE.md`), so a schema/content mistake lands directly on production.
Each folder here (`<timestamp>_full-backup/`) is a full snapshot of every
table, taken via `backup.mjs` since `pg_dump` isn't available in this
environment.

**Take a new snapshot:**
```bash
node --env-file=.env.local backups/backup.mjs
```

**Restore a snapshot** (DESTRUCTIVE — wipes and reinserts every table the
snapshot covers; wrapped in a transaction, so a failure rolls back cleanly,
but a successful run truly replaces current data):
```bash
node --env-file=.env.local backups/restore.mjs backups/<timestamp>_full-backup
```

This folder is git-ignored (`/backups/` in `.gitignore`) — it contains
password hashes, customer names/emails/addresses, and order data, and must
never reach the GitHub remote. It still gets backed up automatically via
OneDrive, since the whole project folder is already inside OneDrive.

**Not covered by this backup:** uploaded product photos live in Vercel
Blob storage, not the database — the database only stores their URLs. Our
workflow so far only adds new blobs and leaves old ones in place (never
deletes), so restoring an old database snapshot should still find its old
image URLs live. This isn't guaranteed if that pattern changes later.
