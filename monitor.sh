#!/bin/bash

# Production Monitoring Script for Liquidata Backend
# This script monitors the application health and sends alerts

set -e

# Configuration
APP_NAME="liquidata-backend"
HEALTH_URL="http://localhost:5001/health"
LOG_FILE="/var/log/liquidata-monitor.log"
ALERT_EMAIL="${ALERT_EMAIL:-admin@devflow.com}"
WEBHOOK_URL="${MONITORING_WEBHOOK_URL:-}"

# Thresholds
CPU_THRESHOLD=80
MEMORY_THRESHOLD=80
DISK_THRESHOLD=85
RESPONSE_TIME_THRESHOLD=5000

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a $LOG_FILE
}

send_alert() {
    local message="$1"
    local severity="$2"
    
    log_message "ALERT [$severity]: $message"
    
    # Send webhook notification if configured
    if [ -n "$WEBHOOK_URL" ]; then
        curl -X POST "$WEBHOOK_URL" \
             -H "Content-Type: application/json" \
             -d "{\"text\":\"🚨 [$severity] Liquidata Backend Alert: $message\"}" \
             2>/dev/null || true
    fi
    
    # Send email notification (requires mailutils)
    if command -v mail &> /dev/null && [ -n "$ALERT_EMAIL" ]; then
        echo "$message" | mail -s "Liquidata Backend Alert [$severity]" "$ALERT_EMAIL" 2>/dev/null || true
    fi
}

check_application_health() {
    local start_time=$(date +%s%3N)
    
    if curl -f -s --max-time 10 "$HEALTH_URL" > /dev/null; then
        local end_time=$(date +%s%3N)
        local response_time=$((end_time - start_time))
        
        if [ $response_time -gt $RESPONSE_TIME_THRESHOLD ]; then
            send_alert "Application responding slowly: ${response_time}ms" "WARNING"
        fi
        
        return 0
    else
        return 1
    fi
}

check_pm2_status() {
    if ! pm2 list | grep -q "$APP_NAME.*online"; then
        return 1
    fi
    return 0
}

check_system_resources() {
    # Check CPU usage
    local cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
    cpu_usage=${cpu_usage%.*}  # Remove decimal part
    
    if [ "$cpu_usage" -gt $CPU_THRESHOLD ]; then
        send_alert "High CPU usage: ${cpu_usage}%" "WARNING"
    fi
    
    # Check memory usage
    local memory_usage=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100.0}')
    
    if [ "$memory_usage" -gt $MEMORY_THRESHOLD ]; then
        send_alert "High memory usage: ${memory_usage}%" "WARNING"
    fi
    
    # Check disk usage
    local disk_usage=$(df / | tail -1 | awk '{print $5}' | cut -d'%' -f1)
    
    if [ "$disk_usage" -gt $DISK_THRESHOLD ]; then
        send_alert "High disk usage: ${disk_usage}%" "CRITICAL"
    fi
}

check_log_errors() {
    local error_count=$(tail -100 /opt/liquidata-backend/logs/error.log 2>/dev/null | grep -c "$(date '+%Y-%m-%d')" || echo 0)
    
    if [ "$error_count" -gt 10 ]; then
        send_alert "High error rate: $error_count errors today" "WARNING"
    fi
}

restart_application() {
    log_message "Attempting to restart application..."
    
    if pm2 restart "$APP_NAME"; then
        log_message "Application restarted successfully"
        send_alert "Application was automatically restarted" "INFO"
        
        # Wait for application to be ready
        sleep 10
        
        if check_application_health; then
            log_message "Application health check passed after restart"
            return 0
        else
            send_alert "Application health check failed after restart" "CRITICAL"
            return 1
        fi
    else
        send_alert "Failed to restart application" "CRITICAL"
        return 1
    fi
}

main() {
    log_message "Starting health check..."
    
    # Check if PM2 process is running
    if ! check_pm2_status; then
        send_alert "PM2 process is not running" "CRITICAL"
        
        # Try to start the application
        if pm2 start ecosystem.config.js --env production; then
            log_message "Application started via PM2"
            sleep 10
        else
            send_alert "Failed to start application via PM2" "CRITICAL"
            exit 1
        fi
    fi
    
    # Check application health
    if ! check_application_health; then
        send_alert "Application health check failed" "CRITICAL"
        
        # Try to restart the application
        if ! restart_application; then
            send_alert "Application restart failed - manual intervention required" "CRITICAL"
            exit 1
        fi
    else
        log_message "Application health check passed"
    fi
    
    # Check system resources
    check_system_resources
    
    # Check for errors in logs
    check_log_errors
    
    # Log successful monitoring cycle
    log_message "Monitoring cycle completed successfully"
}

# Create log file if it doesn't exist
touch $LOG_FILE

# Run main monitoring function
main

# Cleanup old log entries (keep last 1000 lines)
tail -1000 $LOG_FILE > $LOG_FILE.tmp && mv $LOG_FILE.tmp $LOG_FILE
