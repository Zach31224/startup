const { WebSocketServer } = require('ws');
const { WebSocket } = require('ws');

function peerProxy(httpServer) {
  const socketServer = new WebSocketServer({ noServer: true });

  httpServer.on('upgrade', (request, socket, head) => {
    socketServer.handleUpgrade(request, socket, head, function done(ws) {
      socketServer.emit('connection', ws, request);
    });
  });

  let connections = [];

  socketServer.on('connection', (ws) => {
    const connection = { id: connections.length + 1, alive: true, ws: ws };
    connections.push(connection);

    ws.on('message', function message(data) {
      const msg = JSON.parse(data.toString());
      console.log('WebSocket message received:', msg);
      
      connections.forEach((c) => {
        if (c.id !== connection.id) {
          c.ws.send(JSON.stringify(msg));
        }
      });
    });

    ws.on('close', () => {
      const pos = connections.findIndex((o, i) => o.id === connection.id);

      if (pos >= 0) {
        connections.splice(pos, 1);
      }
    });

    ws.on('pong', () => {
      connection.alive = true;
    });
  });

  setInterval(() => {
    connections.forEach((c) => {
      if (!c.alive) {
        c.ws.terminate();
      } else {
        c.alive = false;
        c.ws.ping();
      }
    });
  }, 10000);
}

module.exports = { peerProxy };
