# syntax=docker/dockerfile:1
FROM node:22-alpine
WORKDIR /app
RUN --mount=type=secret,id=proxy_ca sh -ec 'if [ -f /run/secrets/proxy_ca ]; then cat /etc/ssl/cert.pem /run/secrets/proxy_ca > /tmp/build-ca.pem; export SSL_CERT_FILE=/tmp/build-ca.pem; fi; apk add --no-cache openssl; rm -f /tmp/build-ca.pem'
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN --mount=type=secret,id=proxy_ca sh -c 'if [ -f /run/secrets/proxy_ca ]; then export NODE_EXTRA_CA_CERTS=/run/secrets/proxy_ca; fi; npm ci --strict-ssl=true && npm run build && npm cache clean --force'
EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && npx tsx prisma/seed.ts && npm start"]
