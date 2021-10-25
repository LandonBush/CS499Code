/*
    This file contains all of the functions that interact with the backend REST API
*/

import {PostProps} from './components/Post';

const serverUrl = "http://localhost:3001"

// Returns the most recent 20ish posts
export function getPostsFromServer(): Promise<PostProps[]> {
    return fetch(serverUrl + "/retrieve_posts")
        .then(result => result.json())
        .then(result => {
            // The received posts come as this type, with a bunch of extra fields we don't need
            type ReceivedPostType = {
                content: string,
                creator: {
                    style: string,
                }
            }
            // Cast the result to the type described above
            return (result as ReceivedPostType[])
                // Then map that type to PostProps, since that's the format we need it in
                .map(x => {return {content: x.content, css: x.creator.style}})
        })
}

export function sendPostToServer(post: PostProps) {
    fetch(
        serverUrl + "/create_post",
        {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({
                content: post.content,
                creatorName: 'root',
            })
        }
    )
}

export function checkAuthentication(username: string, password: string): Promise<boolean> {
    return fetch(
        serverUrl + "/authenticate_login",
        {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({
                username: username,
                password: password,
            })
        }
    ).then(result => result.json())
    .then(result => {
        return result.success;
    });
}

export function createUser(username: string, password: string, style: string): Promise<boolean> {
    return fetch(
        serverUrl + "/create_user",
        {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({
                username: username,
                password: password,
                style: style,
            })
        }
    ).then(result => result.json())
    .then(result => {
        return result.success;
    });
}

