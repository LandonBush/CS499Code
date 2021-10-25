import React from 'react';
import { checkAuthentication, createUser } from '../API';
import { TextEntry } from './TextEntry';

type LoginState = {
    usernameBoxRef: React.RefObject<TextEntry>,
    passwordBoxRef: React.RefObject<TextEntry>,
}
export class Login extends React.Component<{}, LoginState> {
    constructor(props: {}) {
        super(props)
        this.state = {
            usernameBoxRef: React.createRef(),
            passwordBoxRef: React.createRef(),
        }
    }

    render() {
        let loginTextEntryStyle = {
            width: '100px',
            height: '20px',
            display: 'block',
            marginLeft: '0px',
            marginBottom: '20px',
            marginRight: '100px',
        }
        return (
            <div className="login-container">
                <TextEntry 
                    ref={this.state.usernameBoxRef}
                    label="username:"
                    style={loginTextEntryStyle}
                />
                <TextEntry
                    ref={this.state.passwordBoxRef}
                    label="password:"
                    style={loginTextEntryStyle}
                />
                <button className="login-button" onClick={() => this.authenticate()}>Log in</button>
                <button className="account-create-button" onClick={() => this.createAccount()}>Create account</button>
            </div>
        )
    }

    authenticate() {
        let username = this.state.usernameBoxRef.current!.state.text
        let password = this.state.passwordBoxRef.current!.state.text
        checkAuthentication(username, password).then(success => {
            if (!success) alert("Login failed. Either the username or password is incorrect.")
            else alert("Login successful.")
        })
    }

    createAccount() {
        let username = this.state.usernameBoxRef.current!.state.text
        let password = this.state.passwordBoxRef.current!.state.text
        let style = 'background-color: #00ff00'
        createUser(username, password, style).then(success => {
            if (!success) alert("User creation failed. The username may be taken.")
            else alert("User creation successful.")
        })
    }
}