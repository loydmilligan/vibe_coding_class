FROM nginx:alpine
# Copy static assets to Nginx default directory
COPY public /usr/share/nginx/html
# Custom Nginx config could go here, but default is fine for a single file
