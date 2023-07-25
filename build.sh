#!/bin/bash
# Author: Kamas Lau<kamaslau@dingtalk.com>
# Run with "sh -x build.sh", or "APP_NAME=your-app-name sh build.sh"
# Node.js w/ docker 项目构建脚本

# Output message to console
log() {
  echo "$@" >&2
}

ORG_NAME=${ORG_NAME:="kamaslau"}
APP_NAME=${APP_NAME:="auther"}

CN=${CN:="y"}
# Use Mirrors for usage in PRC
if [ "$CN" = y ]; then
  log "Deploy in PRC"
  REGISTRY=${REGISTRY:="registry.cn-shanghai.aliyuncs.com"} # Aliyun
else
  # REGISTRY=${REGISTRY:="ghcr.io"} # GitHub
  REGISTRY=${REGISTRY:="docker.io"} # Docker Hub
fi

IMAGE_NAME="$REGISTRY"/"$ORG_NAME"/"$APP_NAME"

# Build image
# Consider using arg --no-cache to avoid cache
docker build . -t $APP_NAME:latest

# Tag as latest
docker tag $APP_NAME:latest $IMAGE_NAME:latest

# Push to remote repository
docker push $IMAGE_NAME:latest

# EOL
exit 0
