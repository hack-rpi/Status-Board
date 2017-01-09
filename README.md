# Status Board
This is the status board for HackRPI! The official event board is at 
[status.hackrpi.com](https://status.hackrpi.com).

This project is a **work in progress**. Deploy at your own risk. Contributors are welcome! See
`CONTRIBUTING.md` for details.

## Features

### Attendee Registration
*Collect registration data from all applicants.* Users can register for the hackathon as either a
hacker, mentor, or volunteer. Each type of user has a unique profile view to control information
relevant to their role.

### Event Check-In
*Easily check-in users when they arrive*. Using a special check-in interface, users enter their
email to mark as having checked-in. There is also the option to attach a guest WiFi username to
the account at the time of check-in.

### Repository Tracking
*Track all the repositories from the hackathon.* Attendees can add their team's github repository
to their profile and set up a web hook that will be triggered every time a commit is pushed to
the repo. The newest commits are featured on the main event page.

### Mentor Matching
*Ask for a mentor to help with your specific problem.* Anyone can request a mentor when they 
needs help by submitting a mentor request. The help tags in the request will help match the person 
to the best fit active mentor in the database. The mentor will be sent a text message when someone 
needs their help. The mentor can respond to the text when the job is completed to be re-added to
the active queue.

### Announcements
*Share live event updates to everyone at the hackathon*. Admins can easily push announcements to
everyone at the event.


## Deployment

You can easily deploy Status Board using Docker. More details are on 
[Docker Hub](https://hub.docker.com/r/hackrpi/status-board/) and in `CONTRIBUTING.md`.
