import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import { Box, Container, Paper, Typography, TextField, Button, Avatar, AppBar, Toolbar, IconButton, Grid, List, ListItem, ListItemAvatar, ListItemText, Divider, Card, CardContent, Snackbar, Alert, Slide, styled, Chip, Badge, Drawer, useTheme, useMediaQuery } from "@mui/material";
import { PhotoCamera, Send, ExitToApp, People, Done, DoneAll, RemoveRedEye, Menu as MenuIcon, } from "@mui/icons-material";
import { Chat, Groups } from '@mui/icons-material';

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
}));

const MessageBox = styled(Box)((props) => ({
    display: 'flex',
    justifyContent: props.isown ? 'flex-end' : 'flex-start',
    marginBottom: props.theme.spacing(2),
}));

const MessageContent = styled(Box)(({ theme, isOwn }) => ({
    maxWidth: '70%', // Ensure the message content box doesn't stretch too wide
    padding: theme.spacing(1.5),
    borderRadius: theme.spacing(2), // Rounded corners
    backgroundColor: isOwn ? theme.palette.primary.main : theme.palette.grey[200], // Different background color for own messages
    color: isOwn ? theme.palette.primary.contrastText : theme.palette.text.primary, // Contrast text color for better readability
    margin: theme.spacing(1), // Added margin for spacing between messages
    alignSelf: isOwn ? 'flex-end' : 'flex-start', // Align messages based on ownership
    wordWrap: 'break-word', // Ensures long text wraps into the next line
}));

const ChatContainer = styled(Box)(({ theme }) => ({
    height: 'calc(100vh - 240px)', // Dynamic height based on viewport
    display: 'flex',
    flexDirection: 'column', // Stack messages vertically
    justifyContent: 'flex-start', // Align items from the top
    overflowY: 'auto', // Make chat scrollable
    padding: theme.spacing(2), // Added padding inside the container
}));


const MessagesContainer = styled(Box)(({ theme }) => ({
    flexGrow: 1,
    overflow: 'auto',
    padding: theme.spacing(2),
}));

function App()
{
    const [message, setMessage] = useState("");
    const [room, setRoom] = useState("");
    const [messages, setMessages] = useState([]);
    const [socketId, setSocketId] = useState("");
    const [isInRoom, setIsInRoom] = useState(false);
    const [userName, setUserName] = useState("");
    const [currentTime, setCurrentTime] = useState(new Date());
    const [wishingMessage, setWishingMessage] = useState('');
    const [activeUsers, setActiveUsers] = useState([]);
    const [popupMessage, setPopupMessage] = useState();
    const [profileImage, setProfileImage] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const socketRef = useRef(null);
    const messagesEndRef = useRef(null);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [availableRooms, setAvailableRooms] = useState([]);
    const isTyping = useRef(false);
    const stopTypingTimer = useRef(null);
    const [typingUser, setTypingUser] = useState({
        name: "",
        profileImage: "",
    });

    useEffect(() =>
    {
        const timer = setInterval(() =>
        {
            setCurrentTime(new Date());
        }, 1000);

        // Clear interval on component unmount
        return () => clearInterval(timer);
    }, []);

    useEffect(() =>
    {
        const hour = currentTime.getHours();
        let greeting = 'Good Morning';

        if (hour >= 12 && hour < 18) {
            greeting = 'Good Afternoon';
        } else if (hour >= 18) {
            greeting = 'Good Evening';
        }

        setWishingMessage(greeting);
    }, [currentTime, userName]);

    const formattedTime = currentTime.toLocaleTimeString(); // Format time as HH:MM:SS

    useEffect(() =>
    {
        socketRef.current = io("http://localhost:3001", {
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            timeout: 10000,
            transports: ['websocket', 'polling']
        });

        const socket = socketRef.current;

        socket.on("connect", () =>
        {
            setSocketId(socket.id);
            console.log("Connected to the server, Socket ID:", socket.id);
        });

        socket.on("disconnect", (reason) =>
        {
            console.log("Disconnected from the server. Reason:", reason);
            setIsInRoom(false);
        });

        socket.on("room_joined", (data) =>
        {
            console.log(`Successfully joined room: ${ data.room }`);
            if (data.userName) {
                setActiveUsers((prev) => [...prev, { socketId: data.socketId, userName: data.userName }]);
            }
            setIsInRoom(true);
        });

        socket.on("user_joined", ({ userName, socketId }) =>
        {
            console.log(`User ${ userName } joined the room`);
            if (socketId !== socket.id) {
                setPopupMessage(`User ${ userName } joined the room`);
            }
        });


        socket.on("user_left", ({ socketId, userName }) =>
        {
            console.log(`User ${ userName } has left the room`);
            if (socketId !== socket.id) {
                setPopupMessage(`User ${ userName } has left the room`);
            }
        });


        socket.on("active_users_updated", (activeUsersList) =>
        {
            setActiveUsers(activeUsersList);
        });

        socket.on("rooms_with_members", (roomsWithMembers) =>
        {
            console.log("roomsWithMembers ===> ", roomsWithMembers);
            setAvailableRooms(roomsWithMembers);
        });

        socket.on("msz_received", (data) =>
        {
            console.log("Received message:", data);
            if (data.senderId !== socket.id) {
                // Only emit delivery confirmation for messages from others
                socket.emit("message_delivered", {
                    messageId: data.messageId,
                    room: data.room,
                    recipientId: socket.id,
                    senderId: data.senderId,
                    senderName: data.senderName
                });
            }

            setMessages(prev =>
            {
                if (!prev.some(msg => msg.messageId === data.messageId)) {
                    return [...prev, data];
                }
                return prev;
            });
        });

        socket.on("message_status_update", (data) =>
        {
            console.log("Status update received:", data);
            setMessages(prev => prev.map(msg =>
                msg.messageId === data.messageId
                    ? { ...msg, status: data.status }
                    : msg
            ));
        });

        socket.on("user_typing", ({ name, profileImage }) =>
        {
            console.log(`${ name } is typing...`);
            setTypingUser({ name, profileImage });
        });

        socket.on("user_typing_stop", ({ name, profileImage }) =>
        {
            console.log(`${ name } has stopped typing...`);
            setTypingUser({ name: "", profileImage: "" });
        });

        socket.on("messages_seen", ({ room, seenBy }) =>
        {
            setMessages(prev => prev.map(msg =>
                msg.room === room && msg.senderId !== seenBy
                    ? { ...msg, status: "seen" }
                    : msg
            ));
        });

        const handleVisibilityChange = () =>
        {
            if (document.visibilityState === 'visible' && isInRoom) {
                socket.emit("messages_seen", { room, seenBy: socket.id });
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () =>
        {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            if (socket) {
                socket.removeAllListeners();
                socket.close();
            }
        };
    }, []);

    const scrollToBottom = () =>
    {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() =>
    {
        scrollToBottom();
    }, [messages]);

    const UsersList = () => (
        <Box sx={ { width: isMobile ? 250 : '100%' } }>
            <Typography variant="h6" sx={ { p: 2 } }>
                Active Users ({ activeUsers.length })
            </Typography>
            <Divider />
            <List>
                { activeUsers.map((user) => (
                    <ListItem
                        key={ user.socketId }
                        sx={ {
                            backgroundColor: user.socketId === socketId ? 'rgba(0, 123, 255, 0.1)' : 'transparent', // Highlight row if it's the current user
                            borderRadius: 1, // Optionally add rounded corners
                        } }
                    >
                        <ListItemAvatar>
                            <Avatar
                                src={ user.profileImage || '/default-profile-image.png' }
                                sx={ {
                                    border: user.socketId === socketId ? '2px solid blue' : 'none', // Optional: Add a border for current user
                                } }
                            />
                        </ListItemAvatar>
                        <ListItemText
                            primary={
                                user.socketId === socketId ? `${ user.userName }(You)` : user.userName // Display "You" for current user
                            }
                            secondary={ user.joiningTime }
                        />
                    </ListItem>
                )) }

            </List>
            <Box sx={ { p: 2 } }>
                <Button
                    fullWidth
                    variant="contained"
                    color="error"
                    startIcon={ <ExitToApp /> }
                    onClick={ handleLeaveRoom }
                >
                    Leave Room
                </Button>
            </Box>
        </Box>
    );

    const handleSendMessage = (event) =>
    {
        event.preventDefault();
        if (message.trim() && isInRoom && socketRef.current?.connected) {
            const messageId = uuidv4();
            const messageData = {
                senderName: userName,
                profileImage: profileImage,
                messageId,
                message: message.trim(),
                room,
                senderId: socketRef.current.id,
                time: new Date().toLocaleTimeString(),
                status: "sent",
            };

            socketRef.current.emit("msz_send", messageData);
            setMessages(prev => [...prev, messageData]);
            setMessage("");
        }
    };

    const handleRoomJoin = () =>
    {
        if (room.trim() && socketRef.current?.connected) {
            console.log("Joining room:", room);
            socketRef.current.emit("join_room", { room, name: userName, joiningTime: new Date().toLocaleTimeString(), profileImage });
        }
        setPopupMessage(`You joined the room ${ room }`);
    };

    const handleLeaveRoom = () =>
    {
        console.log("Leaving room...");
        if (socketRef.current?.connected && room.trim()) {
            console.log("Leaving room...");
            socketRef.current.emit("leave_room", { room });
            setIsInRoom(false);
            setRoom("");
            setMessages([]);
            setActiveUsers([]);
            setProfileImage(null);
            setUserName("");
            setPopupMessage(`You left the room ${ room }`);
        }
    };

    const handleProfileImageChange = (event) =>
    {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () =>
            {
                setProfileImage(reader.result); // Store the image URL in state
            };
            reader.readAsDataURL(file); // Convert the image to base64 URL
        }
    };

    const timerRef = useRef(null);

    const stopTyping = () =>
    {
        timerRef.current = setTimeout(() =>
        {
            if (isTyping.current) {
                console.log(("Stopping Called..........."));
                socketRef.current.emit("user_stop_typing", { name: userName, room, profileImage });
                isTyping.current = false;
            }
        }, 1000);
    };

    const handleChangeMessage = (event) =>
    {
        timerRef.current && clearTimeout(timerRef.current);
        const value = event.target.value;
        setMessage(value);

        if (!isTyping.current) {
            console.log("user_start_typing Emitting................");
            socketRef.current.emit("user_start_typing", { name: userName, room, profileImage });
            console.log("user_start_typing done............");
            isTyping.current = true;
        }
        stopTyping();

    };

    useEffect(() =>
    {
        // Cleanup debounce on component unmount
        return () => stopTyping.cancel();
    }, []);

    const ChatHeader = ({ room, typingUser }) =>
    {
        const theme = useTheme();

        return (
            <Card
                elevation={ 2 }
                sx={ {
                    mb: 2,
                    background: theme.palette.mode === 'light'
                        ? 'linear-gradient(to right, #f8fafc, #ffffff)'
                        : 'linear-gradient(to right, #1e293b, #0f172a)',
                } }
            >
                <CardContent sx={ { p: 2 } }>
                    <Box
                        sx={ {
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        } }
                    >
                        {/* Room Information */ }
                        <Box sx={ { display: 'flex', alignItems: 'center', gap: 2 } }>
                            <Box
                                sx={ {
                                    p: 1,
                                    borderRadius: '50%',
                                    bgcolor: theme.palette.primary.light,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                } }
                            >
                                <Chat sx={ { color: theme.palette.primary.main } } />
                            </Box>

                            <Box>
                                <Box sx={ { display: 'flex', alignItems: 'center', gap: 1 } }>
                                    <Typography variant="h6" sx={ { fontWeight: 'bold' } }>
                                        Room
                                    </Typography>
                                    <Box
                                        sx={ {
                                            px: 1,
                                            py: 0.5,
                                            bgcolor: theme.palette.grey[100],
                                            borderRadius: 1,
                                            fontSize: '0.875rem',
                                        } }
                                    >
                                        { room }
                                    </Box>
                                </Box>
                                <Box sx={ { display: 'flex', alignItems: 'center', gap: 0.5 } }>
                                    <Groups sx={ { fontSize: '1rem', color: theme.palette.text.secondary } } />
                                    <Typography variant="body2" color="text.secondary">
                                        Active Discussion
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>

                        {/* Typing Indicator */ }
                        { typingUser?.name && (
                            <Box
                                sx={ {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    px: 2,
                                    py: 0.75,
                                    borderRadius: 'full',
                                    bgcolor: theme.palette.grey[100],
                                    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                                    '@keyframes pulse': {
                                        '0%, 100%': {
                                            opacity: 1,
                                        },
                                        '50%': {
                                            opacity: 0.7,
                                        },
                                    },
                                } }
                            >
                                <Avatar
                                    src={ typingUser.profileImage }
                                    sx={ {
                                        width: 24,
                                        height: 24,
                                        border: `2px solid ${ theme.palette.primary.main }`,
                                    } }
                                >
                                    { typingUser.name.charAt(0).toUpperCase() }
                                </Avatar>
                                <Typography
                                    variant="body2"
                                    sx={ {
                                        color: theme.palette.text.secondary,
                                        fontWeight: 500,
                                    } }
                                >
                                    { typingUser.name } is typing...
                                </Typography>
                            </Box>
                        ) }
                    </Box>
                </CardContent>
            </Card>
        );
    };

    return (
        <Box sx={ { flexGrow: 1 } }>
            <AppBar position="static" color="primary">
                <Toolbar>
                    { isInRoom && isMobile && (
                        <IconButton
                            color="inherit"
                            edge="start"
                            onClick={ () => setDrawerOpen(true) }
                            sx={ { mr: 2 } }
                        >
                            <MenuIcon />
                        </IconButton>
                    ) }
                    <Typography variant="h6" component="div" sx={ { flexGrow: 1 } }>
                        Panchayat
                    </Typography>
                    <Chip
                        label={ socketRef.current?.connected ? 'Connected' : 'Disconnected' }
                        color={ socketRef.current?.connected ? 'success' : 'error' }
                        size="small"
                    />
                </Toolbar>
            </AppBar>

            <Container maxWidth="lg" sx={ { mt: 3 } }>
                <Box
                    sx={ {
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        width: '100%',
                        px: 2,
                        py: 1,
                    } }
                >
                    {/* Wishing message on the left */ }
                    <Typography
                        variant="h6"
                        sx={ {
                            fontWeight: 'bold',
                            color: 'primary.main',
                            letterSpacing: '0.8px',
                            textTransform: 'capitalize',
                            fontSize: '1.2rem',
                        } }
                    >
                        { wishingMessage }
                    </Typography>

                    {/* Current time on the right */ }
                    <Typography
                        variant="body2"
                        sx={ {
                            fontStyle: 'italic',
                            color: 'text.secondary',
                            fontSize: '1.1rem', // Slightly larger font size for better visibility
                            letterSpacing: '0.5px', // Adds spacing between letters for a more elegant look
                            backgroundColor: 'rgba(255, 255, 255, 0.2)', // Subtle background for contrast
                            padding: '0.5rem', // Adds some padding around the text for better spacing
                            borderRadius: '5px', // Rounds the corners of the background
                            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)', // Adds a soft shadow for depth
                            textAlign: 'center', // Centers the text
                        } }
                    >
                        Time: { formattedTime }
                    </Typography>
                </Box>
                { !isInRoom ? (
                    <StyledPaper elevation={ 3 }>
                        <Typography variant="h5" gutterBottom>
                            Join a Room
                        </Typography>
                        <Grid container spacing={ 3 } alignItems="center">
                            <Grid item xs={ 12 } md={ 4 }>
                                <Box sx={ { textAlign: 'center' } }>
                                    <Badge
                                        overlap="circular"
                                        anchorOrigin={ { vertical: 'bottom', horizontal: 'right' } }
                                        badgeContent={
                                            <IconButton
                                                color="primary"
                                                component="label"
                                                sx={ {
                                                    bgcolor: 'background.paper',
                                                    '&:hover': { bgcolor: 'background.paper' },
                                                } }
                                            >
                                                <PhotoCamera />
                                                <input
                                                    hidden
                                                    accept="image/*"
                                                    type="file"
                                                    onChange={ handleProfileImageChange }
                                                />
                                            </IconButton>
                                        }
                                    >
                                        <Avatar src={ profileImage } sx={ { width: 100, height: 100 } } />
                                    </Badge>
                                </Box>
                            </Grid>
                            <Grid item xs={ 12 } md={ 8 }>
                                <Box sx={ { display: 'flex', flexDirection: 'column', gap: 2 } }>
                                    <TextField
                                        fullWidth
                                        label="Your Name"
                                        value={ userName }
                                        onChange={ (e) => setUserName(e.target.value) }
                                    />
                                    <TextField
                                        fullWidth
                                        label="Room Name"
                                        value={ room }
                                        onChange={ (e) => setRoom(e.target.value) }
                                    />
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        onClick={ handleRoomJoin }
                                        disabled={ !socketRef.current?.connected || !room.trim() || !userName || !profileImage }
                                    >
                                        Join Room
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>

                        <Divider sx={ { my: 3 } } />

                        <Box sx={ { mt: 4 } }>
                            <Typography
                                variant="h5"
                                gutterBottom
                                sx={ {
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    fontWeight: 600,
                                    mb: 3
                                } }
                            >
                                <People />
                                Available Rooms
                            </Typography>

                            { availableRooms.length > 0 ? (
                                availableRooms.map((room, index) =>
                                {
                                    const roomKeys = Object.keys(room); // Get all the keys of the room object

                                    return roomKeys.map((roomId) =>
                                    {
                                        const roomDetails = room[roomId]; // Get the details for each key

                                        return (
                                            <Grid item xs={ 12 } md={ 6 } key={ roomId + index }>
                                                <Card
                                                    sx={ {
                                                        height: '100%',
                                                        transition: 'transform 0.2s, box-shadow 0.2s',
                                                        '&:hover': {
                                                            transform: 'translateY(-4px)',
                                                            boxShadow: (theme) => theme.shadows[8],
                                                        },
                                                    } }
                                                >
                                                    <CardContent>
                                                        <Box sx={ {
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'flex-start',
                                                            mb: 2
                                                        } }>
                                                            <Box>
                                                                <Typography variant="h6" sx={ { fontWeight: 600 } }>
                                                                    { roomId }
                                                                </Typography>
                                                                <Chip
                                                                    label={ `${ roomDetails.length } ${ roomDetails.length === 1 ? 'member' : 'members' }` }
                                                                    size="small"
                                                                    color="primary"
                                                                    sx={ { mt: 1 } }
                                                                />
                                                            </Box>
                                                            <Button
                                                                variant="contained"
                                                                size="small"
                                                                onClick={ () =>
                                                                {
                                                                    setRoom(roomId);
                                                                    // handleRoomJoin();
                                                                } }
                                                                startIcon={ <ExitToApp /> }
                                                                sx={ {
                                                                    borderRadius: '20px',
                                                                    textTransform: 'none',
                                                                } }
                                                            >
                                                                Join Room
                                                            </Button>
                                                        </Box>

                                                        <Divider sx={ { my: 2 } } />

                                                        <Box sx={ { maxHeight: '200px', overflowY: 'auto' } }>
                                                            <Grid container spacing={ 1 }>
                                                                { roomDetails.map((member) => (
                                                                    <Grid item xs={ 12 } sm={ 6 } key={ member.socketId }>
                                                                        <Paper
                                                                            elevation={ 0 }
                                                                            sx={ {
                                                                                p: 1,
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                gap: 1,
                                                                                bgcolor: 'background.default',
                                                                                '&:hover': {
                                                                                    bgcolor: 'action.hover',
                                                                                },
                                                                            } }
                                                                        >
                                                                            <Badge
                                                                                overlap="circular"
                                                                                anchorOrigin={ { vertical: 'bottom', horizontal: 'right' } }
                                                                                badgeContent={
                                                                                    <Box
                                                                                        sx={ {
                                                                                            width: 8,
                                                                                            height: 8,
                                                                                            bgcolor: 'success.main',
                                                                                            borderRadius: '50%',
                                                                                            border: '2px solid white',
                                                                                        } }
                                                                                    />
                                                                                }
                                                                            >
                                                                                <Avatar
                                                                                    src={ member.profileImage || '/api/placeholder/32/32' }
                                                                                    alt={ member.userName }
                                                                                    sx={ {
                                                                                        width: 40,
                                                                                        height: 40,
                                                                                        border: '2px solid',
                                                                                        borderColor: 'primary.main',
                                                                                    } }
                                                                                />
                                                                            </Badge>
                                                                            <Box sx={ { minWidth: 0 } }>
                                                                                <Typography
                                                                                    variant="body2"
                                                                                    noWrap
                                                                                    sx={ { fontWeight: 500 } }
                                                                                >
                                                                                    { member.userName }
                                                                                </Typography>
                                                                                <Typography
                                                                                    variant="caption"
                                                                                    color="text.secondary"
                                                                                    noWrap
                                                                                >
                                                                                    Joined: { member.joiningTime }
                                                                                </Typography>
                                                                            </Box>
                                                                        </Paper>
                                                                    </Grid>
                                                                )) }
                                                            </Grid>
                                                        </Box>
                                                    </CardContent>
                                                </Card>
                                            </Grid>
                                        );
                                    });
                                })
                            ) : (
                                <Grid item xs={ 12 }>
                                    <Card sx={ { p: 4, textAlign: 'center' } }>
                                        <Typography variant="h6" color="text.secondary" gutterBottom>
                                            No Rooms Available
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Create a new room to start chatting!
                                        </Typography>
                                    </Card>
                                </Grid>
                            ) }
                        </Box>
                    </StyledPaper>
                ) : (
                    <Grid container spacing={ 3 }>
                        { !isMobile && (
                            <Grid item xs={ 12 } md={ 3 }>
                                <Card>
                                    <UsersList />
                                </Card>
                            </Grid>
                        ) }
                        <Grid item xs={ 12 } md={ 9 }>
                            <Card>
                                <ChatContainer>
                                    {/* Header Section */ }
                                    <Box
                                        sx={ {
                                            p: 2,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            bgcolor: '#283593', // Dark indigo background for strong contrast
                                            borderRadius: 2,
                                            color: 'white', // Ensures text is clearly visible
                                            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.3)', // Soft shadow for depth
                                            mb: 2,
                                        } }
                                    >
                                        {/* Room Info */ }
                                        <Box
                                            sx={ {
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 2,
                                            } }
                                        >
                                            <Typography
                                                variant="h5"
                                                sx={ {
                                                    fontWeight: 'bold',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: 1,
                                                } }
                                            >
                                                Room: { room }
                                            </Typography>
                                            <Chip
                                                label="Active"
                                                size="small"
                                                sx={ {
                                                    fontWeight: 'bold',
                                                    textTransform: 'uppercase',
                                                    bgcolor: '#4caf50', // Bright green for visibility
                                                    color: 'white',
                                                } }
                                            />
                                        </Box>

                                        {/* Typing Indicator */ }
                                        { typingUser.name && typingUser.profileImage && (
                                            <Box
                                                sx={ {
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 1.5,
                                                    px: 3,
                                                    py: 1.5,
                                                    borderRadius: 2,
                                                    bgcolor: 'rgba(255, 255, 255, 0.2)', // Subtle light background with more contrast
                                                    boxShadow: 'inset 0px 4px 6px rgba(0, 0, 0, 0.1)', // Slightly stronger inner shadow
                                                    maxWidth: '80%', // Ensure it doesn't stretch too far across the screen
                                                    margin: '0 auto', // Center the typing indicator box
                                                } }
                                            >
                                                <Avatar
                                                    src={ typingUser.profileImage }
                                                    sx={ {
                                                        width: 40,
                                                        height: 40,
                                                        border: '2px solid #fff', // White border for better contrast
                                                        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.3)', // Add a slight shadow for better depth
                                                    } }
                                                />
                                                <Typography
                                                    variant="body2"
                                                    sx={ {
                                                        fontStyle: 'italic',
                                                        color: '#fff',
                                                        fontWeight: 'light', // Lighter weight for less emphasis
                                                        letterSpacing: 0.5, // Add slight letter spacing for readability
                                                    } }
                                                >
                                                    { typingUser.name } is typing...
                                                </Typography>
                                            </Box>
                                        ) }

                                    </Box>
                                    <Divider />

                                    {/* Messages Section */ }
                                    <MessagesContainer>
                                        { messages.map((msg) =>
                                        {
                                            const isOwn = msg.senderId === socketId;
                                            return (
                                                <MessageBox key={ msg.messageId } isown={ isOwn ? 1 : 0 }>
                                                    <Box
                                                        sx={ {
                                                            display: 'flex',
                                                            alignItems: 'flex-end',
                                                            gap: 1,
                                                        } }
                                                    >
                                                        { !isOwn && (
                                                            <Avatar src={ msg.profileImage } sx={ { width: 32, height: 32 } } />
                                                        ) }
                                                        <MessageContent isown={ isOwn ? 1 : 0 }>
                                                            <Typography
                                                                variant="subtitle2"
                                                                sx={ {
                                                                    fontWeight: 'bold',
                                                                    color: isOwn ? 'primary.main' : 'text.primary',
                                                                } }
                                                            >
                                                                { isOwn ? 'You' : msg.senderName }
                                                            </Typography>
                                                            <Typography>{ msg.message }</Typography>
                                                            <Box
                                                                sx={ {
                                                                    display: 'flex',
                                                                    justifyContent: 'flex-end',
                                                                    gap: 1,
                                                                    mt: 0.5,
                                                                } }
                                                            >
                                                                <Typography variant="caption" color="textSecondary">
                                                                    { msg.time }
                                                                </Typography>
                                                                { isOwn && (
                                                                    <Box component="span">
                                                                        { msg.status === 'sent' && <Done fontSize="small" /> }
                                                                        { msg.status === 'delivered' && <DoneAll fontSize="small" /> }
                                                                        { msg.status === 'seen' && (
                                                                            <RemoveRedEye fontSize="small" />
                                                                        ) }
                                                                    </Box>
                                                                ) }
                                                            </Box>
                                                        </MessageContent>
                                                        { isOwn && (
                                                            <Avatar src={ msg.profileImage } sx={ { width: 32, height: 32 } } />
                                                        ) }
                                                    </Box>
                                                </MessageBox>
                                            );
                                        }) }
                                        <div ref={ messagesEndRef } />
                                    </MessagesContainer>

                                    <Divider />

                                    {/* Input Section */ }
                                    <Box
                                        sx={ {
                                            p: 2,
                                            bgcolor: 'background.paper',
                                            borderRadius: 2,
                                            boxShadow: 3,
                                        } }
                                    >
                                        <Grid container spacing={ 2 } alignItems="center">
                                            <Grid item xs>
                                                <TextField
                                                    fullWidth
                                                    placeholder="Type a message"
                                                    value={ message }
                                                    onChange={ (e) => handleChangeMessage(e) }
                                                    onKeyPress={ (e) =>
                                                    {
                                                        if (e.key === 'Enter') {
                                                            handleSendMessage(e);
                                                        }
                                                    } }
                                                />
                                            </Grid>
                                            <Grid item>
                                                <Button
                                                    variant="contained"
                                                    endIcon={ <Send /> }
                                                    onClick={ handleSendMessage }
                                                    disabled={ !message.trim() }
                                                >
                                                    Send
                                                </Button>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                </ChatContainer>




                            </Card>
                        </Grid>
                    </Grid>
                ) }
            </Container>

            <Drawer
                anchor="left"
                open={ drawerOpen }
                onClose={ () => setDrawerOpen(false) }
            >
                <UsersList />
            </Drawer>

            <Snackbar
                open={ Boolean(popupMessage) }
                autoHideDuration={ 5000 }
                onClose={ () => setPopupMessage(null) }
                anchorOrigin={ { vertical: 'top', horizontal: 'right' } }
                TransitionComponent={ Slide }
            >
                <Alert
                    onClose={ () => setPopupMessage(null) }
                    severity="info"
                    sx={ { width: '100%' } }
                >
                    { popupMessage }
                </Alert>
            </Snackbar>
        </Box>
    );



}

export default App;
;
