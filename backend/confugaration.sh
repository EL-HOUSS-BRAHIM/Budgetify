#!/bin/bash

# Script to automatically configure Nginx, UFW firewall, Gunicorn,
# and a Python virtual environment for a Flask application.
# The script adapts to the current user and the directory where it is executed.

# Get the current logged-in user
USER=$(whoami)

# Get the current working directory, assumed to be the backend directory
BACKEND_DIR=$(pwd)

# Create a Python virtual environment
echo "Creating Python virtual environment..."

# Check if a virtual environment already exists
if [ ! -d "$BACKEND_DIR/venv" ]; then
    python3 -m venv $BACKEND_DIR/venv
    echo "Virtual environment created successfully."
else
    echo "Virtual environment already exists."
fi

# Activate the virtual environment
source $BACKEND_DIR/venv/bin/activate

# Install dependencies from requirements.txt if it exists
if [ -f "$BACKEND_DIR/requirements.txt" ]; then
    echo "Installing dependencies from requirements.txt..."
    pip install -r $BACKEND_DIR/requirements.txt
else
    echo "No requirements.txt found. Skipping dependency installation."
fi

# Prompt the user for environment variables and create a .env file
echo "Creating .env file..."

read -p "Enter DB_HOST: " DB_HOST
read -p "Enter DB_NAME: " DB_NAME
read -p "Enter DB_USER: " DB_USER
read -sp "Enter DB_PASS: " DB_PASS
echo
read -p "Enter PORT: " PORT
read -p "Enter path to CA_CERTIFICATE: " CA_CERTIFICATE_PATH
read -p "Enter SECRET_KEY: " SECRET_KEY
read -p "Enter JWT_SECRET_KEY: " JWT_SECRET_KEY
read -p "Enter MAIL_SERVER: " MAIL_SERVER
read -p "Enter MAIL_PORT: " MAIL_PORT
read -p "Enter MAIL_USERNAME: " MAIL_USERNAME
read -sp "Enter MAIL_PASSWORD: " MAIL_PASSWORD
echo
read -p "Use TLS for mail (True/False): " MAIL_USE_TLS
read -p "Use SSL for mail (True/False): " MAIL_USE_SSL

cat <<EOL > $BACKEND_DIR/.env
DB_HOST=$DB_HOST
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASS=$DB_PASS
PORT=$PORT
CA_CERTIFICATE_PATH=$CA_CERTIFICATE_PATH
SECRET_KEY=$SECRET_KEY
JWT_SECRET_KEY=$JWT_SECRET_KEY
MAIL_SERVER=$MAIL_SERVER
MAIL_PORT=$MAIL_PORT
MAIL_USERNAME=$MAIL_USERNAME
MAIL_PASSWORD=$MAIL_PASSWORD
MAIL_USE_TLS=$MAIL_USE_TLS
MAIL_USE_SSL=$MAIL_USE_SSL
EOL

echo ".env file created successfully."

# Configure Nginx
echo "Configuring Nginx..."

# Create Nginx configuration for the Flask app
# - Listens on port 80 and redirects to HTTPS (port 443)
# - Serves the Flask app through a Unix socket
# - Paths to SSL certificate and key are dynamically set based on $BACKEND_DIR
cat <<EOL > /etc/nginx/sites-available/flask.conf
server {
    listen 80;
    server_name api.brahim-crafts.tech;

    location / {
        include proxy_params;
        proxy_pass http://unix:$BACKEND_DIR/myflask.sock;
    }

    # Redirect HTTP to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl;
    server_name api.brahim-crafts.tech;

    # Set paths to SSL certificate and key
    ssl_certificate $BACKEND_DIR/certs/certificates.cert;
    ssl_certificate_key $BACKEND_DIR/certs/certificates.key;

    location / {
        include proxy_params;
        proxy_pass http://unix:$BACKEND_DIR/myflask.sock;
    }
}
EOL

# Enable the Nginx configuration by creating a symbolic link
sudo ln -s /etc/nginx/sites-available/flask.conf /etc/nginx/sites-enabled/

# Test the Nginx configuration for syntax errors
sudo nginx -t && sudo systemctl restart nginx

# Configure UFW firewall
echo "Configuring UFW firewall..."

# Enable UFW and allow necessary ports
sudo ufw enable -y
sudo ufw allow 22                          # Allow SSH
sudo ufw allow "Nginx Full"                # Allow HTTP and HTTPS for Nginx
sudo ufw status                            # Display the current firewall status

# Configure Gunicorn service
echo "Configuring Gunicorn service..."

# Create a systemd service file for Gunicorn
# - Runs the Flask app using Gunicorn with 3 workers
# - Binds to a Unix socket
# - Uses the detected user and backend directory
cat <<EOL > /etc/systemd/system/myflask.service
[Unit]
Description=Gunicorn instance to serve myflask app
After=network.target

[Service]
User=$USER
Group=www-data
WorkingDirectory=$BACKEND_DIR
Environment="PATH=$BACKEND_DIR/venv/bin"
ExecStart=$BACKEND_DIR/venv/bin/gunicorn --workers 3 --bind unix:myflask.sock -m 007 wsgi:app

[Install]
WantedBy=multi-user.target
EOL

# Start and enable the Gunicorn service to run on boot
sudo systemctl start myflask
sudo systemctl enable myflask
sudo systemctl status myflask              # Display the current status of the service

# Set the correct permissions for the backend directory
echo "Setting permissions..."
sudo chown -R $USER:www-data $BACKEND_DIR   # Change ownership to current user and www-data group
sudo systemctl daemon-reload                # Reload systemd to apply changes

# Final message indicating the setup is complete
echo "Setup completed successfully."

