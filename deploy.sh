#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# MarkFlow 部署脚本
# 用法:
#   ./deploy.sh              # 默认构建并启动
#   ./deploy.sh build        # 仅构建镜像
#   ./deploy.sh start        # 启动服务
#   ./deploy.sh stop         # 停止服务
#   ./deploy.sh restart      # 重启服务
#   ./deploy.sh logs         # 查看日志
#   ./deploy.sh status       # 查看服务状态
#   ./deploy.sh clean        # 停止并清理容器、镜像
# ============================================================

APP_NAME="markflow"
COMPOSE_FILE="docker-compose.yml"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log_info()  { echo -e "${GREEN}[INFO]${NC}  $1"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC}  $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_step()  { echo -e "${CYAN}[STEP]${NC}  $1"; }

# 切换到项目根目录
cd "$(dirname "$0")"

# 检查 docker 和 docker compose
check_deps() {
    if ! command -v docker &>/dev/null; then
        log_error "未检测到 docker，请先安装 Docker"
        exit 1
    fi

    if ! docker compose version &>/dev/null; then
        log_error "未检测到 docker compose，请升级 Docker 或安装 docker-compose-plugin"
        exit 1
    fi
}

# 构建镜像
do_build() {
    log_step "构建 Docker 镜像..."
    docker compose -f "$COMPOSE_FILE" build --parallel
    log_info "镜像构建完成"
}

# 启动服务
do_start() {
    log_step "启动服务..."
    docker compose -f "$COMPOSE_FILE" up -d
    log_info "服务已启动"
    wait_for_healthy
    show_access_info
}

# 停止服务
do_stop() {
    log_step "停止服务..."
    docker compose -f "$COMPOSE_FILE" down
    log_info "服务已停止"
}

# 重启服务
do_restart() {
    log_step "重启服务..."
    docker compose -f "$COMPOSE_FILE" down
    docker compose -f "$COMPOSE_FILE" up -d
    log_info "服务已重启"
    wait_for_healthy
    show_access_info
}

# 查看日志
do_logs() {
    docker compose -f "$COMPOSE_FILE" logs -f --tail=100
}

# 查看状态
do_status() {
    docker compose -f "$COMPOSE_FILE" ps
}

# 清理
do_clean() {
    log_step "停止并清理所有容器和镜像..."
    docker compose -f "$COMPOSE_FILE" down --rmi local --volumes --remove-orphans
    log_info "清理完成"
}

# 等待后端健康检查通过
wait_for_healthy() {
    log_step "等待服务就绪..."
    local retries=30
    local count=0
    while [ $count -lt $retries ]; do
        local health
        health=$(docker compose -f "$COMPOSE_FILE" ps server --format json 2>/dev/null | grep -o '"Health":"[^"]*"' | head -1 || true)
        if echo "$health" | grep -q "healthy"; then
            log_info "后端服务健康检查通过"
            return 0
        fi
        count=$((count + 1))
        sleep 2
    done
    log_warn "健康检查超时，请使用 './deploy.sh logs' 查看日志排查问题"
}

# 显示访问信息
show_access_info() {
    echo ""
    echo "=========================================="
    log_info "MarkFlow 已部署成功！"
    echo ""
    echo "  访问地址:  http://localhost"
    echo "  健康检查:  http://localhost/api/health"
    echo ""
    echo "  查看日志:  ./deploy.sh logs"
    echo "  停止服务:  ./deploy.sh stop"
    echo "  重启服务:  ./deploy.sh restart"
    echo "=========================================="
    echo ""
}

# 主入口
main() {
    check_deps

    local cmd="${1:-deploy}"

    case "$cmd" in
        build)
            do_build
            ;;
        start)
            do_start
            ;;
        stop)
            do_stop
            ;;
        restart)
            do_restart
            ;;
        logs)
            do_logs
            ;;
        status)
            do_status
            ;;
        clean)
            do_clean
            ;;
        deploy|"")
            do_build
            do_start
            ;;
        *)
            echo "用法: $0 {build|start|stop|restart|logs|status|clean}"
            exit 1
            ;;
    esac
}

main "$@"
