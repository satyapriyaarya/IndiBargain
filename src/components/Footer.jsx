

import React from 'react';
import { BottomNavigation, BottomNavigationAction, Paper, Box, Typography } from '@mui/material';
import InsertEmoticonIcon from '@mui/icons-material/InsertEmoticon';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import { useLocation, useNavigate } from 'react-router-dom';

import ApiIcon from '@mui/icons-material/Api';

const navItems = [
  { label: 'Memes', icon: <InsertEmoticonIcon />, path: '/memes' },
  { label: 'Facts', icon: <EmojiObjectsIcon />, path: '/facts' },
  { label: 'Recipes', icon: <RestaurantIcon />, path: '/recipes' },
  { label: 'FakeAPI', icon: <ApiIcon />, path: '/FakeAPI' },
];

export default function Footer() {
  const location = useLocation();
  const navigate = useNavigate();
  const value = navItems.findIndex(item => location.pathname.startsWith(item.path));

  return (
    <Paper sx={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      borderRadius: 0,
      background: 'linear-gradient(90deg, #1a237e 60%, #ff6f00 100%)',
      color: '#fff',
      zIndex: 1201
    }} elevation={6}>
      <BottomNavigation
        showLabels
        value={value === -1 ? false : value}
        onChange={(_, newValue) => navigate(navItems[newValue].path)}
        sx={{ bgcolor: 'transparent', color: '#fff' }}
      >
        {navItems.map((item, idx) => (
          <BottomNavigationAction
            key={item.label}
            label={item.label}
            icon={item.icon}
            sx={{
              color: value === idx ? '#1a237e' : '#fff',
              fontWeight: value === idx ? 900 : 400,
              background: value === idx ? 'linear-gradient(90deg, #ffeb3b 60%, #fffde7 100%)' : 'none',
              border: value === idx ? '2px solid #ffeb3b' : 'none',
              borderRadius: 3,
              mx: 0.5,
              boxShadow: value === idx ? '0 0 12px 2px #ffeb3b88' : 'none',
              transition: 'background 0.2s, color 0.2s, box-shadow 0.2s',
            }}
          />
        ))}
      </BottomNavigation>
      <Box sx={{ textAlign: 'center', py: 0.5 }}>
        <Typography variant="caption" sx={{ color: '#fffde7', fontWeight: 500 }}>
          © {new Date().getFullYear()} IndiBargain. All rights reserved.
        </Typography>
      </Box>
    </Paper>
  );
}
