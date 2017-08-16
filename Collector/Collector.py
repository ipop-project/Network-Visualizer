#!/usr/bin/env python

import Config
import time, json, sys, logging, urllib, json
from flask import Flask, make_response, render_template, request, flash, redirect, url_for
from flask_cors import CORS, cross_origin
from pymongo import MongoClient
from threading import Lock, Thread

py_ver = sys.version_info[0]
app = Flask(__name__)
app.secret_key = 'IPOP VIS'
CORS(app)

log = logging.getLogger('werkzeug')
log.setLevel(Config.collector_conf['log_level'])
logfh = logging.FileHandler("./" + Config.collector_conf['log_filename'])
logform = logging.Formatter(fmt='[%(asctime)s] %(message)s')
logfh.setFormatter(logform)
log.addHandler(logfh)

#Initializing Global variables
batchdelay = Config.collector_conf['batchdelay']
loction_update_delay = Config.collector_conf['location_update_delay']
lock = Lock()
statkeys = ('uid', 'name', 'node_name', 'mac', 'ip4', 'starttime')
dkeys = ('links', 'timestamp', 'macuidmapping', 'state')
mc = MongoClient()
if Config.collector_conf['clear_on_start']:
    mc.drop_database(Config.conf['dbname'])
ipopdb = mc[Config.conf['dbname']]
nodeData = ipopdb[Config.conf['colname']]
if Config.collector_conf['clear_on_start']:
    ipopdb['shareddata'].insert_one({"name":"firstaggrt", "timestamp":(int(time.time()) + batchdelay*2)})
tempbatch = {}

# Receives data from IPOP Controllers
@app.route('/insertdata',methods=['GET', 'POST'])
@cross_origin()
def listener():
    msg = request.json
    log.info("Received msg from " + msg['node_name'])
    lock.acquire()
    tempbatch[msg["uid"]] = msg
    # update uptime with aggregator timezone - done in batchtimer
    lock.release()
    return "200"

def getloc(geoip):
    locdata = {}
    try:
        #{u'status': u'success', u'data': {u'geo': {u'city': u'Gainesville', u'dma_code': u'592', u'ip': u'70.171.32.182', u'region': u'FL', u'isp': u'Cox Communications Inc. ', u'area_code': u'352', u'continent_code': u'NA', u'datetime': u'2017-03-29 15:02:00', u'latitude': u'29.573099136353', u'host': u'70.171.32.182', u'postal_code': u'32608', u'longitude': u'-82.407600402832', u'country_code': u'US', u'country_name': u'United States', u'timezone': u'America/New_York', u'asn': u'AS22773', u'rdns': u'ip70-171-32-182.ga.at.cox.net'}}, u'description': u'Data successfully received.'}
        resp = urllib.urlopen("https://tools.keycdn.com/geo.json?host=" + geoip)
        geod = json.loads(resp.read())
        if geod['status'] == 'success':
            geod = geod['data']['geo']
            locdata['city'] = geod['city']
            locdata['region'] = geod['region']
            locdata['latitude'] = geod['latitude']
            locdata['longitude'] = geod['longitude']
            locdata['country'] = geod['country_name']
    except Exception as e:
        log.error("Error in getloc: " + str(e.message))
        return {}
    return locdata

def batchtimer():
    global tempbatch # need to process the batch
    while True:
        time.sleep(batchdelay) # wait for batchdelay seconds
        log.info("Running batchtimer")
        lock.acquire()  # acquire lock and atomically swap with empty dict
        tempbatch, toprocess = {}, tempbatch
        lock.release()
        currtime = int(time.time()) # all the timestamps are modified to currtime - to change TZ and set a common time ref
        for msg in toprocess.values():
            try:
                msg["starttime"] = msg["timestamp"] = currtime # set starttime for setOnInsert, if upsert, only push history
                res = nodeData.update_one({"uid":msg["uid"]}, {"$push":{"history":{dk:msg[dk] for dk in dkeys}}, '$set':{'GeoIP':msg['GeoIP']}, "$setOnInsert":{sk:msg[sk] for sk in statkeys}}, upsert=True)
                # MongoDB document has a hard limit of 16MB and this can potentially overflow. Gives a kind of error in the UpdateResult document 'res', but difficult to log just the error
                if res.upserted_id != None and len(msg["GeoIP"].strip()) > 0: # upsert took place
                    # update location
                    res = nodeData.update_one({"uid":msg["uid"]}, {"$set":{"location":getloc(msg["GeoIP"])}})
            except Exception as e:
                log.error("Error in batchtimer" + str(e.message) + "\nmsg: " + str(msg))

def locationtimer():
    while True:
        time.sleep(loction_update_delay)
        log.info("Running locationtimer")
        try:
            for node in nodeData.find({}, {'uid':1, 'GeoIP':1}):
                if len(node['GeoIP'].strip()) > 0:
                    nodeData.update_one({'uid':node['uid']}, {'$set':{'location':getloc(node['GeoIP'])}})
        except Exception as e:
            log.error("Error in locationtimer" + str(e.message) + "\nnode: " + str(msg))

def main(ipv4):
    bthread = Thread(target=batchtimer)
    bthread.start()
    locthread = Thread(target=locationtimer)
    locthread.start()
    app.run(host=ipv4,port=Config.collector_conf['port'],threaded=True)                             # Start the IPOP webserver

if __name__ == "__main__":
    if len(sys.argv)>1:
        ipv4 = sys.argv[1]
    else:
        ipv4 = Config.collector_conf['ip']
    try:
        main(ipv4)
    except Exception as err:
        log.error("Exception::" + str(err.message))
