# Contributing

## Setup
Copy `config/settings.json` to `config/hackrpi_settings.json` and update the defaults appropriately. Note: default admin username and password are required at a minimum. Be sure to run meteor with the custom settings: `meteor --settings config/hackrpi_settings.json`.

**Windows Users!** With Meteor 1.1, the Meteor Development Group has released official support for Meteor on Windows. Meteor is now completely supported on Windows which means that developers can now contribute to the same Meteor project while working on different platforms without issue. To that extent, the current Meteor version that the Status Board is running is **Meteor v1.2.0.4**.

You can still work within a Vagrant VM if you desire. The instructions follow.

**Requirements**
  - Download/Update [VirtualBox](https://www.virtualbox.org/wiki/Downloads).
  - Download/Update [Vagrant](https://www.vagrantup.com/downloads.html).
  - Download/Update [Git](http://git-scm.com/download/win).

**Getting Started**

Open Windows Powershell (or Command Prompt if you're old school).
```shell
$ git clone https://github.com/mpoegel/HackRPI-Status-Board.git
$ cd HackRPI-Status-Board
$ mkdir shared
$ set PATH=%PATH%;C:\Program Files (x86)\Git\bin
$ vagrant up
$ vagrant ssh
$ cd ~/shared
$ git clone https://github.com/mpoegel/HackRPI-Status-Board
$ cd HackRPI-Status-Board
$ mkdir -p ~/mock/HackRPI-Status-Board
$ mv .meteor ~/mock/HackRPI-Status-Board
$ mkdir .meteor
$ sudo mount --bind /home/vagrant/mock/HackRPI-Status-Board/.meteor .meteor
$ meteor --settings config/hackrpi_settings.json
```

**Important**

  - All version control must be done from within the VM! Otherwise Git will not follow the mounted `.meteor` directory.
  - If you shutdown your Vagrant VM using `vagrant halt`, then you need to remount the `.meteor` directory:
```sh
$ cd ~/shared/HackRPI-Status-Board
$ sudo mount --bind /home/vagrant/mock/HackRPI-Status-Board/.meteor .meteor
```

  You must do this BEFORE committing any changes!

Thanks to [gabrieljenik](https://gist.github.com/gabrieljenik/d926cbb90706d95abdee) for his Meteor on Windows using Vagrant tutorial.

## Deployment

We recommend deploying Status Board using Docker. Just run <br>
`docker build -t hackrpi/status-board .`

Then run 
```shell
docker run -d \
  -e ROOT_URL=https://status.hackrpi.com \
  -e MONGO_URL=<mongo_url> \
  -e METEOR_SETTINGS="$(cat path/to/settings.json)" \
  -p 80:80 \
  --name sb \
  hackrpi/status-board
```
