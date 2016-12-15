![ERDS Web Dashboard title](http://imgur.com/K5VYi8K.png)

:exclamation::exclamation::exclamation: IMPORTANT :exclamation::exclamation::exclamation:
---------------------------------------------------

If you're developing on this project,
make sure to create a separate branch or work off of the `dev` branch and NOT the `master` branch,
since this is what our Amazon AWS / EC2 instance depends on to run the live website and could be fragile
if untested code is directly pushed to `master`.

Installation
============

**(for testing on your own `localhost` address)**

 - If you don't have **NodeJS**, install it first from: https://nodejs.org/en/download/
 - Clone this project to a folder on your computer.
 - Open a your console/terminal at that folder (ex: `C:\Users\YOUR_USERNAME\Github\erds-web-dashboard\`)
   - Type: `npm install` to download all the module dependencies.


Run
===

Open a console/terminal window and type `node app`. This should run the `app.js` script found at the root of this repo's folder.

You should then see something like this in the console:

![ERDS Web Dashboard node app screenshot](http://imgur.com/PlejcOf.png)


Viewing the site
================

While the script is running, you can open up your browser and enter the URL: `localhost:9999`

That should load up the site and show something like this (screenshot may very well be outdated):

![ERDS Web Dashboard browser screenshot](http://imgur.com/IMWlkfx.png)
