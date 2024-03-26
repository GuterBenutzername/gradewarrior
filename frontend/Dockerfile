FROM node AS build

WORKDIR /app

COPY package.json /app

RUN npm install -g pnpm

RUN pnpm install

COPY . /app

# RUN pnpm run build

# FROM jitesoft/lighttpd

# COPY --from=build /app/dist /var/www/html/

# EXPOSE 80

