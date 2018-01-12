#!/usr/bin/env python

import Config
import time, json, sys, logging
from datetime import datetime
from flask import Flask, make_response, render_template, request
from pymongo import MongoClient

app = Flask(__name__)

mc = MongoClient()
ipopdb = mc[Config.conf['dbname']]
mongoData = ipopdb[Config.conf['colname']]

def getCurrentState(currentDoc,requestedInterval):
	responseMsg = {
					"currentState": currentDoc,
					"intervalNo":str(requestedInterval)
				  }
	return responseMsg

def findDiffBetweenIntervals(newDoc,oldDoc,requestedInterval):
	added = { key : newDoc[key] for key in set(newDoc) - set(oldDoc) }
	removed = { key : oldDoc[key] for key in set(oldDoc) - set(newDoc) }
	existing = list(set(newDoc) - set(added))
	modified ={}
	for key in existing:
		if frozenset(newDoc[key].items()) != frozenset(oldDoc[key].items()) :
			modified[key] = newDoc[key]

	responseMsg = {
					"removed": removed,
					"added": added,
					"modified": modified,
					"intervalNo": str(requestedInterval),
					"updateOffset": 10   				# To be modified
				  }

	return responseMsg

@app.route('/IPOP')
def homepage():
	resp =  render_template('ipop_mainpage.html')
	return resp

@app.route('/IPOP/getIntervals', methods=['GET'])
def getIntervals():		
	startTime = datetime.strptime(request.args.get('start') , "%Y-%m-%dT%H:%M:%S")
	endTime = datetime.strptime(request.args.get('end') , "%Y-%m-%dT%H:%M:%S")
	intervalNumbers = []
	for docs in mongoData.find({"_id": {"$gt": startTime , "$lt": endTime}}, {"_id":1}):
	 	intervalNumbers.append(str(docs["_id"]))
	responseMsg = {"IPOP" : {
							"IntervalNumbers" : intervalNumbers
					}}
	resp = make_response(json.dumps(responseMsg))
	resp.headers['Content-Type'] = "application/json"
	return resp


@app.route('/IPOP/getOverlays', methods=['GET'])
def getOverlays():
	currentState = request.args.get('currentState')	
	requestedInterval = datetime.strptime(request.args.get('interval') , "%Y-%m-%dT%H:%M:%S")
	
	if currentState == "True":
		currentDoc = mongoData.find_one({"_id": requestedInterval}, {"_id":1, "Overlays":1})#modify to find nearest to requested interval
		responseMsg = getCurrentState(currentDoc["Overlays"],str(currentDoc["_id"]))
	else:
		newDoc = mongoData.find_one({"_id": requestedInterval}, {"_id":1, "Overlays":1})#modify to find nearest to requested interval
		oldDoc = mongoData.find_one({"$query":{"_id": {"$lt": requestedInterval}},"$orderby":{"_id":-1}})
		if oldDoc == None :
			oldDoc = {"_id":"", "Overlays":{}}
		responseMsg = findDiffBetweenIntervals(newDoc["Overlays"],oldDoc["Overlays"],str(newDoc["_id"]))
	
	resp = make_response(json.dumps(responseMsg))
	resp.headers['Content-Type'] = "application/json"
	return resp


