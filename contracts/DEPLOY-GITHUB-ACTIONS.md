GitHub Actions deployment to VPS (frontend)

This repository contains a GitHub Actions workflow that deploys the `frontend` directory to your VPS when a commit is pushed to `main`.

Required repository secrets (set these in the GitHub repo settings -> Secrets):

- DEPLOY_HOST: your VPS public IP or hostname (e.g. 72.60.147.56)
- DEPLOY_USER: SSH user (e.g. root)
- DEPLOY_KEY: SSH private key (PEM) that can SSH to the VPS
- DEPLOY_PORT: optional SSH port (default 22)

How it works:
1. On push to `main`, Actions creates a tarball of `frontend`.
2. It SCPs the archive to `/tmp` on the VPS using the provided SSH key.
3. It SSHs to the VPS, extracts to `/opt/singulai/frontend`, fixes ownership and reloads nginx.

Notes:
- The workflow uses `www-data:www-data` ownership by default; adjust the user if your nginx runs with a different user.
- Ensure the VPS allows SSH key authentication and that the user has sudo privileges for `nginx -t` and `systemctl reload nginx`.
- For security, create a dedicated deploy key with limited access.

Triggering deploy manually:
- Push to `main` or open a PR and merge to `main`.

Rollback / safe deploy:
- The script overwrites files in `/opt/singulai/frontend`. Consider keeping backups or using a symlinked deploy directory (e.g. `/opt/singulai/frontend-releases/<ts>` and symlink to `/opt/singulai/frontend`) for safer rollbacks.
