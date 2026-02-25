#!/bin/bash

#===============================================================================
# MarkFlow 部署脚本
#
# 用法:
#   ./deploy.sh [命令] [选项]
#
# 命令:
#   start       启动所有服务
#   stop        停止所有服务
#   restart     重启所有服务
#   status      查看服务状态
#   logs        查看服务日志
#   build       构建项目
#   update      更新并重启服务
#   clean       清理构建产物和容器
#   health      健康检查
#   exec        进入容器
#   help        显示帮助信息
#
#===============================================================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# 项目配置
PROJECT_NAME="markflow"
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_FILE="${PROJECT_DIR}/docker-compose.yml"

#-------------------------------------------------------------------------------
# 工具函数
#-------------------------------------------------------------------------------

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_banner() {
    echo -e "${CYAN}"
    echo "╔══════════════════════════════════════════════════════════╗"
    echo "║                                                          ║"
    echo "║   ███╗   ███╗ █████╗ ██████╗ ██╗  ██╗███████╗██╗       ║"
    echo "║   ████╗ ████║██╔══██╗██╔══██╗██║ ██╔╝██╔════╝██║       ║"
    echo "║   ██╔████╔██║███████║██████╔╝█████╔╝ █████╗  ██║       ║"
    echo "║   ██║╚██╔╝██║██╔══██║██╔══██╗██╔═██╗ ██╔══╝  ██║       ║"
    echo "║   ██║ ╚═╝ ██║██║  ██║██║  ██║██║  ██╗██║     ███████╗  ║"
    echo "║   ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚══════╝  ║"
    echo "║                                                          ║"
    echo "║       MarkFlow - 在线 Markdown 编辑器 - 部署工具         ║"
    echo "╚══════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

check_requirements() {
    log_info "检查系统依赖..."

    # 检查 Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker 未安装，请先安装 Docker"
        echo "  安装指南: https://docs.docker.com/get-docker/"
        exit 1
    fi

    # 检查 Docker Compose
    if ! docker compose version &> /dev/null && ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose 未安装，请先安装 Docker Compose"
        echo "  安装指南: https://docs.docker.com/compose/install/"
        exit 1
    fi

    # 检查 Docker 服务是否运行
    if ! docker info &> /dev/null; then
        log_error "Docker 服务未运行，请启动 Docker"
        exit 1
    fi

    log_success "系统依赖检查通过"
}

# 获取 docker-compose 命令（V2 优先，兼容 V1）
get_compose_cmd() {
    if docker compose version &> /dev/null; then
        echo "docker compose"
    else
        echo "docker-compose"
    fi
}

COMPOSE_CMD=""

#-------------------------------------------------------------------------------
# 核心功能
#-------------------------------------------------------------------------------

# 构建项目
do_build() {
    local service="${1:-}"

    log_info "构建项目镜像..."

    cd "${PROJECT_DIR}"

    if [ -n "$service" ]; then
        log_info "构建服务: $service"
        $COMPOSE_CMD -f "$COMPOSE_FILE" build --no-cache "$service"
    else
        log_info "构建所有服务..."
        $COMPOSE_CMD -f "$COMPOSE_FILE" build --no-cache
    fi

    log_success "项目构建完成"
}

# 启动服务
do_start() {
    log_info "启动 MarkFlow 服务..."

    cd "${PROJECT_DIR}"
    $COMPOSE_CMD -f "$COMPOSE_FILE" up -d

    log_success "服务启动完成"
    wait_for_healthy
    show_access_info
}

# 停止服务
do_stop() {
    log_info "停止 MarkFlow 服务..."

    cd "${PROJECT_DIR}"
    $COMPOSE_CMD -f "$COMPOSE_FILE" down

    log_success "服务已停止"
}

# 重启服务
do_restart() {
    local service="${1:-}"

    log_info "重启服务..."

    cd "${PROJECT_DIR}"

    if [ -n "$service" ]; then
        log_info "重启服务: $service"
        $COMPOSE_CMD -f "$COMPOSE_FILE" restart "$service"
    else
        $COMPOSE_CMD -f "$COMPOSE_FILE" down
        $COMPOSE_CMD -f "$COMPOSE_FILE" up -d
    fi

    log_success "服务重启完成"
    wait_for_healthy
    show_access_info
}

# 查看服务状态
do_status() {
    log_info "服务状态:"
    echo ""

    cd "${PROJECT_DIR}"
    $COMPOSE_CMD -f "$COMPOSE_FILE" ps

    echo ""
    log_info "容器资源使用情况:"
    docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}" \
        $(docker ps --filter "name=${PROJECT_NAME}" -q) 2>/dev/null || true
}

