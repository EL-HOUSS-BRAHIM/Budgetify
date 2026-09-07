#!/bin/bash

# Script to configure Nginx for serving a React app with SSL.
# The script creates necessary directories, configures Nginx, 
# and prompts the user for SSL certificates.

# Get the current logged-in user and working directory
USER=$(whoami)
FRONTEND_DIR=$(pwd)

# Ensure the frontend directory is accessible
echo "Setting permissions for $FRONTEND_DIR..."
sudo chmod 775 /home/$USER/

# Create a directory for SSL certificates
CERT_DIR="$FRONTEND_DIR/certs"
if [ ! -d "$CERT_DIR" ]; then
    echo "Creating directory for SSL certificates at $CERT_DIR..."
    mkdir -p $CERT_DIR
else
    echo "SSL certificate directory already exists at $CERT_DIR."
fi

# Prompt the user to provide SSL certificate and key
echo "Please provide the SSL certificate (ca-certificates.cert) and key (ca-certificates.key):"

read -p "Path to SSL certificate: " CERT_PATH
read -p "Path to SSL key: " KEY_PATH

# Copy the provided certificate and key to the certs directory
cp $CERT_PATH $CERT_DIR/certificates.cert
cp $KEY_PATH $CERT_DIR/certificates.key

# Configure Nginx for the React frontend
echo "Configuring Nginx..."

cat <<EOL > /etc/nginx/sites-available/myreact
server {
    listen 80;
    listen [::]:80;
    server_name brahim-crafts.tech;

    root $FRONTEND_DIR;

    # Redirect HTTP to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl;
    listen [::]:443;
    server_name brahim-crafts.tech;

    # Set paths to SSL certificate and key
    ssl_certificate $CERT_DIR/certificates.cert;
    ssl_certificate_key $CERT_DIR/certificates.key;

    root $FRONTEND_DIR;
    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOL

# Enable the Nginx configuration by creating a symbolic link
sudo ln -s /etc/nginx/sites-available/myreact /etc/nginx/sites-enabled/

# Test the Nginx configuration for syntax errors
sudo nginx -t

# Restart Nginx to apply changes
sudo systemctl restart nginx

# Final message indicating the setup is complete
echo "Nginx configuration for React app completed successfully."

