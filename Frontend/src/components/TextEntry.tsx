import React from 'react';

type TextEntryProps = {
    label?: string, // The label to display above the text box
    style?: React.CSSProperties, // Any CSS style specific to this textbox, such as width
}
type TextEntryState = {
    text: string // The text that the text box currently contains
}
export class TextEntry extends React.Component<TextEntryProps, TextEntryState> {
    constructor(props: TextEntryProps) {
        super(props)
        // Initialize state to blank value
        this.state = {
            text: ''
        }
    }

    render() {
        // If no style was given, we use an empty style object instead of undefined
        let style = this.props.style === undefined ? {} : this.props.style
        return (
            <div className="post-create-content-container" style={style}>
                <label>{this.props.label}</label>
                <textarea className="post-create-content" onChange={
                    evt => {
                        // Simply set the state to reflect the updated contents of the text box, whenever it's changed
                        this.setState({
                            text: evt.target.value
                        })
                    }
                } />
            </div>
        )
    }
}