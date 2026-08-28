import { Container, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';

/**
 * Home page component
 */
const Home = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          gap: 3,
        }}
      >
        <Typography variant="h1" component="h1" gutterBottom>
          Welcome to Paalmall
        </Typography>

    

        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Button variant="contained" size="large" onClick={() => navigate(ROUTES.MESSAGES)}>
            Go to App
          </Button>
          <Button variant="outlined" size="large" onClick={() => navigate(ROUTES.LOGIN)}>
            Login
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Home;
