# Estágio 1: Build da aplicação React
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
RUN npm run build

# Estágio 2: Servidor Nginx para servir os arquivos estáticos
FROM nginx:alpine

# Copia o build do estágio anterior para a pasta do Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Configuração opcional para garantir que o React Router funcione (se usar no futuro)
# COPY nginx.conf /etc/nginx/conf.d/default.conf 

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]