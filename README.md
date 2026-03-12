# da-backup-launcher

A Cloudflare Worker that runs on a schedule and starts an **R2-to-R2 backup** using [Cloudflare Super Slurper](https://developers.cloudflare.com/r2/data-migration/super-slurper/). It copies objects from a source R2 bucket to a destination R2 bucket (overwrite mode).

**Schedule:** Every Saturday at 06:00 UTC (configurable in `wrangler.toml`).

## Variables to set up

### Config (in `wrangler.toml` or env-specific)

| Variable             | Description                                      |
|----------------------|--------------------------------------------------|
| `ACCOUNT_ID`         | Cloudflare account ID                            |
| `SOURCE_BUCKET`      | R2 bucket name to copy from                      |
| `DESTINATION_BUCKET` | R2 bucket name to copy to (backup target)       |

### Secrets (sensitive – set via Wrangler or `.dev.vars` for local)

| Secret                         | Description                                      |
|--------------------------------|--------------------------------------------------|
| `CF_API_TOKEN`                 | Cloudflare API token with R2/Slurper access       |
| `SOURCE_R2_ACCESS_KEY_ID`      | R2 API token for the **source** bucket (read)   |
| `SOURCE_R2_SECRET_ACCESS_KEY`  | Secret for the source R2 token                   |
| `DESTINATION_R2_ACCESS_KEY_ID` | R2 API token for the **destination** bucket     |
| `DESTINATION_R2_SECRET_ACCESS_KEY` | Secret for the destination R2 token        |

**Production:**

```bash
wrangler secret put CF_API_TOKEN
wrangler secret put SOURCE_R2_ACCESS_KEY_ID
wrangler secret put SOURCE_R2_SECRET_ACCESS_KEY
wrangler secret put DESTINATION_R2_ACCESS_KEY_ID
wrangler secret put DESTINATION_R2_SECRET_ACCESS_KEY
```

**Local dev:** put the same keys and values in `.dev.vars` (file is gitignored).

## Commands

- **Local dev:** `npm run dev` then trigger backup with `curl http://localhost:8787/run`
- **Deploy:** `npm run deploy`
