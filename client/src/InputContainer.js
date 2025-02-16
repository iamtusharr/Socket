import React from "react";
import { ExitToApp, People, PhotoCamera } from "@mui/icons-material";
import { Avatar, Badge, Box, Button, Card, CardContent, Chip, Divider, Grid, IconButton, Paper, TextField, Typography } from "@mui/material";
import { styled, createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

// Light theme configuration with subtle contrasts
const theme = createTheme({
    palette: {
        primary: {
            main: "#4caf50", // Soft green for primary color
            contrastText: "#fff",
        },
        secondary: {
            main: "#03a9f4", // Cool blue for secondary accents
            contrastText: "#fff",
        },
        background: {
            default: "#f8f9fa", // Very light background for cleanliness
            paper: "#ffffff", // White paper-like background for components
        },
        text: {
            primary: "#333333", // Dark text for readability
            secondary: "#7f8c8d", // Lighter gray for secondary text
        },
    },
    typography: {
        fontFamily: '"Roboto", sans-serif', // Clean and modern font family
    },
    shape: {
        borderRadius: 8, // Softer corners for modern look
    },
    spacing: 8, // Consistent spacing for elements
});

// Custom Styled Components for Simplified UI
const StyledButton = styled(Button)(({ theme }) => ({
    background: `linear-gradient(45deg, ${ theme.palette.primary.main }, ${ theme.palette.secondary.main })`,
    color: theme.palette.common.white,
    borderRadius: "30px", // Slightly more rounded corners
    padding: "12px 30px", // Adjusted padding for a better balance
    fontWeight: 600,
    textTransform: "none",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.12)", // Lighter box shadow for soft depth
    transition: "background 0.3s, transform 0.3s, box-shadow 0.3s ease-in-out",
    "&:hover": {
        background: `linear-gradient(45deg, ${ theme.palette.secondary.main }, ${ theme.palette.primary.main })`, // Inverted gradient for hover
        transform: "scale(1.02)", // Slight scale effect
        boxShadow: "0 6px 20px rgba(0, 0, 0, 0.15)", // More prominent shadow on hover
    },
    "&:disabled": {
        background: `${ theme.palette.secondary.main }80`, // Softer background for disabled state
        cursor: "not-allowed",
        opacity: 0.6, // Clearer indication of disabled state
    },
}));

const InputField = styled(TextField)(({ theme }) => ({
    background: "#f0f0f0",
    borderRadius: 8,
    "& .MuiOutlinedInput-root": {
        borderRadius: 8,
        "& fieldset": {
            borderColor: theme.palette.primary.main,
        },
        "&:hover fieldset": {
            borderColor: theme.palette.primary.main,
        },
        "&.Mui-focused fieldset": {
            borderColor: theme.palette.secondary.main,
        },
    },
    "& .MuiInputLabel-root": {
        color: theme.palette.primary.main,
        fontWeight: 500,
    },
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    borderRadius: 12,
    background: theme.palette.background.paper,
    boxShadow: "0 6px 15px rgba(0, 0, 0, 0.1)",
    transition: "all 0.3s ease",
    "&:hover": {
        boxShadow: "0 8px 20px rgba(0, 0, 0, 0.2)",
    },
}));

const RoomCard = styled(Card)(({ theme }) => ({
    background: "#ffffff",
    borderRadius: 12,
    boxShadow: "0 6px 16px rgba(0, 0, 0, 0.1)",
    transition: "transform 0.3s, box-shadow 0.3s",
    "&:hover": {
        transform: "scale(1.03)",
        boxShadow: theme.shadows[4],
    },
}));

const JoiningText = ({ children, fontSize = "3rem", letterSpacing = "2px", textShadow = "0px 4px 6px rgba(0, 0, 0, 0.2)" }) =>
{
    return (
        <Typography
            variant="h3"
            sx={ {
                fontWeight: 700,
                textAlign: "center",
                color: "transparent", // Text will be filled with gradient
                background: "linear-gradient(90deg, #00bcd4, #673ab7)", // Gradient text
                backgroundClip: "text", // Ensures the background only clips the text
                fontFamily: "'Poppins', sans-serif", // Modern font style for smoother feel
                textTransform: "uppercase",
                fontSize: fontSize,
                letterSpacing: letterSpacing,
                lineHeight: 1.2, // Slightly tighter line height for better alignment
                textShadow: textShadow, // Subtle shadow for depth
                mb: 4,
                animation: "textAnimation 3s ease-in-out infinite", // Infinite animation loop
                "@keyframes textAnimation": {
                    "0%": {
                        transform: "scale(1)",
                        textShadow: "0px 4px 6px rgba(0, 0, 0, 0.2)", // Starting shadow
                    },
                    "50%": {
                        transform: "scale(1.05)", // Slightly increase scale at halfway point
                        textShadow: "0px 6px 12px rgba(0, 0, 0, 0.3)", // Stronger shadow at 50%
                    },
                    "100%": {
                        transform: "scale(1)",
                        textShadow: "0px 4px 6px rgba(0, 0, 0, 0.2)", // Reset to normal shadow
                    },
                },
            } }
        >
            Join The Conversation
        </Typography>
    );
};

