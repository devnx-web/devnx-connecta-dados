#!/usr/bin/env bash
set -euo pipefail

AIRBYTE_PORT="${AIRBYTE_PORT:-8002}"
AIRBYTE_EMAIL="${AIRBYTE_EMAIL:-admin@devnx.com.br}"
AIRBYTE_PASSWORD="${AIRBYTE_PASSWORD:-change-me-now}"
AIRBYTE_HOST="${AIRBYTE_HOST:-}"
AIRBYTE_LOW_RESOURCE_MODE="${AIRBYTE_LOW_RESOURCE_MODE:-false}"
AIRBYTE_INSECURE_COOKIES="${AIRBYTE_INSECURE_COOKIES:-false}"
AIRBYTE_CHART_VERSION="${AIRBYTE_CHART_VERSION:-}"

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

wait_for_docker
install_abctl
build_install_flags

if abctl local status >/tmp/abctl-status.log 2>&1 && ! grep -qi "does not appear to be installed" /tmp/abctl-status.log; then
  echo "Existing Airbyte installation found."
  cat /tmp/abctl-status.log
else
  cat /tmp/abctl-status.log || true
  echo "Installing Airbyte with abctl on host port ${AIRBYTE_PORT}..."
  abctl local install "${ABCTL_FLAGS[@]}"
fi

if [[ -n "$AIRBYTE_EMAIL" && -n "$AIRBYTE_PASSWORD" ]]; then
  echo "Setting Airbyte login email."
  abctl local credentials --email "$AIRBYTE_EMAIL" --password "$AIRBYTE_PASSWORD" >/dev/null
fi

abctl local status || true

echo "Airbyte manager is running. Keep this service alive to show logs in EasyPanel."
tail -f /dev/null
