'use strict';
var ChannelModel = require('./channel_model.js');

module.exports = {
  CallbackModel: ChannelModel.ChannelModel,
  Channel: ChannelModel.Channel,
  ConfirmChannel: ChannelModel.ConfirmChannel
};
