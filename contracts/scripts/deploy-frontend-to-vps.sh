#!/bin/bash

# Deploy SingulAI Frontend to VPS
# Usage: ./scripts/deploy-frontend-to-vps.sh user@host ssh_key_path

set -e

if [ $# -ne 2 ]; then
    echo "Usage: $0 user@host ssh_key_path"
    echo "Example: $0 root@72.60.147.56 ~/.ssh/id_rsa"
    exit 1
fi

HOST=$1
SSH_KEY=$2
FRONTEND_DIR="frontend"
REMOTE_TMP="/tmp/singulai-frontend.tar.gz"
REMOTE_FRONTEND_DIR="/opt/singulai/frontend"

echo "🚀 Deploying SingulAI frontend to $HOST..."

# Create archive of frontend directory
echo "📦 Creating frontend archive..."
tar -czf /tmp/singulai-frontend.tar.gz -C "$FRONTEND_DIR" .

# Upload to VPS
echo "📤 Uploading to VPS..."
scp -i "$SSH_KEY" -o StrictHostKeyChecking=no /tmp/singulai-frontend.tar.gz "$HOST:$REMOTE_TMP"

# Extract and deploy on VPS
echo "📥 Extracting on VPS..."
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$HOST" << EOF
    # Backup current frontend
    if [ -d "$REMOTE_FRONTEND_DIR" ]; then
        echo "📋 Backing up current frontend..."
        cp -r "$REMOTE_FRONTEND_DIR" "${REMOTE_FRONTEND_DIR}.backup.$(date +%Y%m%d_%H%M%S)"
    fi

    # Extract new frontend
    echo "📂 Extracting new frontend..."
    mkdir -p "$REMOTE_FRONTEND_DIR"
    tar -xzf "$REMOTE_TMP" -C "$REMOTE_FRONTEND_DIR"

    # Clean up
    rm "$REMOTE_TMP"

    # Reload nginx
    echo "🔄 Reloading nginx..."
    systemctl reload nginx

    echo "✅ Deployment complete!"
    echo "🌐 Frontend deployed to: https://singulai.live"
EOF

# Clean up local archive
rm /tmp/singulai-frontend.tar.gz

echo "🎉 Frontend deployment successful!"
echo "🌐 Visit: https://singulai.live"