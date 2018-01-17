CONTAINER_CONFIG = {
    "ip": "0.0.0.0",
    "port": 5000,
    "debug": True, # WARNING! NEVER set debug = True in production!
    "logging": {
        "console_level": "DEBUG",
        "rot_fh_level": "WARN",
        "rot_fh_count": 5,
        "rot_fh_fname": "network_visualizer.log"
    }
}

COLLECTOR_CONFIG = {
    "flush_duration": 15, # in seconds
    "mongo": {
        "host": "localhost",
        "port": 27017,
        "dbname": "ipopdb",
        "collection_name": "visualizer"
    }
}

