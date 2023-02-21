# kmi.js
Javascript library for the Kick chat box (kick.com)  
**Heavily** inspired by [tmi.js](https://www.npmjs.com/package/tmi.js)  

**Note: kmi.js is under development and is not ready for production.**  
**kick.com does not have documentation for any public API so support will be minimal.**

## Example
```javascript
const kmi = require('kmi.js');
const client = new kmi.Client({
    connection: {
        secure: true,
        server: "ws-us2.pusher.com/app/eb1d5f283081a78b932c?protocol=7&client=kmi.js&version=7.4.0&flash=false",
    },
    channels: [1088868],
    chatrooms: [1081964]
});

client.connect();

client.on("chat", (channel, user, message, self) => {
    if(self) return;
    console.log(`${user.username} said ${message.message}`);
})
```

## Events:
- **debug**: Debug logs
- **raw_message**: Any WebSocket data received
- **chat**: Received a message from chat
- **connecting**: Connecting to the server
- **connected**: Connected to the server

## To Dos:
- [ ] Implement error handling for websockets
- [ ] Kick.com login & authentication
- [ ] Sending messages to a chatroom
- [ ] Add streaming and following events
- [ ] Allow usernames instead of channel ids in options
