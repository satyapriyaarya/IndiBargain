
import React from 'react';
import { AppBar, Toolbar, Typography, Box, Avatar } from '@mui/material';

import { useNavigate } from 'react-router-dom';

export default function Header() {
  const navigate = useNavigate();
  const handleClick = () => navigate('/');
  return (
  <AppBar  elevation={3} sx={{ width: '100%', bgcolor: 'primary.main', background: 'linear-gradient(90deg, #1a237e 60%, #ff6f00 100%)' }}>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', width: '100%' }} onClick={handleClick}>
          <Avatar sx={{ bgcolor: 'secondary.main', width: 44, height: 44, mr: 2, fontWeight: 700, fontSize: 28 }}>
            IB
          </Avatar>
          <Box>
            <Typography variant="h4" component="div" sx={{ fontWeight: 900, letterSpacing: 2, color: '#fff' }}>
              IndiBargain
            </Typography>
            <Typography variant="subtitle2" sx={{ color: '#fffde7', fontWeight: 400, letterSpacing: 1 }}>
              Viral Memes, Fun Facts & Indian Recipes
            </Typography>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
