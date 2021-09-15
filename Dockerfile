FROM  python:3.7-alpine

LABEL maintainer=achillesrasquinha@gmail.com

ENV FLUXVIZ_PATH=/usr/local/src/fluxviz

RUN apk add --no-cache \
        bash \
        git \
    && mkdir -p $FLUXVIZ_PATH

COPY . $FLUXVIZ_PATH
COPY ./docker/entrypoint.sh /entrypoint.sh

RUN pip install $FLUXVIZ_PATH

WORKDIR $FLUXVIZ_PATH

ENTRYPOINT ["/entrypoint.sh"]

CMD ["fluxviz"]