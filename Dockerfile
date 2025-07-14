FROM registry.access.redhat.com/ubi8/nodejs-22:latest

USER root

RUN curl -sL https://mirror.openshift.com/pub/openshift-v4/clients/oc/latest/linux/oc.tar.gz | tar -C /usr/local/bin -xzf - && \
    chmod +x /usr/local/bin/oc

RUN dnf install -y make gcc-c++ python3 && \
    dnf clean all

RUN npm install express

USER 1001

WORKDIR /app

COPY restart.js ./

COPY public ./public

RUN npm install --omit=dev

EXPOSE 3000

CMD ["node", "restart.js"]
