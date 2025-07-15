FROM registry.access.redhat.com/ubi8/nodejs-22:latest

USER root
#https://mirror.openshift.com/pub/openshift-v4/clients/ocp/4.18.19/openshift-client-linux-ppc64le-rhel8-4.18.19.tar.gz
RUN curl -sL https://mirror.openshift.com/pub/openshift-v4/clients/oc/latest/linux/oc.tar.gz | tar -C /usr/local/bin -xzf - && \
    chmod +x /usr/local/bin/oc

RUN dnf install -y make gcc-c++ python3 && \
    dnf clean all

USER 1001

WORKDIR /app

RUN chown -R 1001:0 /app && \
    chmod -R g+rw /app

COPY --chown=1001:0 restart.js ./

COPY --chown=1001:0 public ./public

RUN npm install express cors
RUN npm install --omit=dev

EXPOSE 3000

CMD ["node", "restart.js"]
