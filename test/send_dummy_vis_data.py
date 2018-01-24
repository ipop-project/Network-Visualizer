import time
import logging
import simplejson as json

import requests

logging.basicConfig(level=logging.INFO)

odd_tick_reqs = [
{
    'Data': {
        'O1': {
            'LinkManager': {
                'LN1N2': {
                    'Stats': {
                        'sent_bytes_second': '50000',
                        'rem_addr': '10.24.95.100:53468'
                    },
                    'PeerId': 'N2'
                },
                'LN1N3': {
                    'Stats': {
                        'sent_bytes_second': '50000',
                        'rem_addr': '10.24.95.100:53468'
                    },
                    'PeerId': 'N3'
                },
                'LN1N4': {
                    'Stats': {
                        'sent_bytes_second': '50000',
                        'rem_addr': '10.24.95.100:53468'
                    },
                    'PeerId': 'N4'
                },
            },
            'Topology': {
                'PrefixLen': 16,
                'GeoIP': '1.2.3.4',
                'MAC': 'FF:FF:FF:FF:FF',
                'VIP4': '2.3.4.5',
                'InterfaceName': 'ipop_tap0'
            }
        }
    },
    'NodeId': 'N1'
},
{
    'Data': {
        'O1': {
            'LinkManager': {
                'LN2N1': {
                    'Stats': {
                        'sent_bytes_second': '50000',
                        'rem_addr': '10.24.95.100:53468'
                    },
                    'PeerId': 'N1'
                },
                'LN2N3': {
                    'Stats': {
                        'sent_bytes_second': '50000',
                        'rem_addr': '10.24.95.100:53468'
                    },
                    'PeerId': 'N3'
                },
                'LN2N4': {
                    'Stats': {
                        'sent_bytes_second': '50000',
                        'rem_addr': '10.24.95.100:53468'
                    },
                    'PeerId': 'N4'
                },
            },
            'Topology': {
                'PrefixLen': 16,
                'GeoIP': '1.2.3.4',
                'MAC': 'FF:FF:FF:FF:FF',
                'VIP4': '2.3.4.5',
                'InterfaceName': 'ipop_tap0'
            }
        }
    },
    'NodeId': 'N2'
},
{
    'Data': {
        'O1': {
            'LinkManager': {
                'LN3N1': {
                    'Stats': {
                        'sent_bytes_second': '50000',
                        'rem_addr': '10.24.95.100:53468'
                    },
                    'PeerId': 'N1'
                },
                'LN3N2': {
                    'Stats': {
                        'sent_bytes_second': '50000',
                        'rem_addr': '10.24.95.100:53468'
                    },
                    'PeerId': 'N2'
                },
                'LN3N4': {
                    'Stats': {
                        'sent_bytes_second': '50000',
                        'rem_addr': '10.24.95.100:53468'
                    },
                    'PeerId': 'N4'
                },
            },
            'Topology': {
                'PrefixLen': 16,
                'GeoIP': '1.2.3.4',
                'MAC': 'FF:FF:FF:FF:FF',
                'VIP4': '2.3.4.5',
                'InterfaceName': 'ipop_tap0'
            }
        }
    },
    'NodeId': 'N3'
},
{
    'Data': {
        'O1': {
            'LinkManager': {
                'LN4N1': {
                    'Stats': {
                        'sent_bytes_second': '50000',
                        'rem_addr': '10.24.95.100:53468'
                    },
                    'PeerId': 'N1'
                },
                'LN4N2': {
                    'Stats': {
                        'sent_bytes_second': '50000',
                        'rem_addr': '10.24.95.100:53468'
                    },
                    'PeerId': 'N2'
                },
                'LN4N3': {
                    'Stats': {
                        'sent_bytes_second': '50000',
                        'rem_addr': '10.24.95.100:53468'
                    },
                    'PeerId': 'N3'
                },
            },
            'Topology': {
                'PrefixLen': 16,
                'GeoIP': '1.2.3.4',
                'MAC': 'FF:FF:FF:FF:FF',
                'VIP4': '2.3.4.5',
                'InterfaceName': 'ipop_tap0'
            }
        }
    },
    'NodeId': 'N4'
}
]


