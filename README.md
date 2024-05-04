# relay
A super-simple WebSocket server that relays messages from a client to all other clients in its room.

## Rooms
Rooms are determined by the HTTP request target of the connecting client.
For example, establishing a connection to `wss://trudeaugamedev-relay.herokuapp.com/happycoolplace/test` will place the client in a room with the name `/happycoolplace/test`.
This client will then only be able to send and receive relayed messages with clients also connected to the `/happycoolplace/test` room.
