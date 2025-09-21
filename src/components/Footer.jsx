
import React from 'react';
import { BottomNavigation, BottomNavigationAction, Paper, Box, Typography } from '@mui/material';
import InsertEmoticonIcon from '@mui/icons-material/InsertEmoticon';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import RestaurantIcon from '@mui/icons-material/Restaurant';

export default function Footer({ value, onChange }) {
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
        value={value}
        onChange={onChange}
        sx={{ bgcolor: 'transparent', color: '#fff' }}
      >
        <BottomNavigationAction
          label="Memes"
          icon={<InsertEmoticonIcon sx={{ color: value === 0 ? '#1a237e' : '#fff' }} />}
          sx={{
            color: value === 0 ? '#1a237e' : '#fff',
            fontWeight: value === 0 ? 900 : 400,
            background: value === 0 ? 'linear-gradient(90deg, #ffeb3b 60%, #fffde7 100%)' : 'none',
            border: value === 0 ? '2px solid #ffeb3b' : 'none',
            borderRadius: 3,
            mx: 0.5,
            boxShadow: value === 0 ? '0 0 12px 2px #ffeb3b88' : 'none',
            transition: 'background 0.2s, color 0.2s, box-shadow 0.2s',
          }}
        />
        <BottomNavigationAction
          label="Facts"
          icon={<EmojiObjectsIcon sx={{ color: value === 1 ? '#1a237e' : '#fff' }} />}
          sx={{
            color: value === 1 ? '#1a237e' : '#fff',
            fontWeight: value === 1 ? 900 : 400,
            background: value === 1 ? 'linear-gradient(90deg, #ffeb3b 60%, #fffde7 100%)' : 'none',
            border: value === 1 ? '2px solid #ffeb3b' : 'none',
            borderRadius: 3,
            mx: 0.5,
            boxShadow: value === 1 ? '0 0 12px 2px #ffeb3b88' : 'none',
            transition: 'background 0.2s, color 0.2s, box-shadow 0.2s',
          }}
        />
        <BottomNavigationAction
          label="Recipes"
          icon={<RestaurantIcon sx={{ color: value === 2 ? '#1a237e' : '#fff' }} />}
          sx={{
            color: value === 2 ? '#1a237e' : '#fff',
            fontWeight: value === 2 ? 900 : 400,
            background: value === 2 ? 'linear-gradient(90deg, #ffeb3b 60%, #fffde7 100%)' : 'none',
            border: value === 2 ? '2px solid #ffeb3b' : 'none',
            borderRadius: 3,
            mx: 0.5,
            boxShadow: value === 2 ? '0 0 12px 2px #ffeb3b88' : 'none',
            transition: 'background 0.2s, color 0.2s, box-shadow 0.2s',
          }}
        />
      </BottomNavigation>
      <Box sx={{ textAlign: 'center', py: 0.5 }}>
        <Typography variant="caption" sx={{ color: '#fffde7', fontWeight: 500 }}>
          © {new Date().getFullYear()} IndiBargain. All rights reserved.
        </Typography>
      </Box>
    </Paper>
  );
}