const ProfileContainer = ({ profileImage, handleProfileImageChange }) =>
{
    return (
        <Grid item xs={ 12 } sm={ 4 }>
            <Box sx={ { textAlign: 'center', position: 'relative' } }>
                <Badge
                    overlap="circular"
                    anchorOrigin={ { vertical: 'bottom', horizontal: 'right' } }
                    badgeContent={
                        <IconButton
                            color="primary"
                            component="label"
                            sx={ {
                                backgroundColor: '#2196f3', // Soft blue background
                                "&:hover": {
                                    backgroundColor: '#1976d2', // Darker blue on hover
                                    transform: 'scale(1.1)',
                                },
                                borderRadius: '50%',
                                padding: '8px', // Slightly smaller padding for cleaner look
                                transition: 'background-color 0.3s, transform 0.3s', // Smooth transitions
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)', // Light shadow on hover
                            } }
                        >
                            <PhotoCamera />
                            <input hidden accept="image/*" type="file" onChange={ handleProfileImageChange } />
                        </IconButton>
                    }
                >
                    <Avatar
                        src={ profileImage }
                        sx={ {
                            width: 100, // Slightly smaller avatar for minimalism
                            height: 100,
                            borderRadius: '50%',
                            border: '3px solid #2196f3', // Subtle border matching the icon color
                            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', // Subtle shadow for a clean look
                            transition: 'transform 0.3s ease, box-shadow 0.3s ease', // Smooth transition
                            "&:hover": {
                                transform: 'scale(1.05)', // Slight zoom effect
                                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)', // Deeper shadow on hover
                            },
                        } }
                    />
                </Badge>
            </Box>
        </Grid>
    );
};

const TextContainer = ({ userName, setUserName, room, setRoom, handleRoomJoin, profileImage, socketRef }) =>
{
    return (
        <Box
            sx={ {
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
                maxWidth: '450px',
                margin: '0 auto', // Center the container
                padding: '2rem',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #f3f4f6, #ffffff)', // Soft gradient background for the form
                boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.1)', // Soft shadows for depth
                animation: 'fadeIn 1s ease-in-out', // Smooth fade-in effect
                '@keyframes fadeIn': {
                    '0%': { opacity: 0 },
                    '100%': { opacity: 1 },
                },
            } }
        >

            <InputField
                fullWidth
                label="Your Name"
                placeholder="Enter your name"
                value={ userName }
                onChange={ (e) => setUserName(e.target.value) }
                variant="outlined"
                sx={ {
                    backgroundColor: '#f9f9f9', // Light background for input
                    borderRadius: '8px', // Rounded corners
                    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)', // Soft shadow
                    '&:hover': {
                        boxShadow: '0px 6px 12px rgba(0, 0, 0, 0.15)', // Slight shadow increase on hover
                    },
                    transition: 'box-shadow 0.3s ease-in-out', // Smooth shadow transition
                } }
            />

            <InputField
                fullWidth
                label="Room Id"
                placeholder="Enter room Id"
                value={ room }
                onChange={ (e) => setRoom(e.target.value) }
                variant="outlined"
                sx={ {
                    backgroundColor: '#f9f9f9', // Light background for input
                    borderRadius: '8px', // Rounded corners
                    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)', // Soft shadow
                    '&:hover': {
                        boxShadow: '0px 6px 12px rgba(0, 0, 0, 0.15)', // Slight shadow increase on hover
                    },
                    transition: 'box-shadow 0.3s ease-in-out', // Smooth shadow transition
                } }
            />

            <StyledButton
                fullWidth
                onClick={ handleRoomJoin }
                disabled={
                    !socketRef.current?.connected ||
                    !room.trim() ||
                    !userName ||
                    !profileImage
                }
                sx={ {
                    padding: '12px 25px',
                    backgroundColor: '#00796b', // Elegant teal background
                    color: '#fff',
                    fontWeight: 500,
                    borderRadius: '8px',
                    textTransform: 'none',
                    boxShadow: '0px 6px 15px rgba(0, 0, 0, 0.1)',
                    '&:hover': {
                        backgroundColor: '#004d40', // Darker shade on hover
                        boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.2)',
                    },
                    transition: 'background-color 0.3s, box-shadow 0.3s', // Smooth transition
                } }
            >
                Join Room
            </StyledButton>
        </Box>
    );
};

