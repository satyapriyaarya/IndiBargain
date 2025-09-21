import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Grid, Box, Button } from '@mui/material';

export default function Facts({ setLoading, setError }) {
  const [facts, setFacts] = useState([]);
  const [copiedIdx, setCopiedIdx] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const fetchFacts = async () => {
      try {
  const promises = Array.from({ length: 50 }, () =>
          fetch('https://uselessfacts.jsph.pl/api/v2/facts/random?language=en').then(res => res.json())
        );
        const results = await Promise.all(promises);
        setFacts(results);
      } catch {
        setError('Failed to fetch facts.');
      } finally {
        setLoading(false);
      }
    };
    fetchFacts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1200);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      <Typography variant="h4" sx={{ mb: 2, fontWeight: 700, letterSpacing: 1, color: '#388e3c', textAlign: 'center' }}>Did You Know?</Typography>
      <Grid container spacing={3} alignItems="stretch" justifyContent="center" sx={{ width: '100%' }}>
        {facts.map((fact, idx) => (
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
                  background: 'linear-gradient(135deg, #f9fbe7 0%, #e8f5e9 100%)',
                  display: 'flex',
                  alignItems: 'stretch',
                  justifyContent: 'center',
                }}
              >
                <Box sx={{ width: '100%', height: '100%', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', px: 2, py: 2 }}>
                  <Typography variant="body1" sx={{ fontWeight: 600, fontSize: 18, letterSpacing: 0.5, color: '#388e3c', textAlign: 'center', mb: 2, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 7, WebkitBoxOrient: 'vertical' }}>
                    {fact.text}
                  </Typography>
                  {/* Always visible fancy button at bottom right */}
                  <Box sx={{ position: 'absolute', bottom: 16, right: 16, zIndex: 3 }}>
                    <Button
                      variant="contained"
                      color="success"
                      sx={{
                        borderRadius: 99,
                        fontWeight: 700,
                        px: 3,
                        py: 1.2,
                        boxShadow: 4,
                        fontSize: 16,
                        background: 'linear-gradient(90deg, #388e3c 0%, #a5d6a7 100%)',
                        textTransform: 'none',
                        '&:hover': {
                          background: 'linear-gradient(90deg, #a5d6a7 0%, #388e3c 100%)',
                        },
                      }}
                      onClick={() => handleCopy(fact.text, idx)}
                    >
                      {copiedIdx === idx ? 'Copied!' : 'Copy Fact'}
                    </Button>
                  </Box>
                </Box>
              </Card>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}