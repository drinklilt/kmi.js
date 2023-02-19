# kmi.js
 >Javascript library for the Kick Messaing Interface  
 >Heavily influenced by [tmi.js](https://www.npmjs.com/package/tmi.js)

## Install
```$ npm i kmi.js```

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
```
