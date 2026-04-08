# 1. Base image (fondasi)
FROM node:18-alpine

# 2. Set working directory di dalam container
WORKDIR /app

# 3. Copy file konfigurasi package.json backend terlebih dahulu 
# (Tujuan: Mempercepat build Docker dengan optimasi cache)
COPY backend/package*.json ./backend/

# 4. Pindah ke folder backend dan install dependencies
WORKDIR /app/backend
RUN npm install

# 5. Pindah kembali ke root dan copy sisa file yang ada (frontend & backend kode)
WORKDIR /app
COPY . .

# 6. Ekspos port 5001 sesuai dengan backend web siswa
EXPOSE 5001

# 7. Jalankan aplikasi (menjalankan server Node.js Web Informasi Data Siswa)
WORKDIR /app/backend
CMD ["npm", "start"]
