import { Container, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@constants/routes';

/**
 * 404 Not Found page component
 */
const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm">
      
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >


        <Typography variant="h1" component="h1" gutterBottom sx={{ fontSize: '6rem' }}>
          404
        </Typography>
        <Typography variant="h4" component="h2" gutterBottom>
          Page Not Found.
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          The page you are looking for doesn&apos;t exist or has been moved.
        </Typography>
        <Button variant="contained" size="large" onClick={() => navigate(ROUTES.LOGIN)} sx={{ mt: 2 }}>
          Go Home
        </Button>
      </Box>
    </Container>
  );
};

export default NotFound;
