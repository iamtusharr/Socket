import React from 'react';
import { Box, Typography, TextField, Button, Avatar, Card, Paper, IconButton, Stack, useTheme, alpha, Tooltip, Zoom, Badge, InputAdornment, Fade } from "@mui/material";
import { Send, Circle, ArrowBack } from "@mui/icons-material";

const ChatRoom = ({ isMobile, UsersList, room, typingUser, messages, socketId, messagesEndRef, message, handleChangeMessage, handleSendMessage }) =>
{
    const theme = useTheme();

    // Custom styles
    const glassmorphismStyle = {
        backdropFilter: 'blur(10px)',
        backgroundColor: alpha(theme.palette.background.paper, 0.8),
        borderBottom: `1px solid ${ alpha(theme.palette.divider, 0.1) }`
    };

    const messageContainerStyle = {
        backgroundColor: alpha(theme.palette.primary.main, 0.03),
        backgroundImage: `radial-gradient(${ alpha(theme.palette.primary.main, 0.1) } 1px, transparent 1px)`,
        backgroundSize: '20px 20px'
    };

    return (
        <Card sx={
            {
                height: '75vh', display: 'flex', overflow: 'hidden', bgcolor: 'background.paper', borderRadius: 4
            }
        }>
            {/* Sidebar */ }
            { !isMobile && (
                <Box sx={ {
                    width: 320,
                    borderRight: 1,
                    borderColor: 'divider',
                    display: 'flex',
                    flexDirection: 'column'
                } }>
                    <Box sx={ { flexGrow: 1, overflow: 'auto' } }>
                        <UsersList />
                    </Box>
                </Box>
            ) }

            {/* Main Chat Area */ }
            <Box sx={ { flexGrow: 1, display: 'flex', flexDirection: 'column' } }>
                {/* Chat Header */ }
                <Paper sx={ {
                    ...glassmorphismStyle,
                    p: 2,
                    zIndex: 1
                } } elevation={ 0 }>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Stack direction="row" spacing={ 2 } alignItems="center">
                            { isMobile && (
                                <IconButton edge="start">
                                    <ArrowBack />
                                </IconButton>
                            ) }
                            <Stack direction="row" spacing={ 2 } alignItems="center">
                                <Badge
                                    overlap="circular"
                                    anchorOrigin={ { vertical: 'bottom', horizontal: 'right' } }
                                    badgeContent={
                                        <Box
                                            sx={ {
                                                width: 12,
                                                height: 12,
                                                bgcolor: 'success.main',
                                                borderRadius: '50%',
                                                border: `2px solid ${ theme.palette.background.paper }`
                                            } }
                                        />
                                    }
                                >
                                    <Avatar
                                        sx={ {
                                            width: 48,
                                            height: 48,
                                            boxShadow: theme.shadows[2]
                                        } }
                                    >
                                        { room[0]?.toUpperCase() }
                                    </Avatar>
                                </Badge>
                                <Box>
                                    <Typography variant="h6" sx={ { fontWeight: 600 } }>{ room }</Typography>
                                    <Stack direction="row" spacing={ 1 } alignItems="center">
                                        <Circle sx={ { color: 'success.main', fontSize: 8 } } />
                                        <Typography variant="caption" color="text.secondary">
                                            Active now
                                        </Typography>
                                    </Stack>
                                </Box>
                            </Stack>
                        </Stack>
                    </Stack>
                </Paper>

                {/* Messages Area */ }
                <Box sx={ {
                    flexGrow: 1,
                    overflow: 'auto',
                    p: 3,
                    ...messageContainerStyle
                } }>
                    { messages.map((msg, index) =>
                    {
                        const isOwn = msg.senderId === socketId;
                        const isConsecutive = index > 0 && messages[index - 1].senderId === msg.senderId;

                        return (
                            <Zoom in key={ msg.messageId } style={ { transitionDelay: '100ms' } }>
                                <Box
                                    sx={ {
                                        display: 'flex',
                                        justifyContent: isOwn ? 'flex-end' : 'flex-start',
                                        mb: 2,
                                        ml: isOwn ? 4 : 0,
                                        mr: isOwn ? 0 : 4
                                    } }
                                >
                                    <Stack
                                        direction="row"
                                        spacing={ 1.5 }
                                        alignItems="flex-end"
                                        sx={ { maxWidth: '70%' } }
                                    >
                                        { !isOwn && !isConsecutive && (
                                            <Avatar
                                                src={ msg.profileImage }
                                                sx={ {
                                                    width: 32,
                                                    height: 32,
                                                    boxShadow: theme.shadows[2]
                                                } }
                                            />
                                        ) }
                                        { !isOwn && isConsecutive && <Box sx={ { width: 32 } } /> }
                                        <Box>
                                            { !isConsecutive && (
                                                <Typography
                                                    variant="caption"
                                                    sx={ {
                                                        ml: 2,
                                                        mb: 0.5,
                                                        display: 'block',
                                                        color: 'text.secondary'
                                                    } }
                                                >
                                                    { isOwn ? 'You' : msg.senderName }
                                                </Typography>
                                            ) }
                                            <Paper
                                                elevation={ 0 }
                                                sx={ {
                                                    p: 2,
                                                    backgroundColor: isOwn ? theme.palette.primary.main : alpha(theme.palette.grey[100], 0.8),
                                                    color: isOwn ? 'white' : 'text.primary',
                                                    borderRadius: 3,
                                                    borderTopRightRadius: isOwn && !isConsecutive ? 0 : 3,
                                                    borderTopLeftRadius: !isOwn && !isConsecutive ? 0 : 3,
                                                    boxShadow: isOwn ? `0 2px 8px ${ alpha(theme.palette.primary.main, 0.25) }` : theme.shadows[1]
                                                } }
                                            >
                                                <Typography variant="body1">{ msg.message }</Typography>
                                                <Typography
                                                    variant="caption"
                                                    sx={ {
                                                        display: 'block',
                                                        textAlign: 'right',
                                                        mt: 0.5,
                                                        opacity: 0.7
                                                    } }
                                                >
                                                    { msg.time }
                                                </Typography>
                                            </Paper>
                                        </Box>
                                    </Stack>
                                </Box>
                            </Zoom>
                        );
                    }) }
                    <div ref={ messagesEndRef } />

                    {/* Typing Indicator */ }
                    { typingUser.name && (
                        <Fade in>
                            <Box sx={ { display: 'flex', alignItems: 'center', mt: 2 } }>
                                <Avatar
                                    src={ typingUser.profileImage }
                                    sx={ { width: 24, height: 24, mr: 1 } }
                                />
                                <Paper
                                    sx={ {
                                        py: 1,
                                        px: 2,
                                        backgroundColor: alpha(theme.palette.grey[100], 0.8),
                                        borderRadius: 3
                                    } }
                                >
                                    <Stack direction="row" spacing={ 1 } alignItems="center">
                                        <Typography variant="caption" color="text.secondary">
                                            { typingUser.name } is typing
                                        </Typography>
                                        <Box sx={ { display: 'flex', alignItems: 'center' } }>
                                            { [0, 1, 2].map((dot) => (
                                                <Box
                                                    key={ dot }
                                                    sx={ {
                                                        width: 4,
                                                        height: 4,
                                                        borderRadius: '50%',
                                                        backgroundColor: theme.palette.text.secondary,
                                                        mx: 0.25,
                                                        animation: 'bounce 1.4s infinite ease-in-out',
                                                        animationDelay: `${ dot * 0.16 }s`,
                                                        '@keyframes bounce': {
                                                            '0%, 80%, 100%': { transform: 'scale(0)' },
                                                            '40%': { transform: 'scale(1)' }
                                                        }
                                                    } }
                                                />
                                            )) }
                                        </Box>
                                    </Stack>
                                </Paper>
                            </Box>
                        </Fade>
                    ) }
                </Box>

                {/* Input Area */ }
                <Paper
                    elevation={ 0 }
                    sx={ {
                        p: 2,
                        backgroundColor: alpha(theme.palette.background.paper, 0.8),
                        backdropFilter: 'blur(10px)',
                        borderTop: `1px solid ${ alpha(theme.palette.divider, 0.1) }`
                    } }
                >
                    <Stack direction="row" spacing={ 2 }>
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Type your message..."
                            value={ message }
                            onChange={ handleChangeMessage }
                            onKeyPress={ (e) =>
                            {
                                if (e.key === 'Enter') {
                                    handleSendMessage(e);
                                }
                            } }
                            size="small"

                            sx={ {
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 3,
                                    backgroundColor: alpha(theme.palette.background.paper, 0.8),
                                    '&:hover': {
                                        backgroundColor: alpha(theme.palette.background.paper, 0.95)
                                    }
                                }
                            } }
                        />
                        <Button
                            variant="contained"
                            onClick={ handleSendMessage }
                            disabled={ !message.trim() }
                            sx={ {
                                borderRadius: 3,
                                px: 3,
                                boxShadow: `0 2px 8px ${ alpha(theme.palette.primary.main, 0.25) }`,
                                '&:hover': {
                                    boxShadow: `0 4px 12px ${ alpha(theme.palette.primary.main, 0.35) }`
                                }
                            } }
                        >
                            <Send />
                        </Button>
                    </Stack>
                </Paper>
            </Box>
        </Card>
    );
};

export default ChatRoom;