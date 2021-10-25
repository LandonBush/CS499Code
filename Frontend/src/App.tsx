import React from 'react';
import { PostProps, PostsContainer } from './components/Post';
import { sendPostToServer, getPostsFromServer } from './API';
import update from 'immutability-helper';
import { TextEntry } from './components/TextEntry';
import './App.css';
import { Login } from './components/Login';

// AppState represents the current state of the site
type AppState = {
  posts: PostProps[], // a list of data for the posts that should currently be rendered
  postCreateTextRef: React.RefObject<TextEntry>, // a reference to the text entry box for post creation
  postCreateStyleRef: React.RefObject<TextEntry>, // a reference to the text entry box for post styling
}

// Entrypoint for React app
class App extends React.Component<{}, AppState> {
  constructor(props: {}) {
    // Since there are no properties that need to be passed to this component on creation, we super a blank object
    super(props)
    // Initialize the state to blank values
    this.state = {
      posts: [],
      postCreateTextRef: React.createRef(),
      postCreateStyleRef: React.createRef(),
    }
  }

  // Runs after the component initializes
  componentDidMount() {
    // Set the 'posts' state value equal to whatever the server returns when queried for the list of recent posts
    getPostsFromServer()
      .then(result => {
        this.setState(update(this.state, {posts: {$set: result}}))
      })
  }

  // Returns the rendered component as a JSX element
  render() {
    return (
      <div className="app">
        <Login />
        <div className="post-create-container">
          <TextEntry label="Create a post:" style={{width: '75%', height:'100%'}} ref={this.state.postCreateTextRef} />
          <TextEntry label="Post styling:" style={{width: '25%', height:'100%'}} ref={this.state.postCreateStyleRef} />
        </div>
        <button className="post-button" onClick={() => this.createPost()}>Post!</button>
        <PostsContainer postsData={this.state.posts} />
      </div>
    )
  }

  // Create a post from the current contents of the post creation text boxes, and send that post to the server
  createPost() {
    let content = this.state.postCreateTextRef.current!.state.text
    let css = this.state.postCreateStyleRef.current!.state.text
    // Making a blank post would be silly. Blank CSS is fine.
    if (content == null) {
      alert("Cannot post a blank post.")
      return
    }
    let post: PostProps = {
      content: content,
      // If CSS is null, we instead use an empty string
      css: css == null ? '' : css,
    }
    sendPostToServer(post)
    // Manually add the post to the local state, so we don't have to re-fetch from the server
    this.setState(update(this.state, {posts: {$push: [post]}}))
  }
}

export default App
