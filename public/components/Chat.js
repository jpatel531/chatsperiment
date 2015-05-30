var Chat = React.createClass({

  mixins: [ReactivePusher],

  getInitialState: function() {
    return {
      name: null,
      messages: []
    };
  },


  _onName: function(e){
    if (e.nativeEvent.keyCode != 13) return;
    var name = e.target.value;
    console.log(name);
    this.setState({name: name});
    this.realtimeMessages = this.ReactivePusherArray("messages", name).sync().allowPush();
  },

  _onMessage: function(e){
    if (e.nativeEvent.keyCode != 13) return;
    var message = {
      name: this.state.name,
      body: e.target.value
    }

    this.realtimeMessages.push(message);

    e.target.value = ""
  },

  render: function() {

    var body;

    if (this.state.name) {
      body = (
        <div>
          <Messages messages={this.state.messages} />
          <Inputs _onMessage={this._onMessage} />
        </div>)
    } else {
      body = (
        <Heading _onName={this._onName} />
      )
    }

    return (
      <div>
        {body}
      </div>
    );
  }

});

React.render(<Chat />, document.getElementById('app'))