# HackRPI Status Board
This is the status board for HackRPI! The official event board is at [status.hackrpi.com](http://status.hackrpi.com). Meanwhile, the development version can be found at [hackrpi.meteor.com](http://hackrpi.meteor.com).

The outline for v2.0.0 of the Status Board has been outlined on the [wiki](https://github.com/mpoegel/HackRPI-Status-Board/wiki/Road-Map)

## Setup
Copy `config/settings.json` to `config/hackrpi_settings.json` and update the defaults appropriately. Note: default admin username and password are required at a minimum. Be sure to run meteor with the custom settings: `meteor --settings config/hackrpi_settings.json`.

**Windows Users!** Meteor for Windows is still under development (now in [preview](https://github.com/meteor/meteor/wiki/Preview-of-Meteor-on-Windows) actually). It is recommended that you work in Linux. If you do decide to work with the Meteor Windows Preview, please do not commit changes to the `.meteor` directory. Nothing is guaranteed to work with the Windows Preview. You can also use a Linux VM using Vagrant:

**Requirements**
  - Download/Update [VirtualBox](https://www.virtualbox.org/wiki/Downloads).
  - Download/Update [Vagrant](https://www.vagrantup.com/downloads.html).
  - Download/Update [Git](http://git-scm.com/download/win).

**Getting Started**

Open Windows Powershell (or Command Prompt if you're old school).
  1. Clone this repository. `git clone https://github.com/mpoegel/HackRPI-Status-Board.git`.
  2. `cd HackRPI-Status-Board`
  3. `mkdir shared`
  4. If not previously set: `set PATH=%PATH%;C:\Program Files (x86)\Git\bin`
  5. `vagrant up` (Note: this step will take a few minutes.)
  6. `vagrant ssh`
  7. `cd ~/shared/HackRPI-Status-Board`
  8. Make the necessary changes to hackrpi_settings.json and run `meteor --settings config/hackrpi_settings.json`

**Important**

  - All version control must be done from within the VM! Otherwise Git will not follow the mounted `.meteor` directory.
  - If you shutdown your Vagrant VM using `vagrant halt`, then you need to remount the `.meteor` directory:
    1. `cd ~/shared/HackRPI-Status-Board`
    2. `sudo mount --bind /home/vagrant/mock/HackRPI-Status-Board/.meteor .meteor`

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
