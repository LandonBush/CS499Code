import express from 'express'
import { checkLogin, createPost, createUser, getPostsInTimeRange, getPostsWithTag, getRecentPosts, getUserID, Post, User } from './Database'
import cors from 'cors'
import {Md5} from 'ts-md5/dist/md5'

// Initial REST server setup
let restServer = express()
restServer.use(cors({
    origin: ["http://localhost:3001", "http://localhost:3000"],
}))
restServer.use(express.json())

// Retrieve all posts within the specified range, or recent posts if the range is blank
// Start and end times should be specified as timestamps in unix timestamp format
restServer.get("/retrieve_posts", (req: express.Request<{}, {}, {
    rangeStart?: number,
    rangeEnd?: number,
}>, response) => {
    console.log("Received a GET request for posts. Data: " + req.body)
    // If the range is empty, we just get recent posts
    if (req.body.rangeStart == null && req.body.rangeEnd == null) {
        getRecentPosts().then(result => {
            response.send(result)
        })
    // Otherwise we get posts within the range
    } else {
        // Note that getPostsInTimeRange is okay with null values. It fills them in to 0 or MAX
        getPostsInTimeRange(req.body.rangeStart, req.body.rangeEnd).then(result => {
            response.send(result)
        })
    }
})
// Retrieve all posts that have the given tag
restServer.get("/retrieve_tagged_posts", (req: express.Request<{}, {}, {
    tag: string,
}>, response) => {
    console.log("Received a GET request for tagged posts. Data: " + req.body)
    getPostsWithTag(req.body.tag).then(result => {
        response.send(result)
    })
})
// Check login authentication
// Returns a single 'result' value, which is true if the login is authentic
restServer.post("/authenticate_login", (req: express.Request<{}, {}, {
    username: string,
    password: string,
}>, response) => {
    console.log("Received a GET request for login authentication. Data: " + req.body)
    checkLogin(req.body.username, req.body.password).then(result => {
        response.send({
            success: result,
        })
    })
})
// Create a new post with the given content and creator
restServer.post("/create_post", (req: express.Request<{}, {}, {
    content: string,
    creatorName: string,
    password: string,
}, {}>, response) => {
    console.log("Received POST request. Data: " + req.body)
    // First, make sure the user has the correct password
    checkLogin(req.body.creatorName, req.body.password).then(result => {
        // If the post was successful, it's okay to create the post
        if (result) {
            getUserID(req.body.creatorName).then(userID => {
                let post: Post = {
                    content: req.body.content,
                    timeCreated: Date.now(),
                    creator: userID,
                    tags: [],
                }
                // Add tags to the post based on the post contents
                processNewPostTags(post)
                // Add the post to the database
                createPost(post)
            })
            response.send({
                success: true,
                message: "Post successful"
            })
        // If login didn't work out, we send an error message
        } else {
            response.send({
                success: false,
                message: "Post failed due to lack of authentication."
            })
        }
    })
})
// Create a new user with the given details
restServer.post("/create_user", (req: express.Request<{}, {}, {
    username: string,
    password: string,
    style: string,
}, {}>, response) => {
    console.log("Received create user request. Data: " + req.body)
    createUser({
        username: req.body.username,
        passwordHash: Md5.hashStr(req.body.password),
        style: req.body.style,
    }).then(result => {
        if (result) {
            response.send({
                success: true,   
                message: "User creation was successful."
            })
        } else {
            response.send({
                success: false,
                message: "User creation failed. Perhaps that name is taken."
            })
        }
    })
})

// Start up the REST server
restServer.listen(3001, () => {
    console.log("REST API enabled on port 3001.")
})

// Searches a post's content for words beginning with '#' and adds any such words to that post's tag list
function processNewPostTags(post: Post) {
    let tags: string[] = []
    let words = post.content.split(/(\s+)/) // Split the string using any whitespace as separators
    words.forEach(word => {
        // If the word starts with # and is not just a #, add it to the list (excluding the # character)
        if (word.startsWith('#') && word.length > 1) tags.push(word.substring(1))
    })
    // Finally, add the newly-found tags
    post.tags = tags
}