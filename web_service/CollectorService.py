import sys
import time
import logging
import datetime
import threading
from collections import defaultdict
from logging.handlers import RotatingFileHandler

from pymongo import MongoClient
from flask import abort, request


class CollectorServiceInstance(object):
    def __init__(self, config_dict):
        self._config_dict = config_dict

        collector_mongo = \
                MongoClient('mongodb://{}:{}'.format(
                        self._config_dict['mongo']['host'],
                        self._config_dict['mongo']['port'])
                )
        self._db = collector_mongo[self._config_dict['mongo']['dbname']]
        self._data_held_lock = threading.Lock()

        self.intr_or_term = False

        with self._data_held_lock:
            self._reset_data_held()

        self.flush_duration = self._config_dict['flush_duration']

        self._logger = \
                logging.getLogger('network_visualizer.collector_service')

    def _reset_data_held(self):
        self.data_held = {
            'Overlays': dict(),
            'Nodes': defaultdict(dict),
            'Links': defaultdict(lambda:
                     defaultdict(lambda: defaultdict(dict)))
        }

    def process_update_req(self, node_id):
        """
        Serves the PUT request from the OverlayVisualizer controller module
        """

        self._logger.debug('Received request {} for node_id' \
               ' {}'.format(request.json, node_id))

        if self.intr_or_term:
            self._logger.warn('Rejecting request with a 500 because of' \
                              ' SIGINT/SIGTERM!')
            return abort(500)


        # NOTE request is intantiated when this method is registered
        # as a view_func in a flask container
        req = request.json
        req_data = req['Data']

        self._data_held_lock.acquire()
        for ovrl_id in req_data:
            self._logger.debug('Processing data for overlay_id' \
                               ' {}'.format(ovrl_id))

            # Initialise data for an overlay
            if ovrl_id not in self.data_held['Overlays']:
                ovrl_init_data = {
                    'NumNodes': 0,
                    'NumLinks': 0,
                    'Name': '',
                }
                self.data_held['Overlays'][ovrl_id] = ovrl_init_data

            # Increment node counter in overlay if we did not have its data
            # for ovrl_id (meaning it is new in this overlay)
            # NOTE! This must be done before self.data_held['Nodes'] is
            # updated with node_data as it will add the key ovrl_id causing
            # this test to not behave as desired
            if node_id not in self.data_held['Nodes'][ovrl_id]:
                self.data_held['Overlays'][ovrl_id]['NumNodes'] += 1

            # TODO handle removal of a node within an interval

            # Add/update node data for the reporting node
            req_node_data = req_data[ovrl_id]['Topology']
            node_data = {
                'InterfaceName': req_node_data['InterfaceName'],
                'GeoIP': req_node_data['GeoIP'],
                'VIP4': req_node_data['VIP4'],
                'PrefixLen': req_node_data['PrefixLen'],
                'MAC': req_node_data['MAC']
            }
            self._logger.debug(
                'Updating node data for node_id {}'.format(node_id))
            self.data_held['Nodes'][ovrl_id][node_id] = node_data

            # Add/update data link data for the reporting node
            for link_id in req_data[ovrl_id]['LinkManager']:
                req_link_data = req_data[ovrl_id]['LinkManager'][link_id]
                link_stats = req_link_data['Stats']
                link_data = {
                    'SrcNodeId': node_id,
                    'TgtNodeId': req_link_data['PeerId'],
                    'rem_addr': link_stats['rem_addr'],
                    'sent_bytes_second': link_stats['sent_bytes_second'],
                }
                self.data_held['Links'][ovrl_id][node_id][link_id] = link_data
        self._data_held_lock.release()

        return 'Success'

    def dump_vis_data(self):
        """Runs in a separate thread (see constructor)"""

        while not self.intr_or_term:
            self._logger.debug(
                    'Sleeing for {} seconds'.format(
                            self._config_dict['flush_duration']))
            time.sleep(self._config_dict['flush_duration'])

            self._data_held_lock.acquire()
            self.data_held['_id'] = \
                    datetime.datetime.utcnow().replace(microsecond=0)
            self._logger.debug(
                'Beginning mongo dump on document {}'.format(self.data_held))
            self._db[self._config_dict['mongo']['collection_name']] \
                    .insert_one(self.data_held)
            self._logger.debug('Mongo dump successful')

            self._reset_data_held()

            self._logger.debug('Document after flushing is {}'.format(
                    self.data_held))

            self._data_held_lock.release()
