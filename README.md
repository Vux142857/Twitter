This is a Back-end of Twitter-clone project

## Twitter clone

This web application incorporates fundamental functionalities like Twitter, including
user authentication (login/register), tweet creation, retweet,tweet circle, mention, comment, like,
bookmark, follow/unfollow, and direct messaging among users. It also integrates a notification
system to inform users about activities such as new followers, likes, comments, and incoming
messages.

## Demo

    - Front-end demo (Vercel): [Link](https://github.com/Vux142857/fe-twitter)

[https://www.mytweet.one](https://www.mytweet.one)

## Features
    - Authentication: + Access Token && Refresh Token (JWT)
                      + Bcrypt for encrypt
    - Tweet: create Tweet, ReTweet, Tweet Circle, Mention, Newfeeds, Comments
    - Comment, Like, Bookmark
    - Follow and chat with other user
    - Socket.io to handle Room chat, send Notification

## Prerequisites
    - MongoDB
    - NodeJS
    - npm
    - Redis/Redis-server

## Getting Started

First, run the development server:

```bash
sudo service redis-server start
npm run dev
```
### Client-side usage (PORT:3001)
### Server-side usage (PORT:3000)


Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Deploy on AWS EC2
