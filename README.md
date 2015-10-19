# HackRPI Status Board
This is the status board for HackRPI! The official event board is at [status.hackrpi.com](http://status.hackrpi.com). Meanwhile, the development version can be found at [status.memake.science](http://status.memake.science).

The outline for v2.0.0 of the Status Board has been outlined on the [wiki](https://github.com/mpoegel/HackRPI-Status-Board/wiki/Road-Map)

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


## Features
Version 1.0.0

### Repository Tracking
Track all the repositories from the event! A database of all repositories is
created so information from the repos can be periodically queried.

Attendees will be able to enter add their own repos at any time by scanning a
QR code. They will then be redirected to a page to enter their Github handle
and repo name.

### Mentor Requests
Anyone can request a mentor when he/she needs help but submitting a mentor request form. The help tags in the request will help match the person to the best fit mentor in the database. The mentor will be sent a text message when someone needs his/her help.

### Commit Messages
Using all the repos in the database, queries are made every minute (must
manually adjust for the number of repos) to capture all commits made. The 10
most recent commits are displayed but all of the commits are stored.

All commit messages are run through PurgoMalum to filter out profanities so
they are not displayed.

### Real-Time Commit Graph
See a graph of the frequency of commits as the event progress, created in real-
time! **Not implemented in v1.0.0.**

### Integrated Twitter Feed
It's really just the Twitter widget embedded in the html, but still, it's there.

Note: This feature does not work in Firefox! (Chrome and Internet Explorer confirmed to work.)

### Announcements
Current announcements will appear at the top of the home page.

### Administrator Management
The Admin of the site has the power to
- flag commits for later reference
- add announcements to be show on the home page at a specified time for a specified interval
- add/delete mentors from the database
- add/delete users from the database
- add/delete repositories from the database
