const EventEmitter = require("events").EventEmitter;
const WebSocket = require("ws").WebSocket;

class Client extends EventEmitter {
	constructor(options) {
		super();
		this.options = options ?? {};

		// Defaults to the host that I know works
		this.options.connection.host =
			this.options.connection.host ??
			"ws-us2.pusher.com/app/eb1d5f283081a78b932c?protocol=7&client=kmi.js&version=7.4.0&flash=false";

		// Defaults to secure connection
		this.options.connection.secure = this.options.connection.secure ?? true;

		// Debug thing because reasons I guess
		this.log = (message) => {
			this.emit("debug", message);
		};
	}

	connect() {
		return new Promise((resolve, reject) => {
			this._openConnection();
		});
	}

	// Opens a connection to the ws server
	_openConnection() {
		const url = `${this.options.connection.secure ? "wss" : "ws"}://${this.options.connection.host}`;

		// TODO: Add user agent support

		this.ws = new WebSocket(url);

		this.ws.onmessage = this._onMessage.bind(this);
		this.ws.onopen = this._onOpen.bind(this);
		this.ws.onclose = this._onClose.bind(this);
		this.ws.onerror = this._onError.bind(this);
	}

	_onMessage(event) {
		const message = JSON.parse(event.data.trim());
		if (message) {
			this.handleMessage(message);
		}
	}

	_onOpen(event) {
		if (!this._isConnected()) {
			return;
		}
		this.log(`Connecting to ${this.options.connection.host}`);
		this.emit("connecting", this.options.connection.host);
	}

	// TODO: Implement on close event
	_onClose(event) {
		console.log(event);
	}

	// TODO: Implement on error event
	_onError(event) {
		console.log(event);
	}

	handleMessage(chat) {
		if (!chat) return;
		if (this.listenerCount("raw_message")) this.emit("raw_message", JSON.stringify(chat));

		switch (chat.event) {
			// Connected to server
			case "pusher:connection_established":
				this.log(`Connection established. Socket ID ${JSON.parse(chat.data).socket_id}`);
				this.emit("connected", this.options.connection.host);

				// Join all the channels fron the options
				// TODO: Allow for differnt interval timings (https://github.com/tmijs/tmi.js/blob/main/lib/ClientBase.js#L183)
				let channelIndex = 0;
				const channelLoop = setInterval(() => {
					if (channelIndex === this.options.channels.length - 1) clearInterval(channelLoop);
					this.ws.send(
						`{"event":"pusher:subscribe","data":{"auth":"","channel":"channel.${this.options.channels[channelIndex]}"}}`
					);
					channelIndex++;
				}, 1000);

				let chatroomIndex = 0;
				const chatroomLoop = setInterval(() => {
					if (chatroomIndex === this.options.channels.length - 1) clearInterval(chatroomLoop);
					this.ws.send(
						`{"event":"pusher:subscribe","data":{"auth":"","channel":"chatrooms.${this.options.chatrooms[chatroomIndex]}"}}`
					);
					chatroomIndex++;
				}, 1000);
				break;

			// When the subscription has succeeded
			case "pusher_internal:subscription_succeeded":
				this.log(`Subscription succeeded for ${chat.channel}`);
				break;

			// Reply to a ping request
			case "pusher:ping":
				this.ws.send(`{"event":"pusher:pong","data":"{}"}`);
				this.log(`Sent ping response to ${this.options.connection.host}`);
				break;

			// When a message is sent to a chatroom
			case "App\\Events\\ChatMessageSentEvent":
				chat.data = JSON.parse(chat.data);
				const channel = chat.channel;
				const user = chat.data.user;
				const message = chat.data.message;
				const self = chat.data.user.id == this.user_id ? true : false;
				this._emits(["chat"], [[channel, user, message, self]]);
				break;

			case "App\\Events\\ChatMessageReact":
				chat.data = JSON.parse(chat.data);
				break;
			default:
				console.log("Unknown event!");
				console.dir(chat);
		}
	}

	_emits(types, values) {
		for (let i = 0; i < types.length; i++) {
			const val = i < values.length ? values[i] : values[values.length - 1];
			this.emit(types[i], ...val);
		}
	}

	_isConnected() {
		return this.ws !== null && this.ws.readyState === 1;
	}
}

module.exports = Client;
