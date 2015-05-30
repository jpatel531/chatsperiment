'use strict';

var ReactivePusher = {
  componentWillMount: function componentWillMount() {
    this.pusher = new Pusher('57c062d9ae3d0e36c417');
    this.uniqueChannel = this.pusher.subscribe('private-' + this.state.name);
  },

  ReactivePusherArray: function ReactivePusherArray(channel, options) {
    this.messagesChannel = this.pusher.subscribe('private-' + channel);
    var channel = this.pusher.subscribe(channel);
    return new this._RPA(channel, this);
  }
};

ReactivePusher._RPA = function (channel, component) {
  this.channel = channel;
  this.component = component;
  this.uniqueChannel = component.uniqueChannel;
};

ReactivePusher._RPA.prototype.sync = function () {

  this.uniqueChannel.trigger('client-sync', { sender: this.uniqueChannel.name.replace('private-', '') });

  return this;
};

ReactivePusher._RPA.prototype.allowPush = function (options) {
  this.channel.bind('client-push', (function (data) {
    if (options.instanceWillEnter) {
      data = options.instanceWillEnter(data) || data;
    }

    var stateName = this.channel.name.replace('private-', '').replace('presence-', '');

    var array = this.component.state[stateName];

    if (options.arrayWillAccept) {
      array = options.arrayWillAccept(array) || array;
    }

    array.push(data);
    var state = {};state[stateName] = array;
    this.component.setState(state);

    if (options.arrayDidAccept) options.arrayDidAccept(array);
  }).bind(this));
  return this;
};

ReactivePusher._RPA.prototype.push = function (item) {
  var stateName = this.channel.name.replace('private-', '').replace('presence-', '');
  var array = this.component.state[stateName];
  array.push(item);
  var state = {};state[stateName] = array;
  this.component.setState(state);
};

ReactivePusher._RPA.prototype.allowPrepend = function (options) {
  this.channel.bind('prepend', function (data) {
    if (options.instanceWillEnter) {
      data = options.instanceWillEnter(data) || data;
    }

    var stateName = this.channel.name.replace('private-', '').replace('presence-', '');

    var array = this.component.state[stateName];

    if (options.arrayWillAccept) {
      array = options.arrayWillAccept(array) || array;
    }

    array.unshift(data);
    var state = {};state[stateName] = array;
    this.component.setState(state);

    if (options.arrayDidAccept) options.arrayDidAccept(array);
  }, this);
};

ReactivePusher._RPA.prototype.allowUpdate = function (options) {

  this.channel.bind('update', function (data) {

    var stateName = this.channel.name.replace('private-', '').replace('presence-', '');

    var query = {};
    query[options.key] = data[options.key];
    var array = this.component.state[stateName];
    var oldVal = _.findWhere(array, query);
    var array = _.without(array, oldVal).concat(data);
    var state = {};state[stateName] = array;
    this.component.setState(state);
  }, this);
};
