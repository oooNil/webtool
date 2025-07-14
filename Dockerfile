FROM node:20-alpine

RUN apk add --no-cache \
    curl \
    tar \
    gzip \
    ca-certificates \
    bash

RUN curl -sL https://mirror.openshift.com/pub/openshift-v4/clients/ocp/stable/openshift-client-linux.tar.gz | \
    tar -xzv -C /usr/local/bin && \
    chmod +x /usr/local/bin/oc

WORKDIR /app

#COPY package*.json ./
COPY restart.js ./

COPY public ./public

RUN npm install express

EXPOSE 3000

CMD ["node", "restart.js"]
