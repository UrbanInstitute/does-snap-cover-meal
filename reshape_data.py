import csv
import json

FIPS = {"AK":"02","MS":"28","AL":"01","MT":"30","AR":"05","NC":"37","AS":"60","ND":"38","AZ":"04","NE":"31","CA":"06","NH":"33","CO":"08","NJ":"34","CT":"09","NM":"35","DC":"11","NV":"32","DE":"10","NY":"36","FL":"12","OH":"39","GA":"13","OK":"40","GU":"66","OR":"41","HI":"15","PA":"42","IA":"19","PR":"72","ID":"16","RI":"44","IL":"17","SC":"45","IN":"18","SD":"46","KS":"20","TN":"47","KY":"21","TX":"48","LA":"22","UT":"49","MA":"25","VA":"51","MD":"24","VI":"78","ME":"23","VT":"50","MI":"26","WA":"53","MN":"27","WI":"55","MO":"29","WV":"54","WY":"56"}

cr = csv.reader(open("data/source.csv", encoding='latin-1'))
# cw = csv.writer(open("data/data.csv","wb"))
# cw.writerow(["fips","label","cost"])

sourceDict = json.load(open("data/source/source_json.json"))


head = next(cr)
for row in cr:
	state = row[1]
	label = row[2]
	cost = row[7]
	snap = row[5]
	snap15 = row[6]

	stateFips = FIPS[state]
	countyFips = row[0]
	fips = countyFips.zfill(5)
	print(fips)
	# cw.writerow([fips, label, cost])
	for o in sourceDict["objects"]["counties"]["geometries"]:
		if o["id"] == fips:
			# print o
			o["properties"] = {}
			o["properties"]["label"] = label
			o["properties"]["cost"] = cost
			o["properties"]["snap"] = snap
			o["properties"]["snap15"] = snap15

# print sourceDict["objects"]["counties"]["geometries"]

with open('data/data.json', 'w') as outfile:
    json.dump(sourceDict, outfile)



