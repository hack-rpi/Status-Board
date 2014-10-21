# HackRPI Status Board
This is the status board for HackRPI!

## Repository Tracking
Track all the repositories from the event! A database of all repositories is
created so information from the repos can be periodically queried.

Attendees will be able to enter add their own repos at any time by scanning a
QR code.

## Commit Messages
Using all the repos in the database, queries are made every minute (must
manually adjust for the number of repos) to capture all commits made. The 10
most recent commits are displayed but all of the commits are stored.

All commit messages are run through PurgoMalum to filter out profanities so
they are not displayed.

Attendees are also able to '+1' their favorite commit messages.

## Real-Time Commit Graph
See a graph of the frequency of commits as the event progress, created in real-
time!

## Integrated Twitter Feed
It's really just the Twitter widget embedded in the html, but still, it's there.

## Announcements Pane
Other announcements for the event can be put in a separate panel.
