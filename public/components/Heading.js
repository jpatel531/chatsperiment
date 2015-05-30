var Heading = React.createClass({

  render: function() {
    return (
      <input onKeyPress={this.props._onName} placeholder="Please enter your name" />
    );
  }

});