@app.route('/IPOP/overlays/<overlayid>/nodes', methods=['GET'])
def getNodes(overlayid):
	currentState = request.args.get('currentState')
	requestedInterval = datetime.strptime(request.args.get('interval') , "%Y-%m-%dT%H:%M:%S")
	
	if currentState == "True":
		currentDoc = mongoData.find_one({"_id": requestedInterval}, {"_id":1, "Nodes."+overlayid:1}) #modify to find nearest to requested interval
		if currentDoc["Nodes"] == {}:
			currentDoc["Nodes"][overlayid] = {}
		response = getCurrentState(currentDoc["Nodes"][overlayid],str(currentDoc["_id"]))
		responseMsg = {
						overlayid: {
									"currentState": response["currentState"]
								   },
						"intervalNo": response["intervalNo"]
					  } 
	else:
		newDoc = mongoData.find_one({"_id": requestedInterval}, {"_id":1, "Nodes."+overlayid:1}) #modify to find nearest to requested interval 
		oldDoc = mongoData.find_one({"$query":{"_id": {"$lt": requestedInterval}},"$orderby":{"_id":-1}},{"_id":1, "Nodes."+overlayid:1})
		if oldDoc == None:
			oldDoc = {"_id":"", "Nodes":{ overlayid:{} }} 
		if oldDoc["Nodes"] == {}:
			oldDoc["Nodes"][overlayid]={}
		if newDoc["Nodes"] == {}:
			newDoc["Nodes"][overlayid]={}
		response = findDiffBetweenIntervals(newDoc["Nodes"][overlayid],oldDoc["Nodes"][overlayid],str(newDoc["_id"]))
		responseMsg = {
						overlayid: {
									"removed": response["removed"],
									"added": response["added"],
									"modified": response["modified"]
									},
						"intervalNo": response["intervalNo"],
						"updateOffset": response["updateOffset"]
					  }
	
	resp = make_response(json.dumps(responseMsg))
	resp.headers['Content-Type'] = "application/json"
	return resp

@app.route('/IPOP/overlays/<overlayid>/nodes/<nodeid>', methods=['GET'])
def getNode(overlayid,nodeid):
	requestedInterval = datetime.strptime(request.args.get('interval') , "%Y-%m-%dT%H:%M:%S")
	newDoc = mongoData.find_one({"_id": requestedInterval}, {"_id":1, "Nodes."+overlayid+"."+nodeid:1}) #modify to find nearest to requested interval 
	try:
		nodeProp = newDoc["Nodes"][overlayid][nodeid]
	except:
		nodeProp = {}
	responseMsg = {
					overlayid : {
								  nodeid : nodeProp 
								},
					"intervalNo": str(newDoc["_id"])
				  }

	resp = make_response(json.dumps(responseMsg))
	resp.headers['Content-Type'] = "application/json"
	return resp

@app.route('/IPOP/overlays/<overlayid>/links', methods=['GET'])
def getLinksInAnOverlay(overlayid):
	currentState = request.args.get('currentState')
	requestedInterval = datetime.strptime(request.args.get('interval') , "%Y-%m-%dT%H:%M:%S")
	
	if currentState == "True":
		currentDoc = mongoData.find_one({"_id": requestedInterval}, {"_id":1, "Links."+overlayid:1}) #modify to find nearest to requested interval
		if currentDoc["Links"] == {}:
			currentDoc["Links"][overlayid] = {}
		response = getCurrentState(currentDoc["Links"][overlayid],str(currentDoc["_id"]))
		responseMsg = {
						overlayid: {
									"currentState": response["currentState"]
								   },
						"intervalNo":response["intervalNo"]
					  }
	else:
		newDoc = mongoData.find_one({"_id": requestedInterval}, {"_id":1, "Links."+overlayid:1}) #modify to find nearest to requested interval 
		oldDoc = mongoData.find_one({"$query":{"_id": {"$lt": requestedInterval}},"$orderby":{"_id":-1}},{"_id":1, "Links."+overlayid:1})

		if oldDoc == None:
			oldDoc = {"_id":"", "Links":{ overlayid:{} }} 	
		if oldDoc["Links"] == {}:
			oldDoc["Links"][overlayid] = {}
		if newDoc["Links"] == {}:
			newDoc["Links"][overlayid] = {}

		allNodes = (set(newDoc["Links"][overlayid]) | (set(oldDoc["Links"][overlayid])-set(newDoc["Links"][overlayid])))
		responseMsg = {
						overlayid: {
									"removed": {},			#Might be converted to List in future
									"added": {},
									"modified": {}
								   },
						"intervalNo": str(newDoc["_id"]),
						"updateOffset": 10							#To be modified
					  }
		for nodeid in allNodes:
			if nodeid not in oldDoc["Links"][overlayid]:
				oldDoc["Links"][overlayid][nodeid] = {}
			if nodeid not in newDoc["Links"][overlayid]:
				newDoc["Links"][overlayid][nodeid] = {}
			
			tempResponse = findDiffBetweenIntervals(newDoc["Links"][overlayid][nodeid],oldDoc["Links"][overlayid][nodeid],str(newDoc["_id"]))
			responseMsg[overlayid]["removed"].update(tempResponse["removed"])
			responseMsg[overlayid]["added"].update(tempResponse["added"])
			responseMsg[overlayid]["modified"].update(tempResponse["modified"])

	resp = make_response(json.dumps(responseMsg))
	resp.headers['Content-Type'] = "application/json"
	return resp

