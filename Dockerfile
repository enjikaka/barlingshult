FROM denoland/deno:debian-2.0.0 AS builder

WORKDIR /app

# These steps will be re-run upon each file change in your working directory:
ADD . .
RUN deno task build

FROM karlsson/deno-file-server
EXPOSE 5000
COPY --from=builder /app/_site /usr/app/src
