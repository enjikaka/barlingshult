FROM denoland/deno:alpine-1.11.4

WORKDIR /app

# Prefer not to run as root.
USER deno
# These steps will be re-run upon each file change in your working directory:
ADD . .
# Compile the main app so that it doesn't need to be compiled each startup/entry.
RUN deno cache _config.js

RUN make build
