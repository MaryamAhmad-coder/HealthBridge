# HealthBridge

Simple informational site to search verified health resources and community support.

Quick start (local):

1. Copy `.env.example` to `.env` and set `ADMIN_TOKEN`.
2. Install dependencies: `npm install`.
3. Run: `npm start` or `docker-compose up --build`.

Postgres (optional persistent DB):

1. If using Docker Compose the `db` service will start Postgres. Copy `.env.example` to `.env` to set `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `POSTGRES_DB`.
2. Ensure `DATABASE_URL` in `.env` is set to `postgresql://<user>:<password>@db:5432/<db>` when running with compose (or use a cloud Postgres and set that URL).
3. Initialize the DB schema:

```bash
npm install
node src/db_init.js
```


Notes:
- The AI endpoint will proxy to OpenAI if `OPENAI_API_KEY` is set; otherwise it uses a safe local fallback.
- Kubernetes manifests are in the `kubernetes/` folder; update image and secrets before applying.
- Terraform contains a placeholder in `terraform/` for provisioning cloud resources.

This project is informational only and not a medical diagnostic tool.
