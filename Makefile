build:
	deno run --unstable -A https://deno.land/x/lume@v0.24.0/cli.js

dev:
	deno run --unstable -A https://deno.land/x/lume@v0.24.0/cli.js --serve --dev

ipfs:
	ipfs name publish --key=barlingshult /ipfs/$(ipfs add -r _site -Q)
	ipfs pin remote add --service=pinata $(ipfs add -r _site -Q -n)

deploy:
	rsync -avz ./_site/ static@kvm.vufuzi.se:/home/static/barlingshult.se
