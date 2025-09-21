
import React from 'react';
import { AppBar, Toolbar, Typography, Box, Avatar } from '@mui/material';

export default function Header() {
  return (
    <AppBar position="sticky" elevation={3} sx={{ bgcolor: 'primary.main', background: 'linear-gradient(90deg, #1a237e 60%, #ff6f00 100%)' }}>
      <Toolbar>
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
      </Toolbar>
    </AppBar>
  );
}
