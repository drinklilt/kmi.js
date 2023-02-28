const kmi = require("../index");
const client = new kmi.Client({
	connection: {
		secure: true,
		host: "ws-us2.pusher.com/app/eb1d5f283081a78b932c?protocol=7&client=kmi.js&version=7.4.0&flash=false",
	},
	channels: [1088868],
	chatrooms: [1081964],
});

client.connect().catch(console.error);
client.on("debug", (e) => console.log(e));
//client.on("raw_message", (e) => console.log(e));
// client.on("chat", (chatroom, user, message, self) =>
// 	console.log(`${user.username} said ${message.message} in ${chatroom}`)
// );
