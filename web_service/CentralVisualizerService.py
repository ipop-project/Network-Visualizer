#!/usr/bin/env python

import time, json, sys, logging
from datetime import datetime
from flask import Flask, make_response, render_template, request
from pymongo import MongoClient

class CentralVisualizerService(object):
    def __init__(self,config_dict):
        mc = MongoClient()
        ipopdb = mc[config_dict["mongo"]["dbname"]]
        self._mongo_data = ipopdb[config_dict["mongo"]["collection_name"]]
        self._logger = logging.getLogger("network_visualizer.central_visualizer")
    

    def _getCurrentState(self,currentDoc,requestedInterval):
        responseMsg = {
                        "currentState": currentDoc,
                        "intervalNo":str(requestedInterval)
                        }
        return responseMsg

    def _findDiffBetweenIntervals(self,newDoc,oldDoc,requestedInterval):
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
                        "updateOffset": 15          # To be modified
                        }
        return responseMsg

    #route('/IPOP')
    def homepage(self):
        resp =  render_template('ipop_mainpage.html')
        return resp

    #route('/IPOP/getIntervals', methods=['GET'])
    def getIntervals(self):     
        startTime = datetime.strptime(request.args.get('start') , "%Y-%m-%dT%H:%M:%S")
        endTime = datetime.strptime(request.args.get('end') , "%Y-%m-%dT%H:%M:%S")
        intervalNumbers = []
        for docs in self._mongo_data.find({"_id": {"$gt": startTime , "$lt": endTime}}, {"_id":1}):
            intervalNumbers.append(str(docs["_id"]))
        responseMsg = {"IPOP" : {
                                "IntervalNumbers" : intervalNumbers
                        }}
        resp = make_response(json.dumps(responseMsg))
        resp.headers['Content-Type'] = "application/json"
        return resp

    #route('/IPOP/overlays', methods=['GET'])
    def getOverlays(self):
        currentState = request.args.get('currentState') 
        requestedInterval = datetime.strptime(request.args.get('interval') , "%Y-%m-%dT%H:%M:%S")

        if currentState == "True":
            self._logger.debug('Request received for all Overlays at {}'.format(requestedInterval))
            currentDoc = self._mongo_data.find_one({"$query":{"_id": {"$lte": requestedInterval}},"$orderby":{"_id":-1}},{"_id":1, "Overlays":1})
            if currentDoc == None : currentDoc = {"_id":"", "Overlays":{}}
            responseMsg = self._getCurrentState(currentDoc["Overlays"],str(currentDoc["_id"]))
        else:
            self._logger.debug('Request received for updates in Overlays at {}'.format(requestedInterval))
            newDoc = self._mongo_data.find_one({"$query":{"_id": {"$lte": requestedInterval}},"$orderby":{"_id":-1}},{"_id":1, "Overlays":1})
            if newDoc == None : newDoc = {"_id":"", "Overlays":{}}
            oldDoc = self._mongo_data.find_one({"$query":{"_id": {"$lt": newDoc["_id"]}},"$orderby":{"_id":-1}},{"_id":1, "Overlays":1})
            if oldDoc == None : oldDoc = {"_id":"", "Overlays":{}}
            responseMsg = self._findDiffBetweenIntervals(newDoc["Overlays"],oldDoc["Overlays"],str(newDoc["_id"]))

        self._logger.debug('The server response for Overlays request: {}'.format(responseMsg))
        resp = make_response(json.dumps(responseMsg))
        resp.headers['Content-Type'] = "application/json"
        return resp

    #route('/IPOP/overlays/<overlayid>/nodes', methods=['GET'])
    def getNodesInAnOverlay(self,overlayid):
        currentState = request.args.get('currentState')
        requestedInterval = datetime.strptime(request.args.get('interval') , "%Y-%m-%dT%H:%M:%S")
        
        if currentState == "True":
            self._logger.debug('Request received for all nodes in overlay {} at {}'.format(overlayid,requestedInterval))
            currentDoc = self._mongo_data.find_one({"$query":{"_id": {"$lte": requestedInterval}},"$orderby":{"_id":-1}},{"_id":1, "Nodes."+overlayid:1})
            if currentDoc == None: currentDoc = {"_id":"", "Nodes":{ overlayid:{} }} 
            elif currentDoc["Nodes"] == {}: currentDoc["Nodes"][overlayid] = {}
            response = self._getCurrentState(currentDoc["Nodes"][overlayid],str(currentDoc["_id"]))
            responseMsg = {
                            overlayid: {
                                        "currentState": response["currentState"]
                                       },
                            "intervalNo": response["intervalNo"]
                          } 
        else:
            self._logger.debug('Request received for updates in nodes in overlay {} at {}'.format(overlayid,requestedInterval))
            newDoc = self._mongo_data.find_one({"$query":{"_id": {"$lte": requestedInterval}},"$orderby":{"_id":-1}},{"_id":1, "Nodes."+overlayid:1})
            if newDoc == None: newDoc = {"_id":"", "Nodes":{ overlayid:{} }} 
            elif newDoc["Nodes"] == {}: newDoc["Nodes"][overlayid]={}
            
            oldDoc = self._mongo_data.find_one({"$query":{"_id": {"$lt": newDoc["_id"]}},"$orderby":{"_id":-1}},{"_id":1, "Nodes."+overlayid:1})
            if oldDoc == None: oldDoc = {"_id":"", "Nodes":{ overlayid:{} }} 
            elif oldDoc["Nodes"] == {}: oldDoc["Nodes"][overlayid]={}

            response = self._findDiffBetweenIntervals(newDoc["Nodes"][overlayid],oldDoc["Nodes"][overlayid],str(newDoc["_id"]))
            responseMsg = {
                            overlayid: {
                                        "removed": response["removed"],
                                        "added": response["added"],
                                        "modified": response["modified"]
                                        },
                            "intervalNo": response["intervalNo"],
                            "updateOffset": response["updateOffset"]
                          }
        
        self._logger.debug('The server response for nodes in overlay {} request: {}'.format(overlayid,responseMsg))
        resp = make_response(json.dumps(responseMsg))
        resp.headers['Content-Type'] = "application/json"
        return resp

    #route('/IPOP/overlays/<overlayid>/nodes/<nodeid>', methods=['GET'])
    def getSingleNode(self,overlayid,nodeid):
        requestedInterval = datetime.strptime(request.args.get('interval') , "%Y-%m-%dT%H:%M:%S")
        self._logger.debug('Request received for the node {} in overlay {} at {}'.format(nodeid,overlayid,requestedInterval))
        newDoc = self._mongo_data.find_one({"$query":{"_id": {"$lte": requestedInterval}},"$orderby":{"_id":-1}},{"_id":1, "Nodes."+overlayid+"."+nodeid:1})
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

        self._logger.debug('The server response for the node {} in overlay {} request: {}'.format(nodeid,overlayid,responseMsg))
        resp = make_response(json.dumps(responseMsg))
        resp.headers['Content-Type'] = "application/json"
        return resp

    #route('/IPOP/overlays/<overlayid>/links', methods=['GET'])
    def getLinksInAnOverlay(self,overlayid):
        currentState = request.args.get('currentState')
        requestedInterval = datetime.strptime(request.args.get('interval') , "%Y-%m-%dT%H:%M:%S")
        
        if currentState == "True":
            self._logger.debug('Request received for all links in overlay {} at {}'.format(overlayid,requestedInterval))
            currentDoc = self._mongo_data.find_one({"$query":{"_id": {"$lte": requestedInterval}},"$orderby":{"_id":-1}},{"_id":1, "Links."+overlayid:1})
            if currentDoc == None: currentDoc = {"_id":"", "Links":{ overlayid:{} }}    
            elif currentDoc["Links"] == {}: currentDoc["Links"][overlayid] = {}
            response = self._getCurrentState(currentDoc["Links"][overlayid],str(currentDoc["_id"]))
            responseMsg = {
                            overlayid: {
                                        "currentState": response["currentState"]
                                       },
                            "intervalNo":response["intervalNo"]
                          }
        else:
            self._logger.debug('Request received for updates in links in overlay {} at {}'.format(overlayid,requestedInterval))
            newDoc = self._mongo_data.find_one({"$query":{"_id": {"$lte": requestedInterval}},"$orderby":{"_id":-1}},{"_id":1, "Links."+overlayid:1})
            if newDoc == None: newDoc = {"_id":"", "Links":{ overlayid:{} }}    
            elif newDoc["Links"] == {}: newDoc["Links"][overlayid] = {}
            
            oldDoc = self._mongo_data.find_one({"$query":{"_id": {"$lt": newDoc["_id"]}},"$orderby":{"_id":-1}},{"_id":1, "Links."+overlayid:1})
            if oldDoc == None: oldDoc = {"_id":"", "Links":{ overlayid:{} }}    
            elif oldDoc["Links"] == {}: oldDoc["Links"][overlayid] = {}

            allNodes = (set(newDoc["Links"][overlayid]) | (set(oldDoc["Links"][overlayid])-set(newDoc["Links"][overlayid])))
            responseMsg = {
                            overlayid: {
                                        "removed": {},          #Might be converted to List in future
                                        "added": {},
                                        "modified": {}
                                       },
                            "intervalNo": str(newDoc["_id"]),
                            "updateOffset": 10                          #To be modified
                          }
            for nodeid in allNodes:
                if nodeid not in oldDoc["Links"][overlayid]:
                    oldDoc["Links"][overlayid][nodeid] = {}
                if nodeid not in newDoc["Links"][overlayid]:
                    newDoc["Links"][overlayid][nodeid] = {}
                
                tempResponse = self._findDiffBetweenIntervals(newDoc["Links"][overlayid][nodeid],oldDoc["Links"][overlayid][nodeid],str(newDoc["_id"]))
                responseMsg[overlayid]["removed"].update(tempResponse["removed"])
                responseMsg[overlayid]["added"].update(tempResponse["added"])
                responseMsg[overlayid]["modified"].update(tempResponse["modified"])

        self._logger.debug('The server response for links in overlay {} request: {}'.format(overlayid,responseMsg))
        resp = make_response(json.dumps(responseMsg))
        resp.headers['Content-Type'] = "application/json"
        return resp

    #route('/IPOP/overlays/<overlayid>/nodes/<nodeid>/links', methods=['GET'])
    def getLinksForANode(self,overlayid,nodeid):
        currentState = request.args.get('currentState')
        requestedInterval = datetime.strptime(request.args.get('interval') , "%Y-%m-%dT%H:%M:%S")

        if currentState == "True":
            self._logger.debug('Request received for all links from node {} in overlay {} at'' {}'.format(nodeid,overlayid,requestedInterval))
            currentDoc = self._mongo_data.find_one({"$query":{"_id": {"$lte": requestedInterval}},"$orderby":{"_id":-1}},{"_id":1, "Links."+overlayid+"."+nodeid:1})
            if currentDoc == None: currentDoc = {"_id":"", "Links":{ overlayid:{ nodeid:{} }}} 
            elif currentDoc["Links"] == {}: currentDoc["Links"][overlayid] = {nodeid:{}}
            elif currentDoc["Links"][overlayid] == {}: currentDoc["Links"][overlayid][nodeid] = {}
            response = self._getCurrentState(currentDoc["Links"][overlayid][nodeid],str(currentDoc["_id"]))
            responseMsg = {
                            overlayid: {
                                        nodeid: {
                                                 "currentState": response["currentState"]
                                                }
                                       },
                            "intervalNo": response["intervalNo"]
                          } 
        else:
            self._logger.debug('Request received for updates in links from node {} in overlay {} at '' {}'.format(nodeid,overlayid,requestedInterval))
            newDoc = self._mongo_data.find_one({"$query":{"_id": {"$lte": requestedInterval}},"$orderby":{"_id":-1}},{"_id":1, "Links."+overlayid+"."+nodeid:1})
            if newDoc == None: oldDoc = {"_id":"", "Links":{ overlayid:{ nodeid:{} }}}
            elif newDoc["Links"] == {}: newDoc["Links"][overlayid] = {nodeid:{}}
            elif newDoc["Links"][overlayid] == {}: newDoc["Links"][overlayid][nodeid] = {}
            
            oldDoc = self._mongo_data.find_one({"$query":{"_id": {"$lt": newDoc["_id"]}},"$orderby":{"_id":-1}},{"_id":1, "Links."+overlayid+"."+nodeid:1})
            if oldDoc == None: oldDoc = {"_id":"", "Links":{ overlayid:{ nodeid:{} }}} 
            elif oldDoc["Links"] == {}: oldDoc["Links"][overlayid] = {nodeid:{}}
            elif oldDoc["Links"][overlayid] == {}: oldDoc["Links"][overlayid][nodeid] = {}
            
            response = self._findDiffBetweenIntervals(newDoc["Links"][overlayid][nodeid],oldDoc["Links"][overlayid][nodeid],str(newDoc["_id"]))
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
        
        self._logger.debug('The server response for links from node {} in overlay {} request: {}'.format(nodeid,overlayid,responseMsg))
        resp = make_response(json.dumps(responseMsg))
        resp.headers['Content-Type'] = "application/json"
<<<<<<< HEAD
        return resp
=======
        return resp
>>>>>>> ashish/master
