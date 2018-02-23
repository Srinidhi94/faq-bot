const builder = require('botbuilder');

function createEvent(eventName, value, address) {
    var msg = new builder.Message().address(address);
    msg.data.type = "event";
    msg.data.name = eventName;
    msg.data.value = value;
    console.log(msg);
    return msg;
};

module.exports = {
    createEvent: createEvent,
}