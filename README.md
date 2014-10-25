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

# install
Use `npm install` to install all prerequisites.

# usage
The remote consists of [Node.js](http://nodejs.org/) server and a bookmarklet. 
The server's root is a remote control web page that you can access from multiple devices.
The bookmarklet connects [http://www.seehearparty.com/](http://www.seehearparty.com/)
to the server.

## server
Run the server with `npm start`; by default it will run on `localhost:3000`.

You can also use `npm run-script debug` instead to get some debugging info.

## bookmarklet
The See Hear Party site currently only works on Chrome, so visit 
[http://localhost:3000/bookmarklet](http://localhost:3000/bookmarklet) in Chrome and drag
the bookmarklet to your Bookmarks.

Now visit [See Hear Party](http://www.seehearparty.com/) and start of with a GIF
and music search. Then activate the bookmarklet, enter the URL of the server
and wait for the 'connected! Start partying!' message.

## remotes
To connect any remote device to the server, make sure your computer with the
running server is accessible in your local network.
 
Go to `http://your-local-server:3000/` and voila, start fighting! 


# Access the server from the Internet

If you want to make the server available from outside your local network so
your party people don't have to get access to your wifi, you can use a free
service like [ngrok](https://ngrok.com/) to make localhost:3000 available
(even with a custom subdomain) on ngrok.com.

Of course, if you already have your own Node server publicly available, 
use that one!


# version history

### 1.1.0
When a remote client is disconnected without a user's intention (e.g. when
mobile phones go on lock mode) give them the change to automatically
reconnect.
For the See Hear Party receiver side, the same is implemented.

### 1.0.1
removed jQuery CDN resource protocol

### 1.0.0
First version! Setup your own See Hear Party remote control