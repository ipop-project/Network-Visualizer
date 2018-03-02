#!/usr/bin/env python

import time, json, sys, logging
from datetime import datetime
from flask import Flask, make_response, render_template, request
from pymongo import MongoClient

class CentralVisualizerService(object):
    def __init__(self,config_dict):
        _mc = MongoClient()
        _ipopdb = _mc[config_dict["mongo"]["dbname"]]
        self._mongo_data = _ipopdb[config_dict["mongo"]["collection_name"]]
        self._logger = logging.getLogger("network_visualizer.central_visualizer")


    def _get_current_state(self,current_doc,requested_interval):
        response_msg = {
                        "current_state": current_doc,
                        "intervalNo":str(requested_interval)
                        }
        return response_msg

    def _find_diff_between_intervals(self,new_doc,old_doc,requested_interval):
        added = { key : new_doc[key] for key in set(new_doc) - set(old_doc) }
        removed = { key : old_doc[key] for key in set(old_doc) - set(new_doc) }
        existing = list(set(new_doc) - set(added))
        modified ={}
        for key in existing:
            if frozenset(new_doc[key].items()) != frozenset(old_doc[key].items()) :
                modified[key] = new_doc[key]

        response_msg = {
                        "removed": removed,
                        "added": added,
                        "modified": modified,
                        "intervalNo": str(requested_interval),
                        "updateOffset": 15          # To be modified
                        }
        return response_msg

    #route('/IPOP')
    def homepage(self):
        resp =  render_template('ipop_mainpage.html')
        return resp

    #route('/IPOP/intervals', methods=['GET'])
    def get_intervals(self):     
        start_time = datetime.strptime(request.args.get('start') , "%Y-%m-%dT%H:%M:%S")
        end_time = datetime.strptime(request.args.get('end') , "%Y-%m-%dT%H:%M:%S")
        interval_numbers = []
        for docs in self._mongo_data.find({"_id": {"$gt": start_time , "$lt": end_time}}, {"_id":1}):
            interval_numbers.append(str(docs["_id"]))
        response_msg = {"IPOP" : {
                                "IntervalNumbers" : interval_numbers
                        }}
        resp = make_response(json.dumps(response_msg))
        resp.headers['Content-Type'] = "application/json"
        return resp

    #route('/IPOP/overlays', methods=['GET'])
    def get_overlays(self):
        current_state = request.args.get('current_state') 
        requested_interval = datetime.strptime(request.args.get('interval') , "%Y-%m-%dT%H:%M:%S")

        if current_state == "True":
            self._logger.debug('Request received for all Overlays at {}'.format(requested_interval))
            current_doc = self._mongo_data.find_one({"$query":{"_id": {"$lte": requested_interval}},"$orderby":{"_id":-1}},{"_id":1, "Overlays":1})
            if current_doc == None : current_doc = {"_id":"", "Overlays":{}}
            response_msg = self._get_current_state(current_doc["Overlays"],str(current_doc["_id"]))
        else:
            self._logger.debug('Request received for updates in Overlays at {}'.format(requested_interval))
            new_doc = self._mongo_data.find_one({"$query":{"_id": {"$lte": requested_interval}},"$orderby":{"_id":-1}},{"_id":1, "Overlays":1})
            if new_doc == None : new_doc = {"_id":"", "Overlays":{}}
            old_doc = self._mongo_data.find_one({"$query":{"_id": {"$lt": new_doc["_id"]}},"$orderby":{"_id":-1}},{"_id":1, "Overlays":1})
            if old_doc == None : old_doc = {"_id":"", "Overlays":{}}
            response_msg = self._find_diff_between_intervals(new_doc["Overlays"],old_doc["Overlays"],str(new_doc["_id"]))

        self._logger.debug('The server response for Overlays request: {}'.format(response_msg))
        resp = make_response(json.dumps(response_msg))
        resp.headers['Content-Type'] = "application/json"
        return resp

    #route('/IPOP/overlays/<overlayid>/nodes', methods=['GET'])
    def get_nodes_in_an_overlay(self,overlayid):
        current_state = request.args.get('current_state')
        requested_interval = datetime.strptime(request.args.get('interval') , "%Y-%m-%dT%H:%M:%S")

        if current_state == "True":
            self._logger.debug('Request received for all nodes in overlay {} at {}'.format(overlayid,requested_interval))
            current_doc = self._mongo_data.find_one({"$query":{"_id": {"$lte": requested_interval}},"$orderby":{"_id":-1}},{"_id":1, "Nodes."+overlayid:1})
            if current_doc == None: current_doc = {"_id":"", "Nodes":{ overlayid:{} }} 
            elif current_doc["Nodes"] == {}: current_doc["Nodes"][overlayid] = {}
            response = self._get_current_state(current_doc["Nodes"][overlayid],str(current_doc["_id"]))
            response_msg = {
                            overlayid: {
                                        "current_state": response["current_state"]
                                       },
                            "intervalNo": response["intervalNo"]
                          } 
        else:
            self._logger.debug('Request received for updates in nodes in overlay {} at {}'.format(overlayid,requested_interval))
            new_doc = self._mongo_data.find_one({"$query":{"_id": {"$lte": requested_interval}},"$orderby":{"_id":-1}},{"_id":1, "Nodes."+overlayid:1})
            if new_doc == None: new_doc = {"_id":"", "Nodes":{ overlayid:{} }} 
            elif new_doc["Nodes"] == {}: new_doc["Nodes"][overlayid]={}

            old_doc = self._mongo_data.find_one({"$query":{"_id": {"$lt": new_doc["_id"]}},"$orderby":{"_id":-1}},{"_id":1, "Nodes."+overlayid:1})
            if old_doc == None: old_doc = {"_id":"", "Nodes":{ overlayid:{} }} 
            elif old_doc["Nodes"] == {}: old_doc["Nodes"][overlayid]={}

            response = self._find_diff_between_intervals(new_doc["Nodes"][overlayid],old_doc["Nodes"][overlayid],str(new_doc["_id"]))
            response_msg = {
                            overlayid: {
                                        "removed": response["removed"],
                                        "added": response["added"],
                                        "modified": response["modified"]
                                        },
                            "intervalNo": response["intervalNo"],
                            "updateOffset": response["updateOffset"]
                          }

        self._logger.debug('The server response for nodes in overlay {} request: {}'.format(overlayid,response_msg))
        resp = make_response(json.dumps(response_msg))
        resp.headers['Content-Type'] = "application/json"
        return resp

    #route('/IPOP/overlays/<overlayid>/nodes/<nodeid>', methods=['GET'])
    def get_single_node(self,overlayid,nodeid):
        requested_interval = datetime.strptime(request.args.get('interval') , "%Y-%m-%dT%H:%M:%S")
        self._logger.debug('Request received for the node {} in overlay {} at {}'.format(nodeid,overlayid,requested_interval))
        new_doc = self._mongo_data.find_one({"$query":{"_id": {"$lte": requested_interval}},"$orderby":{"_id":-1}},{"_id":1, "Nodes."+overlayid+"."+nodeid:1})
        try:
            nodeProp = new_doc["Nodes"][overlayid][nodeid]
        except:
            nodeProp = {}
        response_msg = {
                        overlayid : {
                                      nodeid : nodeProp 
                                    },
                        "intervalNo": str(new_doc["_id"])
                      }

        self._logger.debug('The server response for the node {} in overlay {} request: {}'.format(nodeid,overlayid,response_msg))
        resp = make_response(json.dumps(response_msg))
        resp.headers['Content-Type'] = "application/json"
        return resp

    #route('/IPOP/overlays/<overlayid>/links', methods=['GET'])
    def get_links_in_an_overlay(self,overlayid):
        current_state = request.args.get('current_state')
        requested_interval = datetime.strptime(request.args.get('interval') , "%Y-%m-%dT%H:%M:%S")
        
        if current_state == "True":
            self._logger.debug('Request received for all links in overlay {} at {}'.format(overlayid,requested_interval))
            current_doc = self._mongo_data.find_one({"$query":{"_id": {"$lte": requested_interval}},"$orderby":{"_id":-1}},{"_id":1, "Links."+overlayid:1})
            if current_doc == None: current_doc = {"_id":"", "Links":{ overlayid:{} }}    
            elif current_doc["Links"] == {}: current_doc["Links"][overlayid] = {}
            response = self._get_current_state(current_doc["Links"][overlayid],str(current_doc["_id"]))
            response_msg = {
                            overlayid: {
                                        "current_state": response["current_state"]
                                       },
                            "intervalNo":response["intervalNo"]
                          }
        else:
            self._logger.debug('Request received for updates in links in overlay {} at {}'.format(overlayid,requested_interval))
            new_doc = self._mongo_data.find_one({"$query":{"_id": {"$lte": requested_interval}},"$orderby":{"_id":-1}},{"_id":1, "Links."+overlayid:1})
            if new_doc == None: new_doc = {"_id":"", "Links":{ overlayid:{} }}    
            elif new_doc["Links"] == {}: new_doc["Links"][overlayid] = {}
            
            old_doc = self._mongo_data.find_one({"$query":{"_id": {"$lt": new_doc["_id"]}},"$orderby":{"_id":-1}},{"_id":1, "Links."+overlayid:1})
            if old_doc == None: old_doc = {"_id":"", "Links":{ overlayid:{} }}    
            elif old_doc["Links"] == {}: old_doc["Links"][overlayid] = {}

            allNodes = (set(new_doc["Links"][overlayid]) | (set(old_doc["Links"][overlayid])-set(new_doc["Links"][overlayid])))
            response_msg = {
                            overlayid: {
                                        "removed": {},          #Might be converted to List in future
                                        "added": {},
                                        "modified": {}
                                       },
                            "intervalNo": str(new_doc["_id"]),
                            "updateOffset": 10                          #To be modified
                          }
            for nodeid in allNodes:
                if nodeid not in old_doc["Links"][overlayid]:
                    old_doc["Links"][overlayid][nodeid] = {}
                if nodeid not in new_doc["Links"][overlayid]:
                    new_doc["Links"][overlayid][nodeid] = {}
                
                tempResponse = self._find_diff_between_intervals(new_doc["Links"][overlayid][nodeid],old_doc["Links"][overlayid][nodeid],str(new_doc["_id"]))
                response_msg[overlayid]["removed"][nodeid] = tempResponse["removed"]
                response_msg[overlayid]["added"][nodeid] = tempResponse["added"]
                response_msg[overlayid]["modified"][nodeid] = tempResponse["modified"]

        self._logger.debug('The server response for links in overlay {} request: {}'.format(overlayid,response_msg))
        resp = make_response(json.dumps(response_msg))
        resp.headers['Content-Type'] = "application/json"
        return resp

    #route('/IPOP/overlays/<overlayid>/nodes/<nodeid>/links', methods=['GET'])
    def get_links_for_a_node(self,overlayid,nodeid):
        current_state = request.args.get('current_state')
        requested_interval = datetime.strptime(request.args.get('interval') , "%Y-%m-%dT%H:%M:%S")

        if current_state == "True":
            self._logger.debug('Request received for all links from node {} in overlay {} at'' {}'.format(nodeid,overlayid,requested_interval))
            current_doc = self._mongo_data.find_one({"$query":{"_id": {"$lte": requested_interval}},"$orderby":{"_id":-1}},{"_id":1, "Links."+overlayid+"."+nodeid:1})
            if current_doc == None: current_doc = {"_id":"", "Links":{ overlayid:{ nodeid:{} }}} 
            elif current_doc["Links"] == {}: current_doc["Links"][overlayid] = {nodeid:{}}
            elif current_doc["Links"][overlayid] == {}: current_doc["Links"][overlayid][nodeid] = {}
            response = self._get_current_state(current_doc["Links"][overlayid][nodeid],str(current_doc["_id"]))
            response_msg = {
                            overlayid: {
                                        nodeid: {
                                                 "current_state": response["current_state"]
                                                }
                                       },
                            "intervalNo": response["intervalNo"]
                          } 
        else:
            self._logger.debug('Request received for updates in links from node {} in overlay {} at '' {}'.format(nodeid,overlayid,requested_interval))
            new_doc = self._mongo_data.find_one({"$query":{"_id": {"$lte": requested_interval}},"$orderby":{"_id":-1}},{"_id":1, "Links."+overlayid+"."+nodeid:1})
            if new_doc == None: old_doc = {"_id":"", "Links":{ overlayid:{ nodeid:{} }}}
            elif new_doc["Links"] == {}: new_doc["Links"][overlayid] = {nodeid:{}}
            elif new_doc["Links"][overlayid] == {}: new_doc["Links"][overlayid][nodeid] = {}

            old_doc = self._mongo_data.find_one({"$query":{"_id": {"$lt": new_doc["_id"]}},"$orderby":{"_id":-1}},{"_id":1, "Links."+overlayid+"."+nodeid:1})
            if old_doc == None: old_doc = {"_id":"", "Links":{ overlayid:{ nodeid:{} }}} 
            elif old_doc["Links"] == {}: old_doc["Links"][overlayid] = {nodeid:{}}
            elif old_doc["Links"][overlayid] == {}: old_doc["Links"][overlayid][nodeid] = {}

            response = self._find_diff_between_intervals(new_doc["Links"][overlayid][nodeid],old_doc["Links"][overlayid][nodeid],str(new_doc["_id"]))
            response_msg = {
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

        self._logger.debug('The server response for links from node {} in overlay {} request: {}'.format(nodeid,overlayid,response_msg))
        resp = make_response(json.dumps(response_msg))
        resp.headers['Content-Type'] = "application/json"
        return resp
