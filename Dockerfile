FROM  python:3.7-alpine

LABEL maintainer=achillesrasquinha@gmail.com

ENV FLUXVIZ_PATH=/usr/local/src/fluxviz

RUN apk add --no-cache \
        bash \
        git \
    && mkdir -p $FLUXVIZ_PATH

COPY . $FLUXVIZ_PATH
COPY ./docker/entrypoint.sh /entrypoint.sh

WORKDIR $FLUXVIZ_PATH

RUN pip install -r ./requirements.txt && \
    python setup.py install

ENTRYPOINT ["/entrypoint.sh"]

CMD ["fluxviz"]