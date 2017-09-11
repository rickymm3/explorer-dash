# .bash_profile

# Get the aliases and functions
if [ -f ~/.bashrc ]; then
	. ~/.bashrc
fi

# User specific environment and startup programs
ERDS="/node-dev/erds-web-dashboard"

export ERDS

PATH=$PATH:$HOME/.local/bin:$HOME/bin:$ERDS/bash

export PATH

cd /node-dev/erds-web-dashboard

. ./bash/colors

LONG_LINES="==============================================================="
INTRO_MESSAGE=" [Note from ${CLR_CYAN}PIERRE${CLR_YELLOW}]

 Welcome to the 'erds-web-dashboard' folder!

 You can easily run some Web-Dashboard commands like the following:

 - eggroll        ${CLR_RED}# This restarts the Redis + PM2 process${CLR_YELLOW}
 - eggroll start  ${CLR_RED}# Starts the Redis + PM2 process.${CLR_YELLOW}
 - eggroll stop   ${CLR_RED}# Stops the Redis + PM2 process.${CLR_YELLOW}
 
 Git related:
 
 - eggroll pull   ${CLR_RED}# Does a 'git pull' to get latest master and restarts.${CLR_YELLOW}
 - eggroll push   ${CLR_RED}# Does a 'git add', 'commit', and 'push' to master branch.${CLR_YELLOW}
 
 
 This message is stored in: /home/ec2-user/.bash_profile
 
 Last but not least, if you need help? Email me at:
 
 ${CLR_CYAN}chamberlainpi@gmail.com${CLR_YELLOW}
 "

printf "${CLR_YELLOW}\n"
printf "===============================================================\n"
printf "${INTRO_MESSAGE}\n"
printf "===============================================================\n"
printf "${CLR_NORMAL}$ERDS\n"