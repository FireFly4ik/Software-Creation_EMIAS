FROM node:18-alpine AS build

WORKDIR /app

# Копируем package.json из папки webapp
COPY webapp/package.json ./
COPY webapp/package-lock.json* ./

# Устанавливаем все зависимости
RUN npm install

# Копируем все файлы из webapp
COPY webapp/ .

# Принимаем аргумент для API URL
ARG REACT_APP_API_URL=/api
ENV REACT_APP_API_URL=$REACT_APP_API_URL

RUN npm run build

FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html

# Копируем nginx.conf который лежит в front/
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]