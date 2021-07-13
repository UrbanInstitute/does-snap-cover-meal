#snap-and-food-costs

## Update instructions:
- Replace [source.csv](data/source.csv) with a csv of the source data from the researchers
- Run [reshape_data.py](reshape_data.py). This pulls in the source data (source.csv), merges it with a US [topojson](data/source/source_json.json), and outputs the final data file, [data.json](data/data.json)
- That's about it! Any final text edits should be relatively straightforward to find in either [child.html](child.html) or [main.js](js/main.js)
