build:
	deno task build

dev:
	deno task serve

ipfs:
	ipfs name publish --key=barlingshult /ipfs/$(ipfs add -r _site -Q)
	ipfs pin remote add --service=pinata $(ipfs add -r _site -Q -n)

sync_images:
	rsync -a $(DEST):/home/static/barlingshult.se/img _cache/

deploy_pi: build
  rsync -a _site/ 192.168.0.89:/var/www/barlingshult

deploy: build
	rsync -a _site/ $(DEST):/home/static/barlingshult.se/

sync_images:
	rsync -a $(DEST):/home/static/barlingshult.se/img _cache/

sync_posts:
	rsync -a $(DEST):/home/static/barlingshult.se/blogg .
