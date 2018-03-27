#!/bin/bash
sudo apt-get install curl
sudo apt-get install python3
sudo apt-get install python3-pip
sudo apt-get install -y mongodb

pip3 install --user virtualenv
python3 -m virtualenv ../venv
source ../venv/bin/activate
pip3 install -r Requirements.txt
deactivate

source ./npm_setup.sh
ln -s `pwd`/visualizer.sh ../visualizer
chmod +x ../visualizer
