import sys
import signal
import logging
from logging.handlers import RotatingFileHandler
import threading

from flask import Flask, abort

from CollectorService import CollectorServiceInstance
from CentralVisualizerService import CentralVisualizerService
from config import COLLECTOR_CONFIG, CONTAINER_CONFIG, VISUALIZER_CONFIG


class ContainerService(Flask):
    def __init__(self, *args, **kwargs):
        super(ContainerService, self).__init__(*args, **kwargs)

        self._logger = logging.getLogger("network_visualizer")

        fmtr = logging.Formatter(
            """%(asctime)s - %(name)s - %(threadName)s -"""
            """ %(levelname)s - %(message)s"""
        )
        ch = logging.StreamHandler()
        ch.setLevel(getattr(logging,
                CONTAINER_CONFIG["logging"]["console_level"]))
        ch.setFormatter(fmtr)

        fh = RotatingFileHandler(CONTAINER_CONFIG["logging"]["rot_fh_fname"],
            backupCount=CONTAINER_CONFIG["logging"]["rot_fh_count"])
        fh.setLevel(getattr(logging,
                CONTAINER_CONFIG["logging"]["rot_fh_level"]))
        fh.setFormatter(fmtr)

        self._logger.addHandler(ch)
        self._logger.addHandler(fh)
        self._logger.setLevel(logging.DEBUG)

        signal.signal(signal.SIGINT, self._intr_term_handler)
        signal.signal(signal.SIGTERM, self._intr_term_handler)

        # Instance of the collector service
        self._coll_serv = CollectorServiceInstance(COLLECTOR_CONFIG)
        self._vis_serv = CentralVisualizerService(VISUALIZER_CONFIG)

        # NOTE: Important for the dumper thread to be started from the container
        # (i.e. Flask subclass) else it won't work
        self._dumper_thread = threading.Thread(name="DumperThread",
               target=self._coll_serv.dump_vis_data)
        self._dumper_thread.daemon = True
        self._dumper_thread.start()

    def _intr_term_handler(self, sig, frame):
        self._coll_serv.intr_or_term = True
        self._logger.warn("Received SIGINT/SIGTERM! Waiting for"
                          " DumperThread to complete...")
        self._dumper_thread.join()
        sys.exit(sig)


container_service = ContainerService(__name__,
        template_folder=CONTAINER_CONFIG["template_folder"],
        static_folder=CONTAINER_CONFIG["static_folder"])

# Collector Service URLs
container_service.add_url_rule(
        "/IPOP/nodes/<node_id>",
        view_func=container_service._coll_serv.process_update_req,
        methods=["PUT"])

# Central Visualizer Service URLs
container_service.add_url_rule("/IPOP",
        view_func=container_service._vis_serv.homepage, methods=["GET"])
container_service.add_url_rule("/IPOP/overlays",
        view_func=container_service._vis_serv.get_overlays, methods=["GET"])
container_service.add_url_rule("/IPOP/overlays/<overlayid>/nodes",
        view_func=container_service._vis_serv.get_nodes_in_an_overlay,
        methods=["GET"])
container_service.add_url_rule("/IPOP/overlays/<overlayid>/nodes/<nodeid>",
        view_func=container_service._vis_serv.get_single_node, methods=["GET"])
container_service.add_url_rule("/IPOP/overlays/<overlayid>/links",
        view_func=container_service._vis_serv.get_links_in_an_overlay,
        methods=["GET"])
container_service.add_url_rule(
        "/IPOP/overlays/<overlayid>/nodes/<nodeid>/links",
        view_func=container_service._vis_serv.get_links_for_a_node,
        methods=["GET"])


if __name__ == "__main__":
    container_service.run(debug=CONTAINER_CONFIG["debug"], use_reloader=False,
            host=CONTAINER_CONFIG["ip"], port=CONTAINER_CONFIG["port"])
