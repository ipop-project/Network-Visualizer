CONTAINER_CONFIG = {
    "ip": "0.0.0.0",
    "port": 5000,
    "debug": False,  # WARNING! NEVER set debug = True in production!
    "template_folder": "UI/templates",
    "static_folder": "UI/static",
    "logging": {
        "console_level": "DEBUG",
        "rot_fh_level": "WARN",
        "rot_fh_count": 5,
        "rot_fh_max_file_size": 2097152,  # in bytes
        "rot_fh_fname": "network_visualizer.log"
    }
}

COLLECTOR_CONFIG = {
    "flush_duration": 30,  # in seconds
    "mongo": {
        "host": "localhost",
        "port": 27017,
        "dbname": "ipopdb",
        "collection_name": "visualizer"
    }
}

VISUALIZER_CONFIG = {
    "mongo": {
        "host": "localhost",
        "port": 27017,
        "dbname": "ipopdb",
        "collection_name": "visualizer"
    }
}
