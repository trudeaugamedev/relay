const {WebSocketServer} = require("ws");

const wss = new WebSocketServer({port: parseInt(process.env.PORT, 10) || 3000});

let nextId = 0;
// Map number to Client objects
const clients = new Map();
// Map string to array of Client objects
const rooms = new Map();

class Client {
	constructor(socket, id, roomId) {
		this.socket = socket;
		this.id = id;
		this.roomId = roomId;
		this.isAlive = true;
	}

	send(data) {
		this.socket.send(data, {binary: false}, (error) => {
			if (error) {
				console.log(`Message send to client ${this.id} (in ${this.roomId}) failed`, data, error);
			}
		});
	}

	ping() {
		if (!this.isAlive) {
			this.socket.terminate();
			return;
		}
		this.isAlive = false;
		this.socket.ping((error) => {
			if (error) {
				console.log(`Ping to client ${this.id} (in ${this.roomId}) failed`, error);
			}
		});
	}
}

wss.on("connection", (socket, request) => {
	const client = new Client(socket, nextId++, request.url);
	clients.set(client.id, client);
	if (!rooms.has(client.roomId)) {
		rooms.set(client.roomId, []);
	}
	rooms.get(client.roomId).push(client);

	socket.on("error", (error) => {
		console.error(error);
	});
	socket.on("message", (message) => {
		for (const other of rooms.get(client.roomId)) {
			if (other === client) {
				continue;
			}
			other.send(message);
		}
	});
	const pingInterval = setTimeout(() => client.ping(), 30000);
	socket.on("pong", () => {
		client.isAlive = true;
	});
	socket.on("close", (code, reason) => {
		socket.close();
		clients.delete(client.id);
		const index = rooms.get(client.roomId).indexOf(client);
		if (index !== -1) {
			rooms.get(client.roomId).splice(index, 1);
		}
		clearInterval(pingInterval);

		console.log(`Client ${client.id} disconnected (from room ${client.roomId})`, code, reason.toString());
		console.log(`${clients.size} clients connected`);
	});

	console.log(`Client ${client.id} connected to room ${client.roomId}`);
	console.log(`${clients.size} clients connected`);
});
