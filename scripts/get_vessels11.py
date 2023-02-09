import json
import urllib2
from datetime import datetime, timedelta

import io
import sqlite3
from time import time
import sys

from StringIO import StringIO
import gzip

def make_gzip_request(uri):
	request = urllib2.Request(uri)
	request.add_header('Accept-encoding', 'gzip')
	request.add_header('Digitraffic-User', 'Saaristolautat.fi')
	request.add_header('User-Agent', 'SaaristolautatLive/10.0')
	print(request)
	response = urllib2.urlopen(request)
	if response.info().get('Content-Encoding') == 'gzip':
		buf = StringIO(response.read())
		f = gzip.GzipFile(fileobj=buf)
		data = f.read()
		return data
	else:
		return response

database = sys.argv[1]
update_history = sys.argv[2] == 'True'

centerLat = "60"
centerLng = "20.5"
radius = "200"
dateStr = (datetime.utcnow() - timedelta(hours=5)).isoformat() + 'Z'
#dateStr = (datetime.utcnow() - timedelta(hours=18)).isoformat() + 'Z'

api_base_uri = "https://meri.digitraffic.fi/api/v1/"
#api_base_uri = "http://meri-aws-test.digitraffic.fi/api/v1/"

known_passanger_vessels = [230129940]

location_uri = "%s/locations/latitude/%s/longitude/%s/radius/%s/from/%s" % (api_base_uri, centerLat, centerLng, radius, dateStr)
vessels_uri = "%s/metadata/vessels" % (api_base_uri)

vessel_json = make_gzip_request(vessels_uri)
location_json = make_gzip_request(location_uri)

vessel_data = json.loads(vessel_json)
passangerVessels = [a for a in vessel_data if a[u'shipType'] == 60 or a[u'shipType'] == 0 or a[u'mmsi'] in known_passanger_vessels ]

vesselDict = {}
for v in passangerVessels:
	vesselDict[v[u'mmsi']] = v

location_data = json.loads(location_json)
feature_collection = location_data[u'features']
modified_collection = [f for f in feature_collection if f[u'mmsi'] in vesselDict ]

for f in modified_collection:
	f[u'properties'][u'vessel'] = vesselDict[f[u'mmsi']]
	f[u'properties'][u'mmsi'] = f[u'mmsi']

location_data[u'features'] = modified_collection

with io.open('livedata.json1', 'w') as f:
  f.write(unicode(json.dumps(location_data).encode('UTF-8')))

if not update_history:
	exit()

# write to db

def extract_history(d):
	coords = d[u'geometry']['coordinates']
	props = d[u'properties']
	return (d[u'mmsi'],props[u'timestampExternal'],round(coords[1],6),round(coords[0],6),props[u'sog'],props[u'heading'])

data = map(extract_history, modified_collection)

connection = sqlite3.connect(database)
c = connection.cursor()
c.executemany('INSERT INTO snapshots VALUES(?,?,?,?,?,?)', data)
connection.commit()

# read history from db

timelimit = int((time()-3600*3)*1000)
c.execute('select * from snapshots where timestamp > ? and sog > 0.1 order by mmsi, timestamp desc;', (timelimit,))

def longJump(row, prevRow):
	#print row, prevRow
	if prevRow == None:
		return False
	if abs(row[1] - prevRow[1]) > 300000:
		return True
	if abs(row[2] - prevRow[2]) > 0.1:
		return True
	if abs(row[3] - prevRow[3]) > 0.1:
		return True
	return False

features = []
currmmsi = None
prevRow = None
row = c.fetchone()
while row:
	mmsi = row[0]
	if mmsi != currmmsi:
		feature = { 'type': 'Feature', 'mmsi': mmsi, 'id': 'h' + str(mmsi), 'geometry': {'type': 'MultiLineString', 'coordinates': [[]]}}
		currmmsi = mmsi
		features.append(feature)
		lineIndex = 0
		prevRow = None
	if longJump(row, prevRow):
		#print 'new row'
		feature['geometry']['coordinates'].append([])
		lineIndex = lineIndex + 1

	coords = [round(row[3],6), round(row[2],6)]
	feature['geometry']['coordinates'][lineIndex].append(coords)
	prevRow = row
	row = c.fetchone()

c.close()
connection.close()
featureCollection = {'type': 'FeatureCollection', 'features': features} 

js = json.dumps(featureCollection).encode("UTF-8")
with io.open('livehistory.json1', 'a') as f:
    f.write(unicode(js))