# 查看日志
do_logs() {
    local service="${1:-}"
    local lines="${2:-100}"

    cd "${PROJECT_DIR}"

    if [ -n "$service" ]; then
        log_info "查看 $service 日志 (最近 $lines 行)..."
        $COMPOSE_CMD -f "$COMPOSE_FILE" logs -f --tail="$lines" "$service"
    else
        log_info "查看所有服务日志 (最近 $lines 行)..."
        $COMPOSE_CMD -f "$COMPOSE_FILE" logs -f --tail="$lines"
    fi
}

# 更新并重启
do_update() {
    log_info "更新 MarkFlow..."

    cd "${PROJECT_DIR}"

    # 拉取最新代码 (如果是 git 仓库)
    if [ -d "${PROJECT_DIR}/.git" ]; then
        log_info "拉取最新代码..."
        git pull origin main || git pull origin master || log_warn "Git 拉取失败，跳过"
    fi

    # 重新构建
    log_info "重新构建镜像..."
    $COMPOSE_CMD -f "$COMPOSE_FILE" build --no-cache

    # 重启服务
    log_info "重启服务..."
    $COMPOSE_CMD -f "$COMPOSE_FILE" up -d --force-recreate

    log_success "更新完成"
    wait_for_healthy
    show_access_info
}

# 清理
do_clean() {
    local deep="${1:-}"

    log_warn "清理项目..."

    cd "${PROJECT_DIR}"

    # 停止并删除容器
    $COMPOSE_CMD -f "$COMPOSE_FILE" down -v --remove-orphans

    # 删除前端构建产物
    rm -rf "${PROJECT_DIR}/dist"

    if [ "$deep" = "--deep" ] || [ "$deep" = "-d" ]; then
        log_warn "执行深度清理..."

        # 删除相关 Docker 镜像
        docker images --filter "reference=markflow/*" -q | xargs -r docker rmi -f 2>/dev/null || true

        # 清理未使用的 Docker 资源
        docker system prune -f

        log_warn "深度清理完成"
    fi

    log_success "清理完成"
}

# 进入容器
do_exec() {
    local service="${1:-server}"
    local cmd="${2:-/bin/sh}"

    log_info "进入 $service 容器..."

    cd "${PROJECT_DIR}"
    $COMPOSE_CMD -f "$COMPOSE_FILE" exec "$service" $cmd
}

# 健康检查
do_health() {
    log_info "执行健康检查..."

    local all_healthy=true

    # 检查前端
    if curl -s -o /dev/null -w "%{http_code}" http://localhost 2>/dev/null | grep -q "200\|301\|302"; then
        echo -e "  前端服务 (Nginx):   ${GREEN}✓ 正常${NC}"
    else
        echo -e "  前端服务 (Nginx):   ${RED}✗ 异常${NC}"
        all_healthy=false
    fi

    # 检查后端
    if curl -s -o /dev/null -w "%{http_code}" http://localhost/api/health 2>/dev/null | grep -q "200"; then
        echo -e "  后端服务 (Express): ${GREEN}✓ 正常${NC}"
    else
        echo -e "  后端服务 (Express): ${RED}✗ 异常${NC}"
        all_healthy=false
    fi

    echo ""
    if [ "$all_healthy" = true ]; then
        log_success "所有服务运行正常"
    else
        log_error "部分服务异常，请使用 './deploy.sh logs' 查看日志"
        exit 1
    fi
}

