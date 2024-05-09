This is a Back-end of Twitter-clone project

## Twitter clone

This web application incorporates fundamental functionalities like Twitter, including
user authentication (login/register), tweet creation, retweet,tweet circle, mention, comment, like,
bookmark, follow/unfollow, and direct messaging among users. It also integrates a notification
system to inform users about activities such as new followers, likes, comments, and incoming
messages.

## Demo
*
    - Front-end demo (Vercel): [Link](https://github.com/Vux142857/fe-twitter)
    - [https://www.mytweet.one](https://www.mytweet.one)
    - Account demo: thanhvu7a1@gmail.com:admindemo
    
## Features
*
    - Authentication: + Access Token && Refresh Token (JWT)
                      + Bcrypt for encrypt
    - Tweet: create Tweet, ReTweet, Tweet Circle, Mention, Newfeeds, Comments
    - Interact: comment, like, bookmark, follow and chat with other user
    - Socket.io to handle room chat, send notification
    - Improve performance: use redis for caching, Index field in Mongodb
    - Search: Full-text - MongoDB Atlas Search
    - Other:  Aggregation Mongodb to get documents

## Prerequisites
*
    - MongoDB
    - NodeJS
    - npm
    - Redis/Redis-server
    - AWS account

## Getting Started
* First, run the development server:

```bash
sudo service redis-server start
npm run dev
```
### Client-side usage (PORT:3001)
### Server-side usage (PORT:3000)
## Deploy on AWS EC2
