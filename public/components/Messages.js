var Messages = React.createClass({

  render: function() {

    var messages = this.props.messages.map(function(message){
      return (
        <p><b>{message.name}</b>: <i>{message.body}</i></p>
      )
    });

    return (
      <div>
        {messages}
      </div>
    );
  }

});