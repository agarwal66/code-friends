'use strict';

const socketIO = require('socket.io');
const ot = require('ot');

const roomList = {}; // Store active rooms

module.exports = function (server) {
    const defaultCode = `//Write your code here and collaborate in real time\n
    #include<iostream>
    using namespace std;
    int main()
    {
        string s;
        cin >> s;
        cout << "Holla " << s << endl;
    }`;

    const io = socketIO(server);

    io.on('connection', (socket) => {
        console.log("Client connected:", socket.id);

        socket.on('joinRoom', (data) => {
            if (!roomList[data.room]) {
                // Initialize new OT server for this room
                roomList[data.room] = new ot.EditorSocketIOServer(
                    defaultCode, [], data.room, (socket, cb) => cb(true)
                );
            }

            roomList[data.room].addClient(socket);
            roomList[data.room].setName(socket, data.username);

            socket.room = data.room;
            socket.join(data.room);
            console.log(`User ${data.username} joined room: ${data.room}`);
        });

        socket.on('chatMessage', (data) => {
            if (socket.room) {
                io.to(socket.room).emit('chatMessage', data);
            }
        });

        socket.on('disconnect', () => {
            if (socket.room && roomList[socket.room]) {
                console.log(`User left room: ${socket.room}`);
                socket.leave(socket.room);
            }
        });
    });
};
