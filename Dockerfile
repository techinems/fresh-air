FROM denoland/deno

EXPOSE 5939

WORKDIR /app

ADD . /app

RUN deno cache server.ts

CMD ["run", "--allow-net", "--allow-read", "--allow-env", "server.ts"]