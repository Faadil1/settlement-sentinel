# Settlement Sentinel — single-service Cloud Run image
# Builds the Vite frontend and the Express server, then runs the server
# (which serves the built frontend as static files).

FROM node:20-slim AS build
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20-slim AS run
WORKDIR /app
ENV NODE_ENV=production
COPY package.json ./
RUN npm install --omit=dev
COPY --from=build /app/dist ./dist
COPY --from=build /app/dist-server ./dist-server

# Cloud Run injects PORT; the server reads process.env.PORT directly.
EXPOSE 8080
CMD ["node", "dist-server/server.js"]
