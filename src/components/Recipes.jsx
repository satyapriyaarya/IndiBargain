
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardMedia, Typography, Grid, Box, Button, Dialog, DialogTitle, DialogContent, IconButton, CircularProgress } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export default function Recipes({ setLoading, setError }) {
  const [recipes, setRecipes] = useState([]);
  const [open, setOpen] = useState(false);
  const [details, setDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);



  useEffect(() => {
    setLoading(true);
    setError(null);
    // List of categories to fetch from
    const categories = [
      'Vegetarian',
      'Dessert',
      'Chicken',
      'Seafood',
      'Beef',
      'Lamb',
      'Pasta',
      'Vegan',
      'Breakfast',
      'Goat',
      'Miscellaneous',
      'Pork',
      'Side',
      'Starter',
      'Vegan',
      'Indian' // area
    ];
    const fetches = [
      ...categories.map(cat => fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${encodeURIComponent(cat)}`).then(r => r.json())),
      fetch('https://www.themealdb.com/api/json/v1/1/filter.php?a=Indian').then(r => r.json())
    ];
    Promise.all(fetches)
      .then(results => {
        // Flatten and deduplicate by idMeal
        const allMeals = results.flatMap(r => r.meals || []);
        const uniqueMeals = [];
        const seen = new Set();
        for (const meal of allMeals) {
          if (!seen.has(meal.idMeal)) {
            uniqueMeals.push(meal);
            seen.add(meal.idMeal);
          }
        }
        setRecipes(uniqueMeals.slice(0, 50));
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch recipes.');
        setLoading(false);
      });
  }, [setLoading, setError]);

  const handleOpen = (id) => {
    setOpen(true);
    setDetails(null);
    setDetailsLoading(true);
    fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`)
      .then(res => res.json())
      .then(data => {
        setDetails(data.meals && data.meals[0]);
        setDetailsLoading(false);
      })
      .catch(() => setDetailsLoading(false));
  };

  const handleClose = () => {
    setOpen(false);
    setDetails(null);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      <Typography variant="h4" sx={{ mb: 2, fontWeight: 700, letterSpacing: 1, color: '#d84315', textAlign: 'center' }}>Popular Recipes</Typography>
      {/* Category filter removed, always show all recipes */}
      {recipes.length === 0 ? (
        <Grid container spacing={3} alignItems="center" justifyContent="center" sx={{ width: '100%', minHeight: 320 }}>
          <Grid item xs={12} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 320 }}>
            <Typography variant="h6" sx={{ color: '#bdbdbd', fontWeight: 600, textAlign: 'center', mb: 2 }}>
              No recipes found for this category.
            </Typography>
          </Grid>
        </Grid>
      ) : (
        <Grid container spacing={3} alignItems="stretch" justifyContent="center" sx={{ width: '100%' }}>
          {recipes.map((recipe, idx) => (
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
                    background: 'linear-gradient(135deg, #fffbe7 0%, #f3f6fd 100%)',
                    display: 'flex',
                    alignItems: 'stretch',
                    justifyContent: 'center',
                  }}
                >
                  <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
                    <CardMedia
                      component="img"
                      image={recipe.strMealThumb}
                      alt={recipe.strMeal}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'filter 0.3s',
                      }}
                    />
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
                        background: 'linear-gradient(180deg, rgba(26,35,126,0.92) 80%, rgba(26,35,126,0.0) 100%)',
                        color: '#fff',
                        '.MuiCard-root:hover &': {
                          opacity: 1,
                          pointerEvents: 'auto',
                        },
                      }}
                    >
                      {recipe.strMeal}
                    </Box>
                    <Box sx={{ position: 'absolute', bottom: 16, right: 16, zIndex: 3 }}>
                      <Button
                        variant="contained"
                        color="warning"
                        sx={{
                          borderRadius: 99,
                          fontWeight: 700,
                          px: 3,
                          py: 1.2,
                          boxShadow: 4,
                          fontSize: 16,
                          background: 'linear-gradient(90deg, #ff9800 0%, #ff6f00 100%)',
                          textTransform: 'none',
                          '&:hover': {
                            background: 'linear-gradient(90deg, #ff6f00 0%, #ff9800 100%)',
                          },
                        }}
                        onClick={() => handleOpen(recipe.idMeal)}
                      >
                        View Recipe
                      </Button>
                    </Box>
                  </Box>
                </Card>
              </Box>
            </Grid>
          ))}
        </Grid>
      )}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 2 }}>
          {details ? details.strMeal : 'Loading...'}
          <IconButton onClick={handleClose} size="large"><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {detailsLoading && <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}><CircularProgress /></Box>}
          {details && (
            <Box>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mb: 2, alignItems: { xs: 'flex-start', md: 'flex-start' } }}>
                <img src={details.strMealThumb} alt={details.strMeal} style={{ maxWidth: 260, width: '100%', height: 'auto', borderRadius: 12, objectFit: 'contain', alignSelf: 'flex-start' }} />
                <Box>
                  <Typography variant="h6" sx={{ mb: 1 }}>Category: {details.strCategory}</Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>Area: {details.strArea}</Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>{details.strInstructions}</Typography>
                  <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 700 }}>Ingredients:</Typography>
                  <ul style={{ margin: 0, paddingLeft: 18 }}>
                    {Array.from({ length: 20 }).map((_, i) => {
                      const ingredient = details[`strIngredient${i+1}`];
                      const measure = details[`strMeasure${i+1}`];
                      return ingredient && ingredient.trim() ? (
                        <li key={i}>{ingredient} {measure && measure.trim() ? `- ${measure}` : ''}</li>
                      ) : null;
                    })}
                  </ul>
                </Box>
              </Box>
              {details.strYoutube && (
                <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 700 }}>Recipe Video:</Typography>
                  <Box sx={{ position: 'relative', width: '100%', maxWidth: 480, aspectRatio: '16/9', mb: 1 }}>
                    <iframe
                      width="100%"
                      height="270"
                      src={`https://www.youtube.com/embed/${details.strYoutube.split('v=')[1]?.split('&')[0]}`}
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      style={{ borderRadius: 10, width: '100%', height: '100%' }}
                    />
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
