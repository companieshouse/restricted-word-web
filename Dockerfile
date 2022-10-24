FROM 169942020521.dkr.ecr.eu-west-1.amazonaws.com/base/node:16-alpine-builder
FROM 169942020521.dkr.ecr.eu-west-1.amazonaws.com/base/node:16-alpine-runtime

# Maintainer
LABEL maintainer="Parental Advisory"

RUN cp -r ./dist/views ./

EXPOSE 3000
CMD ["./dist/app"]