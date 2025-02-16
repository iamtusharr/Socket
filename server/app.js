import { Server } from "socket.io";
import express from "express";
import { createServer } from "http";
import cors from "cors";

const server_port = 3001;
const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ['websocket', 'polling']
});

// Track active users in rooms
const activeUsers = new Map();

io.on("connection", (socket) =>
{
    console.log("User Connected With id ==> ", socket.id);

    const roomsWithMembers = {};
    activeUsers.forEach((users, roomName) =>
    {
        roomsWithMembers[roomName] = Array.from(users.values());
    });
    io.emit("rooms_with_members", Object.keys(roomsWithMembers).length ? [roomsWithMembers] : []);

    socket.on("join_room", ({ room, name, joiningTime, profileImage }) =>
    {
        if (room && room.trim() !== "" && name && name.trim() !== "") {
            // Leave previous rooms
            socket.rooms.forEach((r) =>
            {
                if (r !== socket.id) {
                    socket.leave(r);
                }
            });

            socket.join(room);

            // Store the username with the socket ID in the activeUsers map
            if (!activeUsers.has(room)) {
                activeUsers.set(room, new Map());
            }
            activeUsers.get(room).set(socket.id, { socketId: socket.id, userName: name, joiningTime, profileImage });

            socket.emit("room_joined", { room, socketId: socket.id, userName: name, joiningTime, profileImage });

            // Emit to all other users in the room that a new user has joined
            socket.to(room).emit("user_joined", { userName: name, socketId: socket.id, joiningTime, profileImage });

            // Optionally, send the updated list of active users
            const activeUsersList = Array.from(activeUsers.get(room).values());
            io.to(room).emit("active_users_updated", activeUsersList);

            // Emit the room details including all members to all connected sockets
            const roomsWithMembers = {};
            activeUsers.forEach((users, roomName) =>
            {
                roomsWithMembers[roomName] = Array.from(users.values());
            });
            io.emit("rooms_with_members", Object.keys(roomsWithMembers).length ? [roomsWithMembers] : []);

        } else {
            socket.emit("room_error", { message: "Invalid room or username" });
        }
    });

    socket.on("leave_room", ({ room }) =>
    {
        if (room && activeUsers.has(room)) {
            // Get the list of users in the room
            const roomUsers = activeUsers.get(room);

            if (roomUsers.has(socket.id)) {
                const userName = roomUsers.get(socket.id); // Get the user's name from the map

                // Remove the user from the room
                socket.leave(room);

                // Remove the user from the active users map
                roomUsers.delete(socket.id);

                if (roomUsers.size === 0) {
                    activeUsers.delete(room);
                }

                // Emit to all users in the room that the user has left
                socket.to(room).emit("user_left", { socketId: userName.socketId, userName: userName.userName });

                // Optionally, send the updated list of active users
                const activeUsersList = Array.from(roomUsers.values());
                io.to(room).emit("active_users_updated", activeUsersList);

                console.log(`User ${ userName.userName } has left room ${ room }`);

                // Emit the room details including all members to all connected sockets
                const roomsWithMembers = {};
                activeUsers.forEach((users, roomName) =>
                {
                    roomsWithMembers[roomName] = Array.from(users.values());
                });
                console.log("roomsWithMembers ===> ", roomsWithMembers);
                io.emit("rooms_with_members", Object.keys(roomsWithMembers).length ? [roomsWithMembers] : []);
            } else {
                socket.emit("room_error", { message: "You are not in this room" });
            }
        } else {
            socket.emit("room_error", { message: "Room does not exist or you are not in this room" });
        }
    });

    socket.on("msz_send", (data) =>
    {
        console.log("Message send event:", data);
        if (io.sockets.adapter.rooms.has(data.room)) {
            io.to(data.room).emit("msz_received", {
                ...data,
                status: "sent"
            });
        } else {
            socket.emit("message_error", { message: "Failed to send message, invalid room" });
        }
    });

    socket.on("message_delivered", (data) =>
    {
        console.log("Message delivered event:", data);
        // Update status for the sender
        io.to(data.senderId).emit("message_status_update", {
            messageId: data.messageId,
            status: "delivered",
            recipientId: data.recipientId
        });
    });

    socket.on("messages_seen", ({ room, seenBy }) =>
    {
        io.to(room).emit("messages_seen", { room, seenBy });
    });

    socket.on("user_start_typing", ({ name, room, profileImage }) =>
    {
        console.log(`${ name } is typing in room ${ room }`);

        socket.to(room).emit("user_typing", { name, profileImage });
    });

    socket.on("user_stop_typing", ({ name, room, profileImage }) =>
    {
        console.log(`${ name } has stopped typing in room ${ room }`);

        socket.to(room).emit("user_typing_stop", { name, profileImage });
    });

    socket.on("disconnect", () =>
    {
        activeUsers.forEach((users, room) =>
        {
            users.delete(socket.id);
            if (users.size === 0) {
                activeUsers.delete(room);
            }
        });
        console.log("User Disconnected With id ==> ", socket.id);
    });
});

app.use(cors());

app.get("/", (req, res) =>
{
    res.send("Hello World!");
});

server.listen(server_port, () =>
{
    console.log(`Server is running on port ${ server_port }`);
});