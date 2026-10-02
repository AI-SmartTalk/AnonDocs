#!/usr/bin/env bash
set -euo pipefail
release=${1:?release directory}
exec 8>/var/lock/aist-core-deploy.lock
flock -w 600 8
mkdir -p /opt/aist-infra
cp -a "$release/infra/." /opt/aist-infra/
bash /opt/aist-infra/scripts/prepare-host.sh