@app.route('/IPOP/overlays/<overlayid>/nodes/<nodeid>/links', methods=['GET'])
def getLinksForANode(overlayid,nodeid):
	currentState = request.args.get('currentState')
	requestedInterval = datetime.strptime(request.args.get('interval') , "%Y-%m-%dT%H:%M:%S")

	if currentState == "True":
		currentDoc = mongoData.find_one({"_id": requestedInterval}, {"_id":1, "Links."+overlayid+"."+nodeid:1}) #modify to find nearest to requested interval
		if currentDoc["Links"] == {}:
			 currentDoc["Links"][overlayid] = {nodeid:{}}
		elif currentDoc["Links"][overlayid] == {}:
			currentDoc["Links"][overlayid][nodeid] = {}
		response = getCurrentState(currentDoc["Links"][overlayid][nodeid],str(currentDoc["_id"]))
		responseMsg = {
						overlayid: {
									nodeid: {
											 "currentState": response["currentState"]
											}
								   },
						"intervalNo": response["intervalNo"]
					  }	
	else:
		newDoc = mongoData.find_one({"_id": requestedInterval}, {"_id":1, "Links."+overlayid+"."+nodeid:1}) #modify to find nearest to requested interval 
		oldDoc = mongoData.find_one({"$query":{"_id": {"$lt": requestedInterval}},"$orderby":{"_id":-1}},{"_id":1, "Links."+overlayid+"."+nodeid:1})
		if oldDoc == None:
			oldDoc = {"_id":"", "Links":{ overlayid:{ nodeid:{} }}} 
		
		if oldDoc["Links"] == {}:
			oldDoc["Links"][overlayid] = {nodeid:{}}
		elif oldDoc["Links"][overlayid] == {}:
			oldDoc["Links"][overlayid][nodeid] = {}
		
		if newDoc["Links"] == {}:
			newDoc["Links"][overlayid] = {nodeid:{}}
		elif newDoc["Links"][overlayid] == {}:
			newDoc["Links"][overlayid][nodeid] = {}
		response = findDiffBetweenIntervals(newDoc["Links"][overlayid][nodeid],oldDoc["Links"][overlayid][nodeid],str(newDoc["_id"]))
		responseMsg = {
						overlayid: {
									nodeid: {
											 "removed": response["removed"],
											 "added": response["added"],
											 "modified": response["modified"]
											}
									},
						"intervalNo": response["intervalNo"],
						"updateOffset": response["updateOffset"]
					  }
	
	resp = make_response(json.dumps(responseMsg))
	resp.headers['Content-Type'] = "application/json"
	return resp

def main(ipv4):
    app.run(host=ipv4,port=Config.visualizer_conf['port'],threaded=True)

if __name__ == "__main__":
    if len(sys.argv)>1:
        ipv4 = sys.argv[1]
    else:
        ipv4 = Config.visualizer_conf['ip']
    try:
        main(ipv4)
    except Exception as err:
        log.error("Exception::"+str(err.message))