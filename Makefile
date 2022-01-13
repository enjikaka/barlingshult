build:
	deno run -A https://deno.land/x/lume/ci.ts

dev:
	deno run -A https://deno.land/x/lume/ci.ts --serve --dev

ipfs:
	ipfs name publish --key=barlingshult /ipfs/$(ipfs add -r _site -Q)
	ipfs pin remote add --service=pinata $(ipfs add -r _site -Q -n)

deploy: build
	rsync -a _site/ $(DEST):/home/static/barlingshult.se/
