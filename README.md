# SingulAI MVP Backend
1) Copie `.env.example` para `.env` e preencha.
2) Aplique `sql/supabase_schema.sql` no Supabase.
3) Suba IPFS e a API:
   docker compose -f docker-compose.addons.yml up -d --build
4) Importe os workflows do n8n em `n8n/*.json`.
5) Gere um JWT de teste com `API_JWT_SECRET` e chame `GET /health`.
Endpoints: POST /api/avatars, POST /api/wallets/link, POST /api/capsules/:avatarId, POST /api/legacy.
