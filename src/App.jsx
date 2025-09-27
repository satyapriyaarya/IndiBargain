
import React, { useState } from 'react';
import { Box, ThemeProvider, createTheme, CssBaseline } from '@mui/material';

import { indianPatterns, indianIcons } from './indianAssets';
import Header from './components/Header';
import Footer from './components/Footer';
import Memes from './components/Memes';
import Facts from './components/Facts';
import Recipes from './components/Recipes';
import FakeAPI from './components/FakeAPI';
import HomePage from './components/HomePage';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CircularProgress, Alert, Box as MuiBox } from '@mui/material';

const theme = createTheme({
  palette: {
    primary: { main: '#ff9933' }, // Saffron
    secondary: { main: '#138808' }, // Green
    background: { default: '#fff' },
    info: { main: '#000080' }, // Navy blue (Ashoka Chakra)
    warning: { main: '#ffd700' }, // Gold accent
  },
  typography: {
    fontFamily: 'Poppins, Roboto, Arial, sans-serif',
    h4: { fontWeight: 800, letterSpacing: 1 },
    h6: { fontWeight: 700 },
    body1: { fontSize: 18 },
  },
  shape: { borderRadius: 18 },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          transition: 'box-shadow 0.3s',
          boxShadow: '0 4px 24px 0 rgba(255, 153, 51, 0.10)',
          '&:hover': { boxShadow: '0 8px 32px 0 rgba(19, 136, 8, 0.18)' },
        },
      },
    },
  },
});

function App() {
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ...existing code...
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{
          minHeight: '100vh',
          pb: 7,
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          width: '100%',
        }}>
          <Header />
          <Box sx={{ flex: 1, width: '100%' }}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/memes" element={<Memes setLoading={setLoading} setError={setError} />} />
              <Route path="/facts" element={<Facts setLoading={setLoading} setError={setError} />} />
              <Route path="/recipes" element={<Recipes setLoading={setLoading} setError={setError} />} />
              <Route path="/FakeAPI" element={<FakeAPI />} />
            </Routes>
          </Box>
          <Footer />
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
