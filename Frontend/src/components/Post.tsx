import React from 'react';
import Markdown from 'markdown-to-jsx';

// Disgusting hack to allow CSS strings in React
// React really doesn't want to let me supply a raw string as CSS style,
// so setting the 'style' attribute results in a compile error.
// However, setting the 'STYLE' attribute, as a custom attribute, does not.
// Most browsers treat the 'style' property case-insensitively, so this works.
// I promise that there is no other way.
declare module 'react' {
    interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
        STYLE?: string;
    }
}

// The data needed to render a post
export type PostProps = {
    content: string,
    css: string,
}

// Component representing a single post
export class Post extends React.Component<PostProps, {}> {
    render() {
        return (
            <div className="post" STYLE={this.props.css}>
                <Markdown>{this.props.content}</Markdown>
            </div>
        )
    }
}

// Component representing a list of posts
export class PostsContainer extends React.Component<{ postsData: PostProps[] }, {}> {
    render() {
        // Start with an empty array of JSX elements
        let posts: JSX.Element[] = []
        // For each PostProps data, create a Post component with that data and add it to the list
        this.props.postsData.forEach(post => {
            posts.push(<Post content={post.content} css={post.css} />)
        })
        // Finally, return a JSX element that contains all of the Posts
        return (
            <div className="posts-container">
                {posts}
            </div>
        )
    }
}