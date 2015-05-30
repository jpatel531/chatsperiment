var Inputs = React.createClass({

  render: function() {
    return (
      <div>
        <input placeholder="Type your message" onKeyPress={this.props._onMessage} />
      </div>
    );
  }

});