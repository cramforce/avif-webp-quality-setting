# AVIF WebP quality settings

For context [see my blog post on AVIF and WebP encoding quality settings](https://www.industrialempathy.com/posts/avif-webp-quality-settings/).

Running the scripts requires having [dssim](https://github.com/kornelski/dssim) installed on your machine.

To generate data with your own samples run `node scripts/image-quality-generate.js`. Edit `scripts/image-quality-generate.js` to change the image files the script is operating on. When finished run `node scripts/image-quality-compare.js` to generate the ideal quality settings for your image set.

For a pivot table of the generated data see this [spreadsheet](https://docs.google.com/spreadsheets/d/1E29kPLR5_0PThsw6SVbco7HvMU0aynBLfVN0RfIXgPk/edit#gid=1107534790).

[Created by Malte Ubl](https://www.industrialempathy.com/)
