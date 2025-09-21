
import React, { useState } from 'react';
import { Box, ThemeProvider, createTheme, CssBaseline } from '@mui/material';

import { indianPatterns, indianIcons } from './indianAssets';
import Header from './components/Header';
import Footer from './components/Footer';
import Memes from './components/Memes';
import Facts from './components/Facts';
import Recipes from './components/Recipes';
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

  // Helper to wrap each tab with loading/error logic
  const renderTab = () => {
    if (tab === 0) return <Memes setLoading={setLoading} setError={setError} />;
    if (tab === 1) return <Facts setLoading={setLoading} setError={setError} />;
    if (tab === 2) return <Recipes setLoading={setLoading} setError={setError} />;
    return null;
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{
        minHeight: '100vh',
        pb: 7,
        background: `#fff url('data:image/svg+xml;utf8,${encodeURIComponent(indianPatterns.paisley)}') repeat top left`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
      }}>
        <Header />
        <Box sx={{
          pt: 4,
          pb: 10,
          px: { xs: 1, sm: 2, md: 4 },
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          {renderTab()}
        </Box>
        <Footer value={tab} onChange={(_, v) => setTab(v)} />
        {(loading || error) && (
          <MuiBox sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 2000,
            background: `#fff url('data:image/svg+xml;utf8,${encodeURIComponent(indianPatterns.lotus)}') repeat center center`,
          }}>
            {loading && (
              <span style={{
                fontSize: 32,
                fontWeight: 700,
                color: '#ff9933',
                fontFamily: 'Poppins, Roboto, Arial, sans-serif',
                letterSpacing: 1.2,
                textShadow: '1px 1px 0 #fff, 2px 2px 8px #ffd700',
              }}>
                Loading...
              </span>
            )}
            {error && <Alert severity="error" sx={{ fontSize: 24, ml: 2 }}>{error}</Alert>}
            {/* Decorative Indian icon bottom right */}
            <span style={{
              position: 'absolute',
              bottom: 32,
              right: 32,
              opacity: 0.7,
              pointerEvents: 'none',
            }}
              dangerouslySetInnerHTML={{ __html: indianIcons.diya }}
            />
          </MuiBox>
        )}
      </Box>
    </ThemeProvider>
  );
}

export default App;
