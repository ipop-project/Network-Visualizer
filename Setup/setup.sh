#!/bin/bash
sudo apt-get install python2.7
sudo apt-get install python-pip
sudo apt-get install -y mongodb
pip install --user virtualenv
python -m virtualenv ../venv
source ../venv/bin/activate
python -m pip install -r Requirements.txt
ln -s `pwd`/visualizer.sh ../visualizer
chmod +x ../visualizer
