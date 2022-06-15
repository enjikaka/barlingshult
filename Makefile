build:
	deno run -A https://deno.land/x/lume@v1.9.1/ci.ts

dev:
	deno run -A https://deno.land/x/lume@v1.9.1/ci.ts --serve --dev

ipfs:
	ipfs name publish --key=barlingshult /ipfs/$(ipfs add -r _site -Q)
	ipfs pin remote add --service=pinata $(ipfs add -r _site -Q -n)

sync_images:
	rsync -a $(DEST):/home/static/barlingshult.se/img _cache/

deploy: build
	rsync -a _site/ $(DEST):/home/static/barlingshult.se/
