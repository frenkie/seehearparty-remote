# See Hear And Control Your Own Party

If you haven't checked out [See Hear Party](http://www.seehearparty.com/) yet,
go do it! It combines GIF's from [Giphy](http://giphy.com) and music from 
[SoundCloud](http://soundcloud.com) into an energetic, epileptic and epic
party visualizer. Made with <3 by [@peterjavidpour](twitter.com/peterjavidpour);

# fighting over the remote
One thing missing is a remote, so you and your friends can fight over which GIF
to see or sound to hear. 

Well now it's here! With the See-Hear-Party-Remote you can manage the GIF tag input, 
the SoundCloud search query, or navigate to the next track from multiple devices.  

# usage
Go visit [http://www.seehearpartyremote.com](http://www.seehearpartyremote.com)
and follow the directions on that page to get going!
The [See Hear Party](http://www.seehearparty.com/) site currently only works in
Chrome, but the remotes work in any browser.

With version 2 of the software it's possible to connect multiple receivers and
remotes to a party place, so you can even party with people elsewhere.

# development and local server
The software consists of a [Node.js](http://nodejs.org/) server and a bookmarklet.
The server's root has links to a remote control web page that you can access from
multiple devices and to the bookmarklet, which connects
[http://www.seehearparty.com/](http://www.seehearparty.com/) to the server.

## install
Use `npm install` to install all prerequisites.

## server
Run the local server with `npm start`; by default it will run on `localhost:3000`.

You can also use `npm run-script debug` instead to get some debugging info.

## bookmarklet
The See Hear Party site currently only works on Chrome, so visit 
[http://localhost:3000](http://localhost:3000) in Chrome and drag
the bookmarklet to your Bookmarks.

Now visit [See Hear Party](http://www.seehearparty.com/) and start of with a GIF
and music search. Then activate the bookmarklet, enter the name of your party place
and you are all set.

## remotes
To connect any remote device to the server, make sure your computer with the
running server is accessible in your local network.
 
Go to `http://your-local-server:3000/remote` and voila, start fighting!

If you know the party name you can also connect to
`http://your-local-server:3000/remote/party/partyname` so you don't have to
specify the party name each time you (re)connect.


## access your development server from the Internet

If you want to make the server available from outside your local network so
your party people don't have to get access to your wifi, you can use a free
service like [ngrok](https://ngrok.com/) to make localhost:3000 available
(even with a custom subdomain) on ngrok.com.

Of course, if you already have your own Node server publicly available, 
use that one!


# version history

### 2.4.2
Remote control link now asks for your party name and redirects you to the
permalink for you party's remote.

### 2.4.1
Reference to the See Hear Party Remote site.

### 2.4.0
Removed profanity check, parties should be democratic :)

### 2.3.0
You can now easily connect to a party with a remote if you know the party name.
And when reconnecting you don't have to enter the party name again.

### 2.2.0
GIF tags now have a minimum of 1 and documented max of 4.
SeeHearParty.com doesn't allow deletion of the last tag,
so we have to respect that.

### 2.1.1
minor fix, able to deny reconnecting was broken

### 2.1.0
The service is deployed through [OpenShift.org](http://openshift.org)
which has specific demands on the client's WebSocket connection port.
A configuration is added to enable this.

### 2.0.0
Version 2 introduces See Hear Party As A Service. It is now possible to
create multiple party places on the web, on the fly, so you can have
an unlimited combination of receivers and remotes. Even multiple receivers
in 1 party place so you can share your party with people elsewhere.

### 1.1.0
When a remote client is disconnected without a user's intention (e.g. when
mobile phones go on lock mode) give them the change to automatically
reconnect.
For the See Hear Party receiver side, the same is implemented.

### 1.0.1
removed jQuery CDN resource protocol

### 1.0.0
First version! Setup your own See Hear Party remote control