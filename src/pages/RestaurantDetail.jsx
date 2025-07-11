import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Box,
  Chip,
  Rating,
  Button,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  Alert,
  CircularProgress,
  Paper,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  ShoppingCart as CartIcon,
  Star as StarIcon,
  AccessTime as TimeIcon,
  LocalShipping as DeliveryIcon,
} from '@mui/icons-material';
import { restaurantAPI, reviewAPI } from '../services/api';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const RestaurantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [quantities, setQuantities] = useState({});
  const [cartLoading, setCartLoading] = useState({});

  useEffect(() => {
    fetchRestaurantData();
  }, [id]);

  const fetchRestaurantData = async () => {
    try {
      setLoading(true);
      setError('');

      const [restaurantRes, reviewsRes] = await Promise.all([
        restaurantAPI.getRestaurant(id),
        reviewAPI.getRestaurantReviews(id),
      ]);

      setRestaurant(restaurantRes.data.restaurant);
      setMenu(restaurantRes.data.restaurant.menu || []);
      setReviews(reviewsRes.data.reviews || []);
    } catch (error) {
      console.error('Error fetching restaurant data:', error);
      setError('Failed to load restaurant data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (itemId, change) => {
    const currentQuantity = quantities[itemId] || 0;
    const newQuantity = Math.max(0, currentQuantity + change);
    
    setQuantities(prev => ({
      ...prev,
      [itemId]: newQuantity,
    }));
  };

  const handleAddToCart = async (item) => {
    if (!user) {
      navigate('/login');
      return;
    }

    const quantity = quantities[item.id] || 1;
    if (quantity === 0) return;

    setCartLoading(prev => ({ ...prev, [item.id]: true }));

    try {
      const result = await addToCart({
        restaurant_id: restaurant.id,
        menu_item_id: item.id,
        quantity,
        price: item.price,
      });

      if (result.success) {
        setQuantities(prev => ({ ...prev, [item.id]: 0 }));
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setCartLoading(prev => ({ ...prev, [item.id]: false }));
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!restaurant) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h6" color="text.secondary">
          Restaurant not found
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Restaurant Header */}
      <Paper sx={{ mb: 4, overflow: 'hidden' }}>
        <Box sx={{ position: 'relative' }}>
          <CardMedia
            component="img"
            height="300"
            image={restaurant.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'}
            alt={restaurant.name}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
              color: 'white',
              p: 3,
            }}
          >
            <Typography variant="h3" component="h1" gutterBottom>
              {restaurant.name}
            </Typography>
            <Typography variant="h6" gutterBottom>
              {restaurant.cuisine}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Rating value={restaurant.rating || 0} readOnly />
                <Typography variant="body1">
                  ({restaurant.rating || 0})
                </Typography>
              </Box>
              <Chip
                icon={<TimeIcon />}
                label={restaurant.delivery_time || '30-45 min'}
                color="primary"
                variant="outlined"
              />
              <Chip
                icon={<DeliveryIcon />}
                label={`$${restaurant.delivery_fee || 2.99} delivery`}
                color="secondary"
                variant="outlined"
              />
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Menu" />
          <Tab label="Reviews" />
          <Tab label="About" />
        </Tabs>
      </Box>

      {/* Menu Tab */}
      {activeTab === 0 && (
        <Box>
          {menu.length > 0 ? (
            menu.map((category) => (
              <Box key={category.category} sx={{ mb: 4 }}>
                <Typography variant="h5" gutterBottom sx={{ mb: 2, color: 'primary.main' }}>
                  {category.category}
                </Typography>
                <Grid container spacing={3}>
                  {category.items.map((item) => (
                    <Grid item xs={12} md={6} key={item.id}>
                      <Card>
                        <Grid container>
                          <Grid item xs={4}>
                            <CardMedia
                              component="img"
                              height="140"
                              image={item.image || 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'}
                              alt={item.name}
                            />
                          </Grid>
                          <Grid item xs={8}>
                            <CardContent>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Typography variant="h6" gutterBottom>
                                  {item.name}
                                </Typography>
                                {item.isVeg && (
                                  <Chip label="Veg" size="small" color="success" />
                                )}
                              </Box>
                              <Typography variant="body2" color="text.secondary" paragraph>
                                {item.description}
                              </Typography>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="h6" color="primary">
                                  ₹{item.price}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleQuantityChange(item.id, -1)}
                                    disabled={quantities[item.id] === 0}
                                  >
                                    <RemoveIcon />
                                  </IconButton>
                                  <Typography variant="body1" sx={{ minWidth: 20, textAlign: 'center' }}>
                                    {quantities[item.id] || 0}
                                  </Typography>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleQuantityChange(item.id, 1)}
                                  >
                                    <AddIcon />
                                  </IconButton>
                                  <Button
                                    variant="contained"
                                    size="small"
                                    startIcon={<CartIcon />}
                                    onClick={() => handleAddToCart(item)}
                                    disabled={!quantities[item.id] || cartLoading[item.id]}
                                  >
                                    {cartLoading[item.id] ? <CircularProgress size={16} /> : 'Add'}
                                  </Button>
                                </Box>
                              </Box>
                            </CardContent>
                          </Grid>
                        </Grid>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            ))
          ) : (
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              Menu not available for this restaurant.
            </Typography>
          )}
        </Box>
      )}

      {/* Reviews Tab */}
      {activeTab === 1 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Customer Reviews ({reviews.length})
          </Typography>
          {reviews.length > 0 ? (
            <List>
              {reviews.map((review, index) => (
                <Box key={review.id}>
                  <ListItem alignItems="flex-start">
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="subtitle1" component="span">
                            {review.user_name}
                          </Typography>
                          <Rating value={review.rating} readOnly size="small" />
                          <Typography variant="body2" color="text.secondary">
                            {new Date(review.created_at).toLocaleDateString()}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Typography variant="body2" color="text.secondary">
                          {review.comment}
                        </Typography>
                      }
                    />
                  </ListItem>
                  {index < reviews.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              No reviews yet. Be the first to review this restaurant!
            </Typography>
          )}
        </Box>
      )}

      {/* About Tab */}
      {activeTab === 2 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            About {restaurant.name}
          </Typography>
          <Typography variant="body1" paragraph>
            {restaurant.description || 'No description available.'}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" gutterBottom>
                Restaurant Information
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Cuisine:</strong> {restaurant.cuisine}<br />
                <strong>Rating:</strong> {restaurant.rating || 0}/5<br />
                <strong>Delivery Time:</strong> {restaurant.delivery_time || '30-45 min'}<br />
                <strong>Delivery Fee:</strong> ${restaurant.delivery_fee || 2.99}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" gutterBottom>
                Contact Information
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Phone:</strong> {restaurant.phone || 'Not available'}<br />
                <strong>Address:</strong> {restaurant.address || 'Not available'}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      )}
    </Container>
  );
};

export default RestaurantDetail; 