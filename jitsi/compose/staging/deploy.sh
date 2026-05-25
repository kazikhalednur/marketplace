#!/usr/bin/env bash
# Run on the staging host (same machine as Jenkins) to start Jitsi with staging settings.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ENV_FILE="${ROOT}/compose/staging/.env"
COMPOSE=(docker compose -f "${ROOT}/docker-compose.yml" -f "${ROOT}/compose.staging.yaml" --env-file "${ENV_FILE}")

if [[ ! -f "${ENV_FILE}" ]]; then
  echo "Missing ${ENV_FILE}. Decrypt compose/staging/.env.gpg first (see pipeline.groovy)." >&2
  exit 1
fi

# Required for WebRTC when clients reach the host by public DNS name.
if ! grep -q '^JVB_ADVERTISE_IPS=' "${ENV_FILE}"; then
  echo 'JVB_ADVERTISE_IPS=165.101.23.47' >> "${ENV_FILE}"
fi
sed -i 's|^CONFIG=.*|CONFIG=/var/lib/jenkins/.jitsi-meet-cfg|' "${ENV_FILE}"

CONFIG_DIR=/var/lib/jenkins/.jitsi-meet-cfg
if [[ -f "${ROOT}/web/keys/cert.crt" && -f "${ROOT}/web/keys/cert.key" ]]; then
  mkdir -p "${CONFIG_DIR}/web/keys"
  install -m 644 "${ROOT}/web/keys/cert.crt" "${CONFIG_DIR}/web/keys/cert.crt"
  install -m 600 "${ROOT}/web/keys/cert.key" "${CONFIG_DIR}/web/keys/cert.key"
  chown -R jenkins:jenkins "${CONFIG_DIR}/web/keys" 2>/dev/null || true
fi

run_compose() {
  if [[ "$(id -un)" == "jenkins" ]]; then
    "${COMPOSE[@]}" "$@"
  elif [[ "$(id -u)" -eq 0 ]] && id jenkins &>/dev/null; then
    sudo -u jenkins "${COMPOSE[@]}" "$@"
  else
    "${COMPOSE[@]}" "$@"
  fi
}

run_compose up --build -d
run_compose ps

HTTPS_PORT="${HTTPS_PORT:-8446}"
if curl -fk -s -o /dev/null "https://127.0.0.1:${HTTPS_PORT}/external_api.js"; then
  echo "Jitsi is up on https://127.0.0.1:${HTTPS_PORT}/"
else
  echo "Jitsi web is not responding on port ${HTTPS_PORT}. Check: docker logs jitsi-web-1" >&2
  exit 1
fi
