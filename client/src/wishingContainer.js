import { Box, Typography } from "@mui/material";

export default function WishingContainer({ wishingMessage, formattedTime })
{
    return (
        <Box
            sx={ {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
                px: 4,
                py: 3,
                background: 'linear-gradient(135deg, #E3F2FD, #BBDEFB)', // Soft blue gradient
                borderRadius: '20px', // Rounded edges for a more modern look
                boxShadow: '0px 8px 15px rgba(0, 0, 0, 0.1)', // Soft shadow for depth
                backdropFilter: 'blur(8px)', // Increased blur effect for contrast
                border: 'none', // Removed border for a cleaner look
                position: 'relative',
                overflow: 'hidden', // Ensures no content is spilled over
            } }
        >
            {/* Wishing message on the left */ }
            <Typography
                variant="h5"
                sx={ {
                    fontWeight: 700,
                    color: '#1E3A8A', // Dark blue for contrast against the light gradient
                    letterSpacing: '1.2px',
                    textTransform: 'capitalize', // Smoothed look by capitalizing each word
                    fontSize: '1.6rem',
                    lineHeight: '1.5',
                    textShadow: '2px 2px 6px rgba(0, 0, 0, 0.15)', // Subtle shadow for prominence
                    zIndex: 1, // Keeps the text above any potential background
                } }
            >
                { wishingMessage }
            </Typography>

            {/* Current time on the right */ }
            <Box
                sx={ {
                    position: 'relative',
                    zIndex: 2,
                    padding: '0.8rem 1.5rem',
                    borderRadius: '12px',
                    background: 'rgba(0, 0, 0, 0.2)', // Softer background for more contrast
                    boxShadow: '0px 6px 10px rgba(0, 0, 0, 0.1)', // Light shadow
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.4rem',
                    color: 'white', // Ensuring text is clearly visible
                    fontStyle: 'italic',
                    letterSpacing: '1px',
                    fontWeight: 600,
                    border: '2px solid rgba(255, 255, 255, 0.3)', // Soft border for the time container
                    backdropFilter: 'blur(3px)', // Softening the time container background
                    transform: 'scale(1.05)', // Subtle scaling effect for visual impact
                    transition: 'all 0.3s ease-in-out', // Smooth transition effect
                } }
            >
                <Typography
                    variant="body1"
                    sx={ {
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    } }
                >
                    Time: { formattedTime }
                </Typography>
            </Box>

            {/* Decorative element: a subtle accent border at the bottom */ }
            <Box
                sx={ {
                    position: 'absolute',
                    bottom: '-5px',
                    left: '0',
                    right: '0',
                    height: '6px',
                    background: 'linear-gradient(135deg, #BBDEFB, #E3F2FD)', // Lighter gradient for the bottom border
                    borderRadius: '0 0 20px 20px', // Rounded bottom corners
                } }
            />
        </Box>
    );
}
