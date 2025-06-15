FROM denoland/deno:debian-2.3.6 AS deps
WORKDIR /app
COPY deno.json ./
RUN deno cache jsr:@std/http/file-server

FROM denoland/deno:debian-2.3.6 AS builder
WORKDIR /app
COPY --from=deps /deno-dir /deno-dir
ENV DENO_DIR=/deno-dir
RUN deno install --global --allow-net --allow-read -r -n file-server jsr:@std/http/file-server

# These steps will be re-run upon each file change in your working directory:
ADD . .
RUN deno task build

# 3. Slutgiltig minimal runtime
FROM denoland/deno:debian-2.3.6 AS runtime
EXPOSE 8000
COPY --from=builder /usr/local/bin/file-server /usr/local/bin/file-server
COPY --from=builder /app/_site /usr/app/src
WORKDIR /usr/app/src
CMD ["file-server", ".", "--port", "8000"]
