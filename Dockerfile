FROM denoland/deno:debian-2.8.1 AS builder

WORKDIR /app

COPY deno.json deno.lock ./
RUN deno install --frozen

COPY . .
RUN deno task build

FROM denoland/deno:alpine-2.8.1 AS runtime

WORKDIR /usr/app

RUN deno install --allow-net --allow-read --allow-sys --global jsr:@std/http/file-server
COPY --from=builder /app/_site ./_site

EXPOSE 8000
CMD ["file-server", "./_site", "--port", "8000"]
