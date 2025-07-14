FROM registry.redhat.io/ubi8/nodejs-22

RUN curl -sL https://mirror.openshift.com/pub/openshift-v4/clients/ocp/4.18.19/openshift-client-linux-ppc64le-rhel8-4.18.19.tar.gz | \
    tar -xzv -C /usr/local/bin && \
    chmod +x /usr/local/bin/oc

WORKDIR /app

#COPY package*.json ./
COPY restart.js ./

COPY public ./public

RUN npm install express

EXPOSE 3000

CMD ["node", "restart.js"]
