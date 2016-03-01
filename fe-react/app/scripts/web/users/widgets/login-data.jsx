import React from 'react';

export default class PasswordChange extends React.Component {
  constructor(props) {
    super(props);
    this.state = {user: props.user};
  }
  render() {
    return (
      <div className="info one">
        <span className="title">{this.props.windowAccount.login}:</span>
        <div className="field one">
          <fieldset>
            <input type="text" value={this.state.user.email} disabled/>
          </fieldset>
        </div>
      </div>
    );
  }
}
