
import React, { useEffect, useState } from 'react';
import { Card, CardMedia, Typography, Grid, Box, Button, Chip, Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export default function Memes({ setLoading, setError }) {
  const [memes, setMemes] = useState([]);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
  fetch('https://meme-api.com/gimme/50')
      .then(res => res.json())
      .then(data => {
        setMemes(data.memes || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch memes.');
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpen = (meme) => {
    setSelected(meme);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelected(null);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      <Typography variant="h4" sx={{ mb: 2, fontWeight: 700, letterSpacing: 1, color: '#1976d2', textAlign: 'center' }}>Trending Memes</Typography>
      <Grid container spacing={3} alignItems="stretch" justifyContent="center" sx={{ width: '100%' }}>
        {memes.map((meme, idx) => (
          <Grid
            item
            xs={12}
            md={6}
            lg={4}
            key={idx}
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'stretch',
              minWidth: 0,
            }}
          >
            <Box sx={{ width: 320, height: 320, position: 'relative', display: 'flex' }}>
              <Card
                sx={{
                  borderRadius: 4,
                  boxShadow: 4,
                  width: '100%',
                  height: '100%',
                  overflow: 'hidden',
                  position: 'relative',
                  p: 0,
                  m: 0,
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-6px) scale(1.03)',
                    boxShadow: 8,
                  },
                  background: 'linear-gradient(135deg, #e3f2fd 0%, #f3f6fd 100%)',
                  display: 'flex',
                  alignItems: 'stretch',
                  justifyContent: 'center',
                }}
              >
                <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
                  <CardMedia
                    component="img"
                    image={meme.url}
                    alt={meme.title}
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'filter 0.3s',
                    }}
                  />
                  {/* Title overlay on hover */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      px: 2,
                      py: 1.2,
                      opacity: 0,
                      transition: 'opacity 0.3s',
                      textAlign: 'center',
                      fontWeight: 700,
                      fontSize: 18,
                      letterSpacing: 0.5,
                      zIndex: 2,
                      pointerEvents: 'none',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'normal',
                      borderTopLeftRadius: 16,
                      borderTopRightRadius: 16,
                      background: 'linear-gradient(180deg, rgba(25,118,210,0.92) 80%, rgba(25,118,210,0.0) 100%)',
                      color: '#fff',
                      '.MuiCard-root:hover &': {
                        opacity: 1,
                        pointerEvents: 'auto',
                      },
                    }}
                  >
                    {meme.title}
                  </Box>
                  {/* Fancy button always visible at bottom right */}
                  <Box sx={{ position: 'absolute', bottom: 16, right: 16, zIndex: 3 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      sx={{
                        borderRadius: 99,
                        fontWeight: 700,
                        px: 3,
                        py: 1.2,
                        boxShadow: 4,
                        fontSize: 16,
                        background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)',
                        textTransform: 'none',
                        '&:hover': {
                          background: 'linear-gradient(90deg, #42a5f5 0%, #1976d2 100%)',
                        },
                      }}
                      onClick={() => handleOpen(meme)}
                    >
                      View Details
                    </Button>
                  </Box>
                  {/* Author chip always visible at top right */}
                  <Box sx={{ position: 'absolute', top: 12, right: 12, zIndex: 3 }}>
                    <Chip label={`by ${meme.author}`} size="small" color="primary" sx={{ bgcolor: '#fff', color: '#1976d2', fontWeight: 600 }} />
                  </Box>
                </Box>
              </Card>
            </Box>
          </Grid>
        ))}
      </Grid>
      {/* Meme Details Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 2 }}>
          {selected ? selected.title : 'Meme Details'}
          <IconButton onClick={handleClose} size="large"><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selected && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <img src={selected.url} alt={selected.title} style={{ maxWidth: 360, width: '100%', borderRadius: 12, objectFit: 'contain' }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1976d2', mt: 1 }}>{selected.title}</Typography>
              <Chip label={`by ${selected.author}`} size="small" color="primary" sx={{ bgcolor: '#fff', color: '#1976d2', fontWeight: 600, mt: 1 }} />
              <Button
                variant="contained"
                color="primary"
                sx={{
                  borderRadius: 99,
                  fontWeight: 700,
                  px: 3,
                  py: 1.2,
                  boxShadow: 4,
                  fontSize: 16,
                  background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)',
                  textTransform: 'none',
                  mt: 2
                }}
                href={selected.postLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open on Reddit
              </Button>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}