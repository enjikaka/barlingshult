FROM denoland/deno:1.43.1

# The port that your application listens to.
EXPOSE 3000

WORKDIR /app

# These steps will be re-run upon each file change in your working directory:
ADD . .
RUN deno task build