even_tick_requs = [
{
    'Data': {
        'O1': {
            'LinkManager': {
                'LN1N2': {
                    'Stats': {
                        'sent_bytes_second': '50000',
                        'rem_addr': '10.24.95.100:53468'
                    },
                    'PeerId': 'N2'
                },
                #'LN1N3': {
                #    'Stats': {
                #        'sent_bytes_second': '50000',
                #        'rem_addr': '10.24.95.100:53468'
                #    },
                #    'PeerId': 'N3'
                #},
                'LN1N4': {
                    'Stats': {
                        'sent_bytes_second': '50000',
                        'rem_addr': '10.24.95.100:53468'
                    },
                    'PeerId': 'N4'
                },
            },
            'Topology': {
                'PrefixLen': 16,
                'GeoIP': '1.2.3.4',
                'MAC': 'FF:FF:FF:FF:FF',
                'VIP4': '2.3.4.5',
                'InterfaceName': 'ipop_tap0'
            }
        }
    },
    'NodeId': 'N1'
},
{
    'Data': {
        'O1': {
            'LinkManager': {
                'LN2N1': {
                    'Stats': {
                        'sent_bytes_second': '50000',
                        'rem_addr': '10.24.95.100:53468'
                    },
                    'PeerId': 'N1'
                },
                'LN2N3': {
                    'Stats': {
                        'sent_bytes_second': '50000',
                        'rem_addr': '10.24.95.100:53468'
                    },
                    'PeerId': 'N3'
                },
                #'LN2N4': {
                #    'Stats': {
                #        'sent_bytes_second': '50000',
                #        'rem_addr': '10.24.95.100:53468'
                #    },
                #    'PeerId': 'N4'
                #},
            },
            'Topology': {
                'PrefixLen': 16,
                'GeoIP': '1.2.3.4',
                'MAC': 'FF:FF:FF:FF:FF',
                'VIP4': '2.3.4.5',
                'InterfaceName': 'ipop_tap0'
            }
        }
    },
    'NodeId': 'N2'
},
{
    'Data': {
        'O1': {
            'LinkManager': {
                #'LN3N1': {
                #    'Stats': {
                #        'sent_bytes_second': '50000',
                #        'rem_addr': '10.24.95.100:53468'
                #    },
                #    'PeerId': 'N1'
                #},
                'LN3N2': {
                    'Stats': {
                        'sent_bytes_second': '50000',
                        'rem_addr': '10.24.95.100:53468'
                    },
                    'PeerId': 'N2'
                },
                #'LN3N4': {
                #    'Stats': {
                #        'sent_bytes_second': '50000',
                #        'rem_addr': '10.24.95.100:53468'
                #    },
                #    'PeerId': 'N4'
                #},
            },
            'Topology': {
                'PrefixLen': 16,
                'GeoIP': '1.2.3.4',
                'MAC': 'FF:FF:FF:FF:FF',
                'VIP4': '2.3.4.5',
                'InterfaceName': 'ipop_tap0'
            }
        }
    },
    'NodeId': 'N3'
},
{
    'Data': {
        'O1': {
            'LinkManager': {
                'LN4N1': {
                    'Stats': {
                        'sent_bytes_second': '50000',
                        'rem_addr': '10.24.95.100:53468'
                    },
                    'PeerId': 'N1'
                },
                #'LN4N2': {
                #    'Stats': {
                #        'sent_bytes_second': '50000',
                #        'rem_addr': '10.24.95.100:53468'
                #    },
                #    'PeerId': 'N2'
                #},
                #'LN4N3': {
                #    'Stats': {
                #        'sent_bytes_second': '50000',
                #        'rem_addr': '10.24.95.100:53468'
                #    },
                #    'PeerId': 'N3'
                #},
            },
            'Topology': {
                'PrefixLen': 16,
                'GeoIP': '1.2.3.4',
                'MAC': 'FF:FF:FF:FF:FF',
                'VIP4': '2.3.4.5',
                'InterfaceName': 'ipop_tap0'
            }
        }
    },
    'NodeId': 'N4'
}
]


if __name__ == '__main__':
    tick = 0
    while True:
        if tick % 2:
            reqs = odd_tick_reqs
            which = 'odd'
        else:
            reqs = even_tick_requs
            which = 'even'

        for r in reqs:
            node_id = r['NodeId']
            logging.info('Making {} request for node_id {}' \
                          .format(which, node_id))
            requests.put('http://10.244.36.186:5000/IPOP/nodes/'+node_id,
                         data=json.dumps(r), headers={'Content-Type':
                                                      'application/json'})

        tick += 1
        logging.info('Sleeping for 15...')
        time.sleep(15)
