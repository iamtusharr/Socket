import React from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Slide from '@mui/material/Slide';
import { styled } from '@mui/system';

// Custom Transition Component
function SlideTransition(props)
{
    return <Slide { ...props } direction="left" />;
}

// Custom Styled Alert
const StyledAlert = styled(Alert)(({ theme }) => ({
    backgroundColor: '#4caf50', // Cool green background
    color: '#ffffff', // White text color
    fontSize: '1rem', // Larger font size
    fontFamily: '"Roboto", sans-serif', // Modern font
    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)', // Soft shadow
    borderRadius: '8px', // Rounded corners
    animation: 'pulse 1s ease-in-out infinite', // Pulse effect on the Snackbar
    '@keyframes pulse': {
        '0%': { transform: 'scale(1)' },
        '50%': { transform: 'scale(1.02)' },
        '100%': { transform: 'scale(1)' },
    },
}));

export default function CustomSnackbar({ popupMessage, setPopupMessage })
{
    return (
        <Snackbar
            open={ Boolean(popupMessage) }
            autoHideDuration={ 1200 } // Close after 1.2 seconds
            onClose={ () => setPopupMessage(null) }
            anchorOrigin={ { vertical: 'top', horizontal: 'right' } }
            TransitionComponent={ SlideTransition } // Smooth left-to-right slide transition
        >
            <StyledAlert
                onClose={ () => setPopupMessage(null) }
                severity="info"
                sx={ { width: '100%' } }
            >
                { popupMessage }
            </StyledAlert>
        </Snackbar>
    );
}
