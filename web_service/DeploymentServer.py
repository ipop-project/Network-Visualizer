from gevent.wsgi import WSGIServer

from config import CONTAINER_CONFIG
from ContainerService import container_service

visualizer_service_server = WSGIServer(('', CONTAINER_CONFIG["port"]), container_service)
visualizer_service_server.serve_forever()
