# Josh Playground

## What is this

- This is a personal website built with **Next.js**, **TypeScript**, **Redux**, and **Socket.io**. It serves as a self-introduction page and hosts some cool web-based tools. The entire site is controlled via a built-in command line interface (CLI) — no buttons needed!

## Feature

- ### Command Line Interface (CLI)

  This website has no buttons like a normal website does. Instead, it is totally controlled by the built-in CLI at the bottom of the site.
  Use [Tab] to focus, type `help` to find available commands.

  **Basic commands (available on all pages):**

  `help` - Show the help message

  `cd [directory]` - Change the directory

  `cl` - Clear the console

  `ls` - List the directory (`-a` all, `-l` long, `-t` tree)

  `background [image_URL]` - Change the background

  `backgroundcolor [color]` - Change the background color

  `username [name]` - Set your username

- ### Home Page

  The home page displays personal info, social links, GitHub repos, and background music.

  **Available commands:**

  `github` - Open my GitHub profile

  `youtube` - Open my YouTube channel

  `twitter` - Open my Twitter channel

  `instagram` - Open my Instagram profile

  `twitch` - Open my Twitch profile

  `discord` - Add me on Discord

  `email` - Send me an email

  `osu` - Open my osu! profile

  `music [option]` - Background music options (`-p` play, `-s` stop, `-i` info, `-l` list)

## Tools

- ### Listen Together

  A web-based music sync player that allows you to add YouTube music by `queue [song_URL|playlist_URL]` and sync playback to all users in real-time.

  **Available commands:**

  `loop [option]` - Loop the track (`-t` true, `-f` false)

  `pause` - Pause playing

  `play` - Start playing

  `playlist [option]` - Show the playlist (`-d` detail)

  `queue [song_URL|playlist_URL]` - Add a song or playlist to queue

  `random [option]` - Random the track (`-t` true, `-f` false)

  `rate [value]` - Change the playback rate

  `refresh` - Refresh the queue

  `remove [index]` - Remove a track from the queue

  `seek [value]` - Seek the track

  `send [message]` - Send the message to the server

  `switch [index|option]` - Switch the track (`-n` next, `-p` prev)

  `volume [value]` - Change the volume

- ### YouTube Downloader

  A web-based tool that allows you to download YouTube videos in audio or video format.

  **Available commands:**

  `download [video_URL] <option>` - Download the video (`-v` video, `-a` audio)
