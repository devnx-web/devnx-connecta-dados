#!/usr/bin/env bash
set -euo pipefail

AIRBYTE_PORT="${AIRBYTE_PORT:-8002}"
AIRBYTE_EMAIL="${AIRBYTE_EMAIL:-admin@devnx.com.br}"
AIRBYTE_PASSWORD="${AIRBYTE_PASSWORD:-change-me-now}"
AIRBYTE_HOST="${AIRBYTE_HOST:-}"
AIRBYTE_LOW_RESOURCE_MODE="${AIRBYTE_LOW_RESOURCE_MODE:-false}"
AIRBYTE_INSECURE_COOKIES="${AIRBYTE_INSECURE_COOKIES:-false}"
AIRBYTE_CHART_VERSION="${AIRBYTE_CHART_VERSION:-}"
INSTALLER_VERSION="2026-06-30.3"

echo "DevNX Airbyte installer ${INSTALLER_VERSION}"

wait_for_docker() {
  for _ in $(seq 1 60); do
    if docker info >/dev/null 2>&1; then
      return 0
    fi
    sleep 2
  done

  echo "Docker socket is not available. Mount /var/run/docker.sock into this service." >&2
  return 1
}

install_abctl() {
  if command -v abctl >/dev/null 2>&1; then
    return 0
  fi

  echo "Installing abctl..."
  curl -LsfS https://get.airbyte.com | bash -
}

build_install_flags() {
  ABCTL_FLAGS=(--no-browser --port "$AIRBYTE_PORT")

  if [[ -n "$AIRBYTE_HOST" ]]; then
    ABCTL_FLAGS+=(--host "$AIRBYTE_HOST")
  fi

  if [[ "$AIRBYTE_LOW_RESOURCE_MODE" == "true" ]]; then
    ABCTL_FLAGS+=(--low-resource-mode)
  fi

  if [[ "$AIRBYTE_INSECURE_COOKIES" == "true" ]]; then
    ABCTL_FLAGS+=(--insecure-cookies)
  fi

  if [[ -n "$AIRBYTE_CHART_VERSION" ]]; then
    ABCTL_FLAGS+=(--chart-version "$AIRBYTE_CHART_VERSION")
  fi
}

fix_airbyte_volume_permissions() {
  for _ in $(seq 1 240); do
    if docker ps --format '{{.Names}}' | grep -qx "airbyte-abctl-control-plane"; then
      if docker exec airbyte-abctl-control-plane sh -lc '
        if [ -d /var/local-path-provisioner/airbyte-volume-db ]; then
          chown -R 70:70 /var/local-path-provisioner/airbyte-volume-db
          chmod 700 /var/local-path-provisioner/airbyte-volume-db
          mkdir -p /var/local-path-provisioner/airbyte-local-pv
          chmod 0777 /var/local-path-provisioner/airbyte-local-pv
          exit 0
        fi

        exit 1
      ' >/dev/null 2>&1; then
        echo "Airbyte local PV permissions fixed."
        return 0
      fi
    fi

    sleep 2
  done

  echo "Timed out waiting to fix Airbyte local PV permissions." >&2
  return 1
}

wait_for_docker
install_abctl
build_install_flags

install_needed=false

abctl local status >/tmp/abctl-status.log 2>&1 || true
tr -cd '\11\12\15\40-\176' < /tmp/abctl-status.log > /tmp/abctl-status-clean.log || true
cat /tmp/abctl-status.log || true

if grep -Eaqi "does not appear|not.*installed|not installed" /tmp/abctl-status-clean.log; then
  install_needed=true
elif docker ps -a --format '{{.Names}}' | grep -qx "airbyte-abctl-control-plane"; then
  echo "Existing Airbyte installation found."
else
  echo "No Airbyte control plane container was found."
  install_needed=true
fi

if [[ "$install_needed" == "true" ]]; then
  echo "Airbyte is not installed yet."
  echo "Installing Airbyte with abctl on host port ${AIRBYTE_PORT}..."
  fix_airbyte_volume_permissions &
  volume_fix_pid="$!"
  abctl local install "${ABCTL_FLAGS[@]}"
  wait "$volume_fix_pid" || true
fi

if [[ -n "$AIRBYTE_EMAIL" && -n "$AIRBYTE_PASSWORD" ]]; then
  echo "Setting Airbyte login email."
  abctl local credentials --email "$AIRBYTE_EMAIL" --password "$AIRBYTE_PASSWORD" >/dev/null
fi

abctl local status || true

echo "Airbyte manager is running. Keep this service alive to show logs in EasyPanel."
tail -f /dev/null
