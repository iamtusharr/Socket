import { useEffect, useState, useRef } from "react";
import { Box, Card, CardContent, Typography, Avatar, useTheme } from '@mui/material';
import { Chat, Groups } from '@mui/icons-material';

// Consolidated ChatHeader Component
const ChatHeader = ({ room, typingUser }) =>
{
    const theme = useTheme();

    return (
        <Card
            elevation={ 2 }
            sx={ {
                mb: 2,
                bgcolor: 'background.default',
                borderRadius: 2,
                boxShadow: 3,
                border: '1px solid',
                borderColor: 'divider',
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
                                bgcolor: 'primary.light',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            } }
                        >
                            <Chat sx={ { color: 'primary.main' } } />
                        </Box>

                        <Box>
                            <Box sx={ { display: 'flex', alignItems: 'center', gap: 1 } }>
                                <Typography variant="h6" sx={ { fontWeight: 'bold' } }>
                                    Room
                                </Typography>
                                <Box
                                    sx={ {
                                        px: 2,
                                        py: 1,
                                        borderRadius: 2,
                                        bgcolor: 'primary.light',
                                        boxShadow: 2,
                                        color: 'primary.dark',
                                    } }
                                >
                                    { room }
                                </Box>
                            </Box>
                            <Box sx={ { display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 } }>
                                <Groups sx={ { fontSize: '1rem', color: 'text.secondary' } } />
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
                                borderRadius: 16,
                                bgcolor: 'grey.100',
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
                                    width: 32,
                                    height: 32,
                                    border: '2px solid',
                                    borderColor: 'primary.main',
                                } }
                            >
                                { typingUser.name.charAt(0).toUpperCase() }
                            </Avatar>
                            <Typography
                                variant="body2"
                                sx={ {
                                    color: 'text.secondary',
                                    fontWeight: 500,
                                    fontStyle: 'italic',
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

// Consolidated Chat Container styled components
const StyledChatContainer = ({ children }) =>
{
    const theme = useTheme();

    return (
        <Box
            sx={ {
                height: 'calc(100vh - 240px)',
                display: 'flex',
                flexDirection: 'column',
                bgcolor: 'background.paper',
                borderRadius: 1,
                overflow: 'hidden',
                border: '1px solid',
                borderColor: 'divider',
            } }
        >
            { children }
        </Box>
    );
};

export { ChatHeader, StyledChatContainer };