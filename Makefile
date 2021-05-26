build:
	deno run --unstable -A https://deno.land/x/lume@v0.20.0/cli.js

dev:
	deno run --unstable -A https://deno.land/x/lume@v0.20.0/cli.js --serve --dev

ipfs:
	# deno run --unstable -A https://deno.land/x/lume@v0.20.0/cli.js --location=https://gateway.ipfs.io/ipns/k51qzi5uqu5dj2hao7cz6xgynolrom3q0jpnxtayu32k2gh9wrzqnx9ngy0hvx
	ipfs name publish --key=barlingshult /ipfs/$(ipfs add -r _site -Q)
