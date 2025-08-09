#!/bin/bash

# GG Catalog Store Deployment Script
# This script deploys your application to Ubuntu VPS with Nginx and PM2

set -e  # Exit on any error

# Configuration
APP_NAME="gg-catalog"
APP_DIR="/var/www/gg-catalog"
NGINX_SITE="gg-catalog"
DOMAIN="yourdomain.com"  # Change this to your actual domain

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   error "This script should not be run as root for security reasons"
fi

log "Starting deployment of GG Catalog Store..."

# 1. Update system packages
log "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# 2. Install required packages
log "Installing required packages..."
sudo apt install -y nginx nodejs npm mysql-server ufw fail2ban

# 3. Install PM2 globally
log "Installing PM2..."
sudo npm install -g pm2

# 4. Create application directory
log "Creating application directory..."
sudo mkdir -p $APP_DIR
sudo chown $USER:$USER $APP_DIR

# 5. Copy application files
log "Copying application files..."
cp -r ./api $APP_DIR/
cp -r ./dist $APP_DIR/
cp -r ./public $APP_DIR/
cp ./package.json $APP_DIR/
cp ./ecosystem.config.js $APP_DIR/
cp ./.env $APP_DIR/.env 2>/dev/null || warn ".env file not found, please create it manually"

# 6. Install dependencies
log "Installing Node.js dependencies..."
cd $APP_DIR
npm install --production

# 7. Create logs directory
log "Creating logs directory..."
mkdir -p $APP_DIR/logs

# 8. Setup database (if needed)
log "Setting up database..."
if [ -f "./database_schema.sql" ]; then
    warn "Please run the database setup manually:"
    echo "mysql -u root -p < database_schema.sql"
fi

# 9. Configure Nginx
log "Configuring Nginx..."
sudo cp nginx.conf /etc/nginx/sites-available/$NGINX_SITE

# Update domain in nginx config
sudo sed -i "s/yourdomain.com/$DOMAIN/g" /etc/nginx/sites-available/$NGINX_SITE
sudo sed -i "s|/var/www/gg-catalog|$APP_DIR|g" /etc/nginx/sites-available/$NGINX_SITE

# Enable the site
sudo ln -sf /etc/nginx/sites-available/$NGINX_SITE /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
sudo nginx -t || error "Nginx configuration test failed"

# 10. Configure firewall
log "Configuring firewall..."
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw allow 3000  # For direct API access if needed
sudo ufw --force enable

# 11. Start services
log "Starting services..."

# Start PM2 application
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup | tail -1 | sudo bash

# Start Nginx
sudo systemctl enable nginx
sudo systemctl restart nginx

# 12. Setup SSL (Let's Encrypt)
log "Setting up SSL certificate..."
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN

# 13. Setup log rotation
log "Setting up log rotation..."
sudo tee /etc/logrotate.d/gg-catalog > /dev/null <<EOF
$APP_DIR/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 $USER $USER
    postrotate
        pm2 reloadLogs
    endscript
}
EOF

# 14. Final checks
log "Performing final checks..."

# Check if PM2 is running
if pm2 list | grep -q "gg-catalog-api"; then
    log "✅ PM2 application is running"
else
    error "❌ PM2 application failed to start"
fi

# Check if Nginx is running
if sudo systemctl is-active --quiet nginx; then
    log "✅ Nginx is running"
else
    error "❌ Nginx failed to start"
fi

# Check if application is responding
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    log "✅ API health check passed"
else
    warn "⚠️  API health check failed - check logs with: pm2 logs"
fi

log "🎉 Deployment completed successfully!"
log "📊 Monitor your application with: pm2 monit"
log "📝 View logs with: pm2 logs gg-catalog-api"
log "🔄 Restart application with: pm2 restart gg-catalog-api"
log "🌐 Your site should be available at: https://$DOMAIN"

echo ""
log "Next steps:"
echo "1. Update your .env file with production database credentials"
echo "2. Import your database schema: mysql -u root -p < database_schema.sql"
echo "3. Test your application at https://$DOMAIN"
echo "4. Monitor with: pm2 monit"
