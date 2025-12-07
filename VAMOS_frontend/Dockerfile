# Faza 1: Budowanie (używamy Node.js)
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json .
COPY package-lock.json . 
# Dodajemy flagę --legacy-peer-deps na wypadek konfliktu zależności
RUN npm install --legacy-peer-deps
COPY . .
# Uruchom polecenie budowania Reacta (Vite generuje pliki do 'dist')
RUN npm run build 

# Faza 2: Serwowanie
FROM nginx:alpine
# Kopiowanie plików statycznych z folderu 'dist' (domyślny folder Vite) do ścieżki Nginx
COPY --from=build /app/dist /usr/share/nginx/html
# Dodajemy minimalną konfigurację Nginx, aby poprawnie obsługiwał routing w React (SPA - Single Page Application)
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]