const MemberContainer = ({ availableRooms, setRoom, theme }) =>
{
    return (
        <Box
            sx={ {
                padding: '2rem 1.5rem',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #f3f4f6, #ffffff)', // Soft gradient background
                boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.1)', // Soft shadows for depth
                animation: 'fadeIn 1s ease-in-out', // Smooth fade-in effect
                '@keyframes fadeIn': {
                    '0%': { opacity: 0 },
                    '100%': { opacity: 1 },
                },
            } }
        >
            <Typography
                variant="h5"
                sx={ {
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    fontWeight: 700,
                    mb: 3,
                    color: theme.palette.primary.main,
                    textTransform: 'uppercase', // Makes it more formal and stylish
                    letterSpacing: '1px', // Adds spacing between letters
                    fontFamily: "'Roboto', sans-serif", // Clean, modern font style
                } }
            >
                <People />
                Already Available Rooms
            </Typography>

            { availableRooms.length > 0 ? (
                <Grid container spacing={ 4 }>
                    { availableRooms.map((room, index) =>
                    {
                        const roomKeys = Object.keys(room);
                        return roomKeys.map((roomId) =>
                        {
                            const roomDetails = room[roomId];
                            return (
                                <Grid item xs={ 12 } md={ 6 } key={ roomId + index }>
                                    <RoomCard
                                        sx={ {
                                            borderRadius: '16px',
                                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', // Subtle shadow for depth
                                            overflow: 'hidden',
                                            transition: 'transform 0.3s ease', // Smooth hover effect
                                            '&:hover': {
                                                transform: 'scale(1.05)', // Slight scale effect on hover
                                                boxShadow: '0 6px 18px rgba(0, 0, 0, 0.15)', // Deeper shadow on hover
                                            },
                                        } }
                                    >
                                        <CardContent>
                                            <Box sx={ { display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 } }>
                                                <Box>
                                                    <Typography variant="h6" sx={ { fontWeight: 600, color: theme.palette.primary.main } }>
                                                        { roomId }
                                                    </Typography>
                                                    <Chip
                                                        label={ `${ roomDetails.length } ${ roomDetails.length === 1 ? 'member' : 'members' }` }
                                                        size="small"
                                                        color="secondary"
                                                        sx={ { mt: 1 } }
                                                    />
                                                </Box>
                                                <StyledButton
                                                    size="small"
                                                    onClick={ () => setRoom(roomId) }
                                                    startIcon={ <ExitToApp /> }
                                                    sx={ {
                                                        padding: '6px 14px',
                                                        textTransform: 'none',
                                                        backgroundColor: '#00796b', // Elegant teal background
                                                        color: '#fff',
                                                        '&:hover': {
                                                            backgroundColor: '#004d40', // Darker shade on hover
                                                        },
                                                    } }
                                                >
                                                    Join
                                                </StyledButton>
                                            </Box>

                                            {/* Display Members */ }
                                            <Box>
                                                { roomDetails.map((member) => (
                                                    <Box
                                                        key={ member.socketId }
                                                        sx={ {
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 2,
                                                            mb: 2,
                                                            padding: '8px',
                                                            borderRadius: '8px',
                                                            backgroundColor: 'rgba(0, 0, 0, 0.05)', // Subtle background color for members
                                                            '&:hover': {
                                                                transform: 'scale(1.05)',
                                                                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)', // Add subtle shadow
                                                            },
                                                        } }
                                                    >
                                                        <Avatar src={ member.profileImage } />
                                                        <Typography variant="body2" sx={ { fontWeight: 500 } }>
                                                            { member.userName }
                                                        </Typography>
                                                        <Typography variant="body2" sx={ { color: 'text.secondary' } }>
                                                            { `Joined at ${ member.joiningTime }` }
                                                        </Typography>
                                                    </Box>
                                                )) }
                                            </Box>
                                        </CardContent>
                                    </RoomCard>
                                </Grid>
                            );
                        });
                    }) }
                </Grid>
            ) : (
                <Card sx={ { p: 4, textAlign: 'center', borderRadius: 12, boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)' } }>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        No Rooms Available
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Create a new room to start chatting!
                    </Typography>
                </Card>
            ) }
        </Box>
    );
};

// Main InputContainer Component with a Simplified UI
export default function InputContainer({ handleProfileImageChange, profileImage, setUserName, setRoom, handleRoomJoin, userName, room, socketRef, availableRooms })
{
    return (
        <ThemeProvider theme={ theme }>
            <CssBaseline />
            <StyledPaper elevation={ 3 }>
                <JoiningText />

                <Grid container spacing={ 4 } alignItems="center" justifyContent="center">
                    {/* Profile Image with Badge */ }
                    <ProfileContainer
                        profileImage={ profileImage }
                        handleProfileImageChange={ handleProfileImageChange }
                    />

                    {/* User Inputs Section */ }
                    <Grid item xs={ 12 } sm={ 6 }>
                        <TextContainer
                            userName={ userName }
                            setUserName={ setUserName }
                            room={ room }
                            setRoom={ setRoom }
                            handleRoomJoin={ handleRoomJoin }
                            profileImage={ profileImage }
                            socketRef={ socketRef }

                        />
                    </Grid>
                </Grid>

                <Divider sx={ { my: 5 } } />

                {/* Available Rooms Section */ }
                <MemberContainer
                    availableRooms={ availableRooms }
                    setRoom={ setRoom }
                    theme={ theme }
                />
            </StyledPaper>
        </ThemeProvider>
    );
}
