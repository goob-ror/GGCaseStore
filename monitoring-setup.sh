#!/bin/bash

# PM2 Monitoring and Management Setup Script
# This script sets up monitoring tools and management commands for your application

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

log "Setting up PM2 monitoring and management tools..."

# 1. Install PM2 monitoring tools
log "Installing PM2 monitoring extensions..."
pm2 install pm2-logrotate
pm2 install pm2-server-monit

# 2. Configure log rotation
log "Configuring log rotation..."
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
pm2 set pm2-logrotate:compress true
pm2 set pm2-logrotate:dateFormat YYYY-MM-DD_HH-mm-ss
pm2 set pm2-logrotate:workerInterval 30
pm2 set pm2-logrotate:rotateInterval 0 0 * * *

# 3. Configure server monitoring
log "Configuring server monitoring..."
pm2 set pm2-server-monit:monitor true
pm2 set pm2-server-monit:port 8082

# 4. Create management scripts
log "Creating management scripts..."

# Create start script
cat > start-app.sh << 'EOF'
#!/bin/bash
echo "Starting GG Catalog API..."
pm2 start ecosystem.config.js --env production
pm2 save
echo "Application started successfully!"
pm2 status
EOF

# Create stop script
cat > stop-app.sh << 'EOF'
#!/bin/bash
echo "Stopping GG Catalog API..."
pm2 stop gg-catalog-api
echo "Application stopped successfully!"
EOF

# Create restart script
cat > restart-app.sh << 'EOF'
#!/bin/bash
echo "Restarting GG Catalog API..."
pm2 restart gg-catalog-api
echo "Application restarted successfully!"
pm2 status
EOF

# Create status script
cat > status-app.sh << 'EOF'
#!/bin/bash
echo "=== PM2 Status ==="
pm2 status

echo ""
echo "=== System Resources ==="
pm2 monit --no-interaction &
MONIT_PID=$!
sleep 3
kill $MONIT_PID 2>/dev/null || true

echo ""
echo "=== Recent Logs ==="
pm2 logs gg-catalog-api --lines 10 --nostream

echo ""
echo "=== Application Health ==="
curl -s http://localhost:3000/api/health | jq . 2>/dev/null || curl -s http://localhost:3000/api/health
EOF

# Create backup script
cat > backup-app.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/gg-catalog"
DATE=$(date +%Y%m%d_%H%M%S)
APP_DIR="/var/www/gg-catalog"

echo "Creating backup..."
sudo mkdir -p $BACKUP_DIR

# Backup application files
sudo tar -czf $BACKUP_DIR/app_$DATE.tar.gz -C $APP_DIR .

# Backup database
mysqldump -u root -p gg_catalog_db > $BACKUP_DIR/database_$DATE.sql

# Keep only last 7 backups
sudo find $BACKUP_DIR -name "app_*.tar.gz" -mtime +7 -delete
sudo find $BACKUP_DIR -name "database_*.sql" -mtime +7 -delete

echo "Backup completed: $BACKUP_DIR"
ls -la $BACKUP_DIR
EOF

# Create update script
cat > update-app.sh << 'EOF'
#!/bin/bash
APP_DIR="/var/www/gg-catalog"

echo "Updating GG Catalog application..."

# Backup current version
./backup-app.sh

# Pull latest changes (if using git)
# cd $APP_DIR && git pull origin main

# Install/update dependencies
cd $APP_DIR && npm install --production

# Restart application
pm2 restart gg-catalog-api

# Run health check
sleep 5
curl -f http://localhost:3000/api/health && echo "✅ Update successful!" || echo "❌ Update failed - check logs"
EOF

# Make scripts executable
chmod +x *.sh

# 5. Create systemd service for PM2 (alternative to pm2 startup)
log "Creating systemd service..."
sudo tee /etc/systemd/system/gg-catalog.service > /dev/null << EOF
[Unit]
Description=GG Catalog API
After=network.target

[Service]
Type=forking
User=$USER
WorkingDirectory=/var/www/gg-catalog
ExecStart=/usr/bin/pm2 start ecosystem.config.js --env production
ExecReload=/usr/bin/pm2 reload ecosystem.config.js --env production
ExecStop=/usr/bin/pm2 stop ecosystem.config.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Enable the service
sudo systemctl daemon-reload
sudo systemctl enable gg-catalog.service

# 6. Create monitoring cron jobs
log "Setting up monitoring cron jobs..."
(crontab -l 2>/dev/null; echo "# GG Catalog monitoring") | crontab -
(crontab -l 2>/dev/null; echo "*/5 * * * * curl -f http://localhost:3000/api/health > /dev/null || echo 'API health check failed' | logger") | crontab -
(crontab -l 2>/dev/null; echo "0 2 * * * /var/www/gg-catalog/backup-app.sh") | crontab -

log "✅ Monitoring setup completed!"

echo ""
echo "Available management commands:"
echo "  ./start-app.sh     - Start the application"
echo "  ./stop-app.sh      - Stop the application"
echo "  ./restart-app.sh   - Restart the application"
echo "  ./status-app.sh    - Check application status"
echo "  ./backup-app.sh    - Create backup"
echo "  ./update-app.sh    - Update application"
echo ""
echo "PM2 commands:"
echo "  pm2 monit          - Real-time monitoring dashboard"
echo "  pm2 logs           - View application logs"
echo "  pm2 status         - Check process status"
echo "  pm2 restart all    - Restart all processes"
echo ""
echo "System service commands:"
echo "  sudo systemctl start gg-catalog    - Start via systemd"
echo "  sudo systemctl stop gg-catalog     - Stop via systemd"
echo "  sudo systemctl status gg-catalog   - Check systemd status"
