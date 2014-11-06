# HackRPI Status Board
This is the status board for HackRPI! Live at status.hackrpi.com

## Repository Tracking
Track all the repositories from the event! A database of all repositories is
created so information from the repos can be periodically queried.

Attendees will be able to enter add their own repos at any time by scanning a
QR code. They will then be redirected to a page to enter their Github handle
and repo name.

## Commit Messages
Using all the repos in the database, queries are made every minute (must
manually adjust for the number of repos) to capture all commits made. The 10
most recent commits are displayed but all of the commits are stored.

All commit messages are run through PurgoMalum to filter out profanities so
they are not displayed.

## Real-Time Commit Graph
See a graph of the frequency of commits as the event progress, created in real-
time!

## Integrated Twitter Feed
It's really just the Twitter widget embedded in the html, but still, it's there.

Note: This feature does not work in Firefox! (Chrome and Internet Explorer confirmed to work.)

## Announcements Pane
Other announcements for the event can be put in a separate panel.

## Administrator Management
The Admin of the site has the power to
- flag favorite commit for later reference
- add announcements to be show on the home page at a specified time for a specified interval
- 