# 等待后端健康检查通过
wait_for_healthy() {
    log_info "等待服务就绪..."
    local retries=30
    local count=0
    while [ $count -lt $retries ]; do
        if curl -s -o /dev/null -w "%{http_code}" http://localhost/api/health 2>/dev/null | grep -q "200"; then
            log_success "服务健康检查通过"
            return 0
        fi
        count=$((count + 1))
        printf "."
        sleep 2
    done
    echo ""
    log_warn "健康检查超时，请使用 './deploy.sh logs' 查看日志排查问题"
}

# 显示访问信息
show_access_info() {
    echo ""
    echo -e "${CYAN}══════════════════════════════════════════════${NC}"
    log_success "MarkFlow 已部署成功！"
    echo ""
    echo "  访问地址:  http://localhost"
    echo "  编辑器:    http://localhost/editor"
    echo "  健康检查:  http://localhost/api/health"
    echo ""
    echo "  查看日志:  ./deploy.sh logs"
    echo "  查看状态:  ./deploy.sh status"
    echo "  停止服务:  ./deploy.sh stop"
    echo -e "${CYAN}══════════════════════════════════════════════${NC}"
    echo ""
}

# 显示帮助
show_help() {
    print_banner
    echo "用法: ./deploy.sh [命令] [选项]"
    echo ""
    echo "命令:"
    echo "  start               启动所有服务"
    echo "  stop                停止所有服务"
    echo "  restart [service]   重启服务 (可指定单个服务)"
    echo "  status              查看服务状态及资源占用"
    echo "  logs [service] [n]  查看日志 (可指定服务和行数)"
    echo "  build [service]     构建镜像 (可指定单个服务)"
    echo "  update              拉取代码、重新构建并重启"
    echo "  clean [--deep]      清理容器和构建产物 (--deep 深度清理镜像)"
    echo "  health              健康检查"
    echo "  exec [service]      进入容器 (默认 server)"
    echo "  help                显示帮助信息"
    echo ""
    echo "示例:"
    echo "  ./deploy.sh start              # 启动所有服务"
    echo "  ./deploy.sh logs server 200    # 查看后端日志最近 200 行"
    echo "  ./deploy.sh restart frontend   # 重启前端服务"
    echo "  ./deploy.sh build server       # 仅重新构建后端镜像"
    echo "  ./deploy.sh exec server        # 进入后端容器"
    echo "  ./deploy.sh clean --deep       # 深度清理（含镜像）"
    echo ""
    echo "服务列表:"
    echo "  - frontend   前端服务 (Nginx + React SPA)"
    echo "  - server     后端服务 (Node.js + Express + Puppeteer)"
    echo ""
}

#-------------------------------------------------------------------------------
# 主程序
#-------------------------------------------------------------------------------

main() {
    local command="${1:-help}"
    shift || true

    # 初始化 compose 命令
    COMPOSE_CMD=$(get_compose_cmd)

    case "$command" in
        start)
            check_requirements
            print_banner
            do_build
            do_start
            ;;
        stop)
            print_banner
            do_stop
            ;;
        restart)
            print_banner
            do_restart "$@"
            ;;
        status)
            print_banner
            do_status
            ;;
        logs)
            do_logs "$@"
            ;;
        build)
            check_requirements
            print_banner
            do_build "$@"
            ;;
        update)
            check_requirements
            print_banner
            do_update
            ;;
        clean)
            print_banner
            do_clean "$@"
            ;;
        health)
            print_banner
            do_health
            ;;
        exec)
            do_exec "$@"
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            log_error "未知命令: $command"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

main "$@"
