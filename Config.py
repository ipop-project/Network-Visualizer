#!/usr/bin/env python

import logging

conf = {
    'dbname': 'ipopdb',
    'colname': 'nd',
}

visualizer_conf = {
    'ip': '0.0.0.0',
    'port': 8888,
    'timeout': 45,
    'log_level': logging.INFO,
    'log_filename':'./CentralVisualizer.log',
}
