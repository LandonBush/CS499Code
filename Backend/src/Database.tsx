import Mongoose from 'mongoose'
import {Md5} from 'ts-md5/dist/md5'

// Initialize connection to MongoDB
Mongoose.connect("mongodb://0.0.0.0:27017/kalinet")
    .then(() => {
        console.log("Successfully connected to MongoDB database.")
    })

// Database schema setup for the Post table
interface Post {
    content: string, // the text content of the post
    creator: Mongoose.Types.ObjectId | User, // a reference to the user who created the post
    timeCreated: number, // the unix timestamp at which the post was created
    tags: string[], // the list of searchable tags attached to the post
}
const PostsSchema = new Mongoose.Schema<Post>({
    content: {type: String, required: true},
    creator: {type: Mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    timeCreated: {type: Number, required: true},
    tags: {type: [String], required: true, default: []},
})
const PostModel = Mongoose.model("Post", PostsSchema)

// Database schema setup for the User table
interface User {
    username: string, // the user's username
    passwordHash: string, // the MD5 hash of the user's password
    style: string, // the user's current CSS styling
}
const UsersSchema = new Mongoose.Schema<User>({
    username: {type: String, required: true},
    passwordHash: {type: String, required: true},
    style: {type: String, required: false},
})
const UserModel = Mongoose.model("User", UsersSchema)

// Returns all posts that have the given tag attached
export async function getPostsWithTag(tag: string): Promise<Post[]> {
    return await PostModel
        .find({
            tags: [tag]
        })
        // fill in the data of the post creator, but exclude password hash
        .populate<{creator: User}>('creator', '-passwordHash')
        .exec()
}

// Returns any posts made between the start and end times, formatted as unix timestamps
// If no timestamps are supplied, simply returns all posts
export async function getPostsInTimeRange(start: number, end: number): Promise<Post[]> {
    // If either timestamp is null, set it to its maximum/minimum value
    if (start == null) {
        start = 0
    }
    if (end == null) {
        end = Number.MAX_VALUE
    }
    return await PostModel
        // Find posts made between the two timestamps
        .find({
            timeCreated: {
                $lt: end,
                $gt: start,
            }
        })
        // fill in the data of the post creator, but exclude password hash
        .populate<{creator: User}>('creator', '-passwordHash')
        .exec()
}

// Returns only recent posts
export async function getRecentPosts(): Promise<Post[]> {
    // Find all posts created in the last 12 hours
    return getPostsInTimeRange(Date.now() - (12 * 60 * 60 * 1000), Date.now())
}

// Returns the ID of the user with the given username, or null if that's not possible
export async function getUserID(username: string): Promise<Mongoose.Types.ObjectId> {
    let user = await UserModel.findOne({ username: username })
    return user._id
}

// Adds the given post to the database
export async function createPost(post: Post) {
    let postModel = new PostModel(post)
    await postModel.save()
}

// Create a new user in the database
// Returns whether the user creation was successful
export async function createUser(user: User): Promise<boolean> {
    // First we have to make sure the user doesn't exist yet
    let userMaybe = await UserModel.findOne({ username: user.username }).exec()
    if (userMaybe) {
        return false
    }
    // Then, if the user doesn't exist yet, we add the new user
    let userModel = new UserModel(user)
    await userModel.save()
    return true
}

// Check if the given login details are correct
export async function checkLogin(username: string, password: string): Promise<boolean> {
    let passHash = Md5.hashStr(password) // Get Md5 hash of the given password
    let user = await UserModel.findOne({ username: username }).exec() // Find the given user
    if (user == null) { // If the user doesn't exist, the login fails
        return false
    }
    return user.passwordHash === passHash // Return true if the hashes match, otherwise false
}

export { Post, User }