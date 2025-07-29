# Production Webpack Setup Guide

This guide explains how to set up live-reload functionality for the GG Case Catalogs project in a production environment.

## Overview

The project uses a webpack-based build system with separate configurations for development and production environments. The setup includes:

- **Development Server**: Webpack Dev Server with hot module replacement
- **Production Build**: Optimized bundles with code splitting and minification
- **API Proxy**: Automatic proxying of API requests to the backend server

## Prerequisites

1. Node.js (v16 or higher)
2. npm or yarn package manager
3. MySQL database server
4. Web server (Apache/Nginx) for production deployment

## Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=gg_catalog_db

# Session Configuration
SESSION_SECRET=your-super-secret-session-key

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:8080,http://localhost:3000

# Server Configuration
PORT=3000
```

### 3. Database Setup

Run the database schema:

```bash
mysql -u your_username -p < database_schema.sql
```

### 4. Start Development Environment

```bash
# Start both API server and webpack dev server
npm start

# Or start them separately:
npm run start:api  # Starts API server on port 3000
npm run dev        # Starts webpack dev server on port 8080
```

The development server will automatically:
- Open your browser to `http://localhost:8080`
- Proxy API requests to `http://localhost:3000`
- Enable hot module replacement for instant updates
- Watch for file changes and reload automatically

## Production Deployment

### 1. Build for Production

```bash
npm run build
```

This creates optimized files in the `dist/` directory with:
- Minified JavaScript and CSS
- Code splitting for better caching
- Source maps for debugging
- Asset optimization

### 2. Web Server Configuration

#### Apache Configuration

Create a `.htaccess` file in your web root:

```apache
RewriteEngine On

# Handle client-side routing
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/api/
RewriteRule . /index.html [L]

# API proxy to Node.js server
RewriteCond %{REQUEST_URI} ^/api/
RewriteRule ^api/(.*)$ http://localhost:3000/api/$1 [P,L]
```

#### Nginx Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/your/dist;
    index index.html;

    # Serve static files
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Enable gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

### 3. Process Management

Use PM2 for production process management:

```bash
# Install PM2 globally
npm install -g pm2

# Create ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'gg-catalog-api',
    script: 'api/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
EOF

# Start the application
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Live-Reload in Production

For live-reload functionality in production (useful for staging environments):

### 1. Use Webpack Dev Server in Production Mode

```bash
# Build and serve with webpack dev server
npm run build
npx webpack serve --config webpack/webpack.prod.js --host 0.0.0.0 --port 8080
```

### 2. Alternative: File Watching with Nodemon

Create a production watch script:

```json
{
  "scripts": {
    "watch:prod": "concurrently \"nodemon api/index.js\" \"webpack --config webpack/webpack.prod.js --watch\""
  }
}
```

## Security Considerations

1. **Environment Variables**: Never commit `.env` files to version control
2. **HTTPS**: Always use HTTPS in production
3. **Rate Limiting**: The API includes built-in rate limiting
4. **CORS**: Configure ALLOWED_ORIGINS properly
5. **Session Security**: Use secure session configuration for HTTPS

## Troubleshooting

### Common Issues

1. **API Proxy Not Working**: Check that the API server is running on port 3000
2. **Build Errors**: Ensure all dependencies are installed with `npm install`
3. **Database Connection**: Verify database credentials in `.env` file
4. **Port Conflicts**: Change ports in webpack.dev.js if 8080 is occupied

### Performance Optimization

1. **Bundle Analysis**: Use webpack-bundle-analyzer to analyze bundle size
2. **Caching**: Configure proper cache headers for static assets
3. **CDN**: Consider using a CDN for static assets in production
4. **Database**: Optimize database queries and add proper indexes

## Monitoring

Set up monitoring for production:

```bash
# Monitor with PM2
pm2 monit

# View logs
pm2 logs gg-catalog-api

# Restart application
pm2 restart gg-catalog-api
```

This setup provides a robust development and production environment with live-reload capabilities and proper optimization for both scenarios.
