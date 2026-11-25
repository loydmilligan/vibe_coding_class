FROM nginx:alpine
# Site config: static files, plus /api/ proxied to the help bot container
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copy static assets to Nginx default directory
COPY public /usr/share/nginx/html
