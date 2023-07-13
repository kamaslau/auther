#!/bin/bash
# Author: Kamas Lau<kamaslau@dingtalk.com>
# Run with "sh -x run.sh", or "MODE=init APP_NAME=your-app-name sh run.sh"
# Node.js w/ docker 项目运行脚本

# Output message to console
log() {
  echo "$@" >&2
}

ORG_NAME=${ORG_NAME:="liuyajie728"}
APP_NAME=${APP_NAME:="auther-github"}

CN=${CN:="y"}
# Use Mirrors for usage in PRC
if [ "$CN" = y ]; then
  log "Deploy in PRC"
  REGISTRY=${REGISTRY:="registry.cn-shanghai.aliyuncs.com"} # Aliyun
else
  REGISTRY=${REGISTRY:="ghcr.io"} # GitHub
  # REGISTRY=${REGISTRY:="docker.io"} # Docker Hub
fi

PORT=${PORT:="3000"}
MODE=${MODE:="upgrade"} # Deploy mode. 'init' for initiation, 'update' for upgrade

IMAGE_NAME="$REGISTRY"/"$ORG_NAME"/"$APP_NAME"

# Pull latest image
docker pull $IMAGE_NAME:latest

# Stop and remove current container (if any)
# Initiate/reinstall project
if [ "$MODE" = upgrade ]; then
  if [ $(docker ps -aq --filter name=$APP_NAME) ]; then
    docker stop $APP_NAME
    docker rm $APP_NAME
    docker rmi $IMAGE_NAME
  fi
fi

# Create new container
docker run --name $APP_NAME --restart always -d -p $PORT:3000 $IMAGE_NAME

# EOL
exit 0
