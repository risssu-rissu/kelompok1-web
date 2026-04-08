FROM nginx:alpine

# Salin semua file statis dari folder frontend ini
# ke dalam direktori default Nginx html
COPY . /usr/share/nginx/html

# Ekspos port 80 untuk lalu lintas HTTP
EXPOSE 80

# Jalankan server
CMD ["nginx", "-g", "daemon off;"]
