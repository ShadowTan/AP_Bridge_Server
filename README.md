# AP_Bridge_Server
 This project will be about making the a local version of the game Bridge using RESTapi, to be played against bots.

PS. Currently has no ERROR handling, so avoid from, example: asking for info about a game that does not exist

<p color="red">
DOES NOT WORK WITHOUT TESTMODE
</p>


### info
start with "npm init" to install all packages, then "npm run dev"

All valid API calls are in the API_Requests.http file

# bidding
for Player change it to current player, example if it says "east" just change it to "south" when it's their turn
for bidding, suits are labeled as " c, d, h, s, nc ", and numbers are put before, so: 1nc, 1s etc are valid bids. "skip" is also valid if you want to skip


Thanks!