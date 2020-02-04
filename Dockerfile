FROM  python:3.7-alpine

LABEL maintainer=achillesrasquinha@gmail.com

ENV fluxviz_PATH=/usr/local/src/fluxviz

RUN apk add --no-cache \
        bash \
        git \
    && mkdir -p $fluxviz_PATH

COPY . $fluxviz_PATH
COPY ./docker/entrypoint.sh /entrypoint.sh

RUN pip install $fluxviz_PATH

WORKDIR $fluxviz_PATH

ENTRYPOINT ["/entrypoint.sh"]

CMD ["fluxviz"]