import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import { Box, Container, Paper, Typography, Button, Avatar, AppBar, Toolbar, IconButton, List, ListItem, ListItemAvatar, ListItemText, Divider, styled, Chip, Drawer, useTheme, useMediaQuery } from "@mui/material";
import Grow from '@mui/material/Grow';
import { ExitToApp, Menu as MenuIcon, } from "@mui/icons-material";
import CustomSnackbar from "./customSnackBar";
import WishingContainer from "./wishingContainer";
import InputContainer from "./InputContainer";
import ChatRoom from "./ChatRoom";

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
    <Box sx={ { width: isMobile ? 250 : '100%', backgroundColor: '#f9f9f9', borderRadius: 2, boxShadow: 1 } }>
      <Typography variant="h6" sx={ { p: 2, fontWeight: 600, color: '#2C3E50' } }>
        Active Users ({ activeUsers.length })
      </Typography>
      <Divider />
      <List>
        { activeUsers.map((user) => (
          <ListItem
            key={ user.socketId }
            sx={ {
              backgroundColor: user.socketId === socketId ? 'rgba(0, 123, 255, 0.1)' : 'transparent',
              borderRadius: 2,
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                backgroundColor: 'rgba(0, 123, 255, 0.05)',
                transform: 'scale(1.02)', // Subtle scaling effect
              },
            } }
          >
            <ListItemAvatar>
              <Avatar
                src={ user.profileImage || '/default-profile-image.png' }
                sx={ {
                  border: user.socketId === socketId ? '2px solid #3498db' : 'none',
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.1)', // Slight zoom effect on hover
                  },
                } }
              />
            </ListItemAvatar>
            <ListItemText
              primary={
                user.socketId === socketId ? `${ user.userName } (You)` : user.userName
              }
              secondary={ user.joiningTime }
              sx={ {
                fontWeight: user.socketId === socketId ? 'bold' : 'normal',
                color: '#34495e',
              } }
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
          sx={ {
            backgroundColor: '#e74c3c',
            '&:hover': {
              backgroundColor: '#c0392b',
            },
            fontWeight: 600,
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            borderRadius: 2,
            transition: 'all 0.3s ease-in-out',
          } }
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
    }, 500);
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

  function GrowTransition(props)
  {
    return <Grow { ...props } />;
  }

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
        <WishingContainer wishingMessage={ wishingMessage } formattedTime={ formattedTime } />
        { !isInRoom ? (
          <InputContainer
            StyledPaper={ StyledPaper }
            handleProfileImageChange={ handleProfileImageChange }
            profileImage={ profileImage }
            setUserName={ setUserName }
            setRoom={ setRoom }
            handleRoomJoin={ handleRoomJoin }
            userName={ userName }
            room={ room }
            socketRef={ socketRef }
            availableRooms={ availableRooms }
          />
        ) : (
          <ChatRoom
            isMobile={ isMobile }
            UsersList={ UsersList }
            ChatContainer={ ChatContainer }
            room={ room }
            typingUser={ typingUser }
            MessagesContainer={ MessagesContainer }
            messages={ messages }
            MessageBox={ MessageBox }
            socketId={ socketId }
            MessageContent={ MessageContent }
            messagesEndRef={ messagesEndRef }
            message={ message }
            handleChangeMessage={ handleChangeMessage }
            handleSendMessage={ handleSendMessage }
          />
        ) }
      </Container>

      <Drawer
        anchor="left"
        open={ drawerOpen }
        onClose={ () => setDrawerOpen(false) }
      >
        <UsersList />
      </Drawer>

      <CustomSnackbar popupMessage={ popupMessage } setPopupMessage={ setPopupMessage } />
    </Box>
  );
}
export default App;
;
