FROM 416670754337.dkr.ecr.eu-west-2.amazonaws.com/ci-node-runtime-18
WORKDIR /opt

COPY dist ./dist
COPY ./package.json ./package-lock.json docker_start.sh routes.yaml ./
COPY ./dist/views ./views
COPY node_modules ./node_modules


RUN dnf update -y && \
        dnf install -y \
        tar

CMD ["./docker_start.sh"]

EXPOSE 3000
