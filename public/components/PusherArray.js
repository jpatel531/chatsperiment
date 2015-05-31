var ReactivePusher = {
  componentWillMount: function(){
    this.pusher = new Pusher('57c062d9ae3d0e36c417');
  },

  ReactivePusherArray: function(channel, id, options){
    var messagesChannel = this.pusher.subscribe('private-' + channel);
    return new this._RPA(messagesChannel, this, id);      
  }
}

ReactivePusher._RPA = function(stateChannel, component, id){
   this.channel = stateChannel; 
   this.component = component;
   this.id = id;
}

ReactivePusher._RPA.prototype.sync = function(){
  console.log(this.id);
  this.channel.bind('client-sync-response-'+this.id, function(data){
    var stateName = this.channel.name.replace("private-", "").replace("presence-", "")
    
    console.log(stateName)
    var state = {}; state[stateName] = data || [];
    this.component.setState(state);
  }, this);

  this.channel.bind('pusher:subscription_succeeded', function(){
    console.log(this.id);
    this.channel.trigger('client-sync-request', {id:this.id});
  }, this)

  return this;
}

ReactivePusher._RPA.prototype.allowPush = function(options){
  this.channel.bind("client-push", function(data){
      console.log("push")
      if (options && options.instanceWillEnter){
        data = options.instanceWillEnter(data) || data;
      }

      var stateName = this.channel.name.replace("private-", "").replace("presence-", "")

      var array = this.component.state[stateName]

      if (options && options.arrayWillAccept) {
        array = options.arrayWillAccept(array) || array;
      }

      array.push(data);
      var state = {}; state[stateName] = array;
      this.component.setState(state)

      if (options && options.arrayDidAccept) options.arrayDidAccept(array);
    }.bind(this));
  return this;  
}

ReactivePusher._RPA.prototype.push = function(item){
  var stateName = this.channel.name.replace("private-", "").replace("presence-", "")
  var array = this.component.state[stateName]
  array.push(item);
  var state = {} ; state[stateName] = array;
  this.component.setState(state);


  this.channel.trigger('client-push', item);

}

ReactivePusher._RPA.prototype.allowPrepend = function(options){
  this.channel.bind("prepend", function(data){
    if (options.instanceWillEnter){
      data = options.instanceWillEnter(data) || data;
    }

    var stateName = this.channel.name.replace("private-", "").replace("presence-", "")

    var array = this.component.state[stateName]

    if (options.arrayWillAccept) {
      array = options.arrayWillAccept(array) || array;
    }

    array.unshift(data);
    var state = {} ; state[stateName] = array;
    this.component.setState(state)

    if (options.arrayDidAccept) options.arrayDidAccept(array);
  }, this);
}

ReactivePusher._RPA.prototype.allowUpdate = function(options){

  this.channel.bind("update", function(data){

    var stateName = this.channel.name.replace("private-", "").replace("presence-", "")

    var query = {}
    query[options.key] = data[options.key];
    var array = this.component.state[stateName];
    var oldVal = _.findWhere(array, query);
    var array = _.without(array, oldVal).concat(data);
    var state = {} ; state[stateName] = array;
    this.component.setState(state);
  }, this);

}



