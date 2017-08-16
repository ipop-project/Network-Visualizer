#!/usr/bin/env python

import logging

conf = {
    'dbname': 'ipopdb',
    'colname': 'nd',
}

collector_conf = {
    'ip': '0.0.0.0',
    'port': 8080,
    'batchdelay': 15,
    'location_update_delay': 10*60,
    'clear_on_start': True,
    'log_level': logging.INFO,
    'log_filename':'./Collector.log',
}

