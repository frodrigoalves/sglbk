param(
  [Parameter(Mandatory=$true)] [string]$VpsHost,
  [string]$VpsUser = "root",
  [string]$VpsPath = "/srv/singulai"
)

$ErrorActionPreference = "Stop"
$proj = Get-Location
$img  = "singulai-api"
try {
  $tag = (git rev-parse --short HEAD).Trim()
} catch {
  $tag = Get-Date -Format "yyyyMMddHHmmss"
}
$tar  = "$img-$tag.tar"

Write-Host "==> Build imagem ${img}:${tag}"
docker build -t "${img}:${tag}" -f "$proj\backend\Dockerfile" "$proj\backend"

Write-Host "==> Export imagem para $tar"
docker save "${img}:${tag}" -o "$tar"

Write-Host "==> Enviar para ${VpsUser}@${VpsHost}:${VpsPath}"
ssh "${VpsUser}@${VpsHost}" "mkdir -p $VpsPath"
scp "$tar" "${VpsUser}@${VpsHost}:${VpsPath}/"

$remoteCmd = @"
set -e
cd $VpsPath
echo '==> docker load'
docker load -i $tar
echo '==> compose write'
cat > compose.singulai.yml <<'YAML'
services:
  singulai-api:
    image: ${img}:${tag}
    restart: unless-stopped
    env_file: [ .env ]
    ports: [ "8080:8080" ]
    depends_on: [ ipfs ]
  ipfs:
    image: ipfs/kubo:latest
    restart: unless-stopped
    ports: [ "5001:5001", "8080:8080" ]
    volumes: [ "ipfs-data:/data/ipfs" ]
volumes: { ipfs-data: {} }
YAML
echo '==> docker compose up -d'
docker compose -f compose.singulai.yml up -d
echo '==> health'
curl -s http://localhost:8080/health || true
"@

Write-Host "==> Executar remoto"
ssh "${VpsUser}@${VpsHost}" "$remoteCmd"

Write-Host "OK: deploy ${img}:${tag} aplicado."
