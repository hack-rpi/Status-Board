#!/bin/bash
sudo apt-get update
sudo apt-get install curl
sudo apt-get install git
curl https://install.meteor.com | sudo sh
cd ~/shared
git clone https://github.com/mpoegel/HackRPI-Status-Board
cd HackRPI-Status-Board
mkdir -p ~/mock/HackRPI-Status-Board
mv .meteor ~/mock/HackRPI-Status-Board
mkdir .meteor
sudo mount --bind /home/vagrant/mock/HackRPI-Status-Board/.meteor .meteor
