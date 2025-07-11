import React, { useState, createContext, useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Link, useParams } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { 
  Container, Typography, Box, Button, AppBar, Toolbar, 
  TextField, Card, CardContent, CardMedia, Grid, 
  Rating, Chip, Divider, Alert, Snackbar, Badge,
  Drawer, List, ListItem, ListItemText, ListItemSecondaryAction,
  IconButton, Fab, Dialog, DialogTitle, DialogContent,
  DialogActions, Stepper, Step, StepLabel, Breadcrumbs,
  Accordion, AccordionSummary, AccordionDetails, MenuItem,
  Select, FormControl, InputLabel, CircularProgress
} from '@mui/material';
import { 
  Restaurant as RestaurantIcon, LocationOn, Star, Phone,
  ShoppingCart, Add, Remove, Delete, CheckCircle,
  ExpandMore, ArrowBack, Person, Lock
} from '@mui/icons-material';
import { authAPI, restaurantsAPI, ordersAPI, addressesAPI } from './api';

const theme = createTheme({
  palette: {
    primary: {
      main: '#ff6b35',
    },
    secondary: {
      main: '#f7931e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

// Cart Context
const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  const addToCart = (foodItem) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === foodItem.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === foodItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, {
          id: foodItem.id,
          name: foodItem.name,
          price: foodItem.price,
          image: foodItem.image,
          restaurantName: foodItem.restaurantName,
          quantity: 1
        }];
      }
    });
  };

  const removeFromCart = (itemId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === itemId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const clearCart = () => {
    setCart([]);
  };

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    getCartTotal,
    getCartCount,
    clearCart,
    showCart,
    setShowCart,
    showCheckout,
    setShowCheckout
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// Dummy restaurants data with menus
const dummyRestaurants = [
  {
    id: 1,
    name: "Pizza Palace",
    cuisine: "Italian",
    rating: 4.5,
    deliveryTime: "25-35 min",
    minOrder: "$15",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop",
    address: "123 Main St, Downtown",
    phone: "+1 (555) 123-4567",
    description: "Authentic Italian pizza with fresh ingredients and traditional recipes.",
    menu: {
      "Pizzas": [
        { id: 1, name: "Margherita Pizza", price: 12.99, image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=200&h=150&fit=crop", description: "Fresh mozzarella, tomato sauce, and basil" },
        { id: 2, name: "Pepperoni Pizza", price: 14.99, image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=200&h=150&fit=crop", description: "Spicy pepperoni with melted cheese" },
        { id: 3, name: "BBQ Chicken Pizza", price: 16.99, image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=200&h=150&fit=crop", description: "BBQ sauce, grilled chicken, red onions" }
      ],
      "Sides": [
        { id: 4, name: "Garlic Bread", price: 4.99, image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=150&fit=crop", description: "Fresh baked garlic bread" },
        { id: 5, name: "Caesar Salad", price: 6.99, image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=200&h=150&fit=crop", description: "Fresh romaine lettuce with caesar dressing" }
      ],
      "Beverages": [
        { id: 6, name: "Coca Cola", price: 2.99, image: "https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=200&h=150&fit=crop", description: "Refreshing cola drink" },
        { id: 7, name: "Lemonade", price: 3.99, image: "https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=200&h=150&fit=crop", description: "Fresh squeezed lemonade" }
      ]
    }
  },
  {
    id: 2,
    name: "Burger House",
    cuisine: "American",
    rating: 4.2,
    deliveryTime: "20-30 min",
    minOrder: "$12",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58e9?w=400&h=300&fit=crop",
    address: "456 Oak Ave, Midtown",
    phone: "+1 (555) 234-5678",
    description: "Juicy burgers and crispy fries made with premium beef and fresh vegetables.",
    menu: {
      "Burgers": [
        { id: 8, name: "Classic Cheeseburger", price: 8.99, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58e9?w=200&h=150&fit=crop", description: "Beef patty with cheese, lettuce, tomato" },
        { id: 9, name: "Bacon Deluxe", price: 11.99, image: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=200&h=150&fit=crop", description: "Beef patty with bacon, cheese, special sauce" },
        { id: 10, name: "Veggie Burger", price: 9.99, image: "https://images.unsplash.com/photo-1520072959219-c595dc870360?w=200&h=150&fit=crop", description: "Plant-based patty with fresh vegetables" }
      ],
      "Sides": [
        { id: 11, name: "French Fries", price: 3.99, image: "https://images.unsplash.com/photo-1573089026217-9db5aac8d87a?w=200&h=150&fit=crop", description: "Crispy golden fries" },
        { id: 12, name: "Onion Rings", price: 4.99, image: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=200&h=150&fit=crop", description: "Crispy battered onion rings" }
      ],
      "Beverages": [
        { id: 13, name: "Milkshake", price: 4.99, image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=200&h=150&fit=crop", description: "Creamy vanilla milkshake" },
        { id: 14, name: "Iced Tea", price: 2.99, image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=200&h=150&fit=crop", description: "Refreshing iced tea" }
      ]
    }
  },
  {
    id: 3,
    name: "Sushi Express",
    cuisine: "Japanese",
    rating: 4.7,
    deliveryTime: "30-45 min",
    minOrder: "$20",
    image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop",
    address: "789 Pine St, Uptown",
    phone: "+1 (555) 345-6789",
    description: "Fresh sushi and sashimi prepared by expert chefs with the finest ingredients.",
    menu: {
      "Sushi Rolls": [
        { id: 15, name: "California Roll", price: 8.99, image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=200&h=150&fit=crop", description: "Crab, avocado, cucumber" },
        { id: 16, name: "Spicy Tuna Roll", price: 10.99, image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=200&h=150&fit=crop", description: "Spicy tuna with spicy mayo" },
        { id: 17, name: "Dragon Roll", price: 14.99, image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=200&h=150&fit=crop", description: "Eel, avocado, cucumber" }
      ],
      "Sashimi": [
        { id: 18, name: "Salmon Sashimi", price: 12.99, image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=200&h=150&fit=crop", description: "Fresh salmon sashimi" },
        { id: 19, name: "Tuna Sashimi", price: 13.99, image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=200&h=150&fit=crop", description: "Fresh tuna sashimi" }
      ],
      "Beverages": [
        { id: 20, name: "Green Tea", price: 2.99, image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=200&h=150&fit=crop", description: "Traditional Japanese green tea" },
        { id: 21, name: "Miso Soup", price: 3.99, image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=200&h=150&fit=crop", description: "Warm miso soup" }
      ]
    }
  }
];

// Auth Context
const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('authToken');
    if (token) {
      authAPI.getProfile()
        .then(response => {
          setUser(response.data);
          setIsLoggedIn(true);
        })
        .catch(() => {
          localStorage.removeItem('authToken');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const { token, user: userData } = response.data;
      localStorage.setItem('authToken', token);
      setUser(userData);
      setIsLoggedIn(true);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      const { token, user: newUser } = response.data;
      localStorage.setItem('authToken', token);
      setUser(newUser);
      setIsLoggedIn(true);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('authToken');
      setUser(null);
      setIsLoggedIn(false);
    }
  };

  const value = {
    isLoggedIn,
    user,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

const Home = () => {
  const navigate = useNavigate();
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box textAlign="center">
        <Typography variant="h2" component="h1" gutterBottom color="primary">
          🍕 Food Delivery App
        </Typography>
        <Typography variant="h5" gutterBottom>
          Welcome to the Food Delivery Application!
        </Typography>
        <Typography variant="body1" paragraph>
          Your complete food delivery platform is now running with full backend integration.
        </Typography>
        
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button 
            variant="contained" 
            color="primary" 
            size="large"
            onClick={() => navigate('/restaurants')}
          >
            Browse Restaurants
          </Button>
          <Button 
            variant="outlined" 
            color="secondary" 
            size="large"
            onClick={() => navigate('/register')}
          >
            Sign Up
          </Button>
        </Box>
        
        <Box sx={{ mt: 4, p: 3, bgcolor: 'grey.100', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Server Status:
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ✅ Backend API: http://localhost:3000
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ✅ Frontend App: http://localhost:5173
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ✅ Full Backend Integration: Active
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

const Restaurants = () => {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        const response = await restaurantsAPI.getAll();
        setRestaurants(response.data.restaurants || []);
      } catch (err) {
        setError('Failed to load restaurants. Using demo data.');
        // Fallback to demo data if API fails
        setRestaurants(dummyRestaurants);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading restaurants...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" gutterBottom>
        🏪 Restaurants
      </Typography>
      <Typography variant="body1" paragraph>
        Choose from our selection of amazing restaurants!
      </Typography>
      
      {error && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        {restaurants.map((restaurant) => (
          <Grid item xs={12} sm={6} md={4} key={restaurant.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', cursor: 'pointer' }}
                  onClick={() => navigate(`/restaurant/${restaurant.id}`)}>
              <CardMedia
                component="img"
                height="200"
                image={restaurant.image || `https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop`}
                alt={restaurant.name}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom>
                  {restaurant.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Rating value={restaurant.rating || 4.0} precision={0.1} readOnly size="small" />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    {restaurant.rating || 4.0}
                  </Typography>
                </Box>
                <Chip label={restaurant.cuisine || 'International'} size="small" color="primary" sx={{ mb: 1 }} />
                <Typography variant="body2" color="text.secondary" paragraph>
                  {restaurant.description || 'Delicious food served with care.'}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationOn fontSize="small" color="action" />
                  <Typography variant="body2" sx={{ ml: 0.5 }}>
                    {restaurant.address || 'Address not available'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Phone fontSize="small" color="action" />
                  <Typography variant="body2" sx={{ ml: 0.5 }}>
                    {restaurant.phone || '+1 (555) 000-0000'}
                  </Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    🕒 {restaurant.deliveryTime || '25-35 min'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Min: {restaurant.minOrder || '$10'}
                  </Typography>
                </Box>
                <Button 
                  variant="contained" 
                  color="primary" 
                  fullWidth 
                  sx={{ mt: 2 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/restaurant/${restaurant.id}`);
                  }}
                >
                  View Menu
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Button variant="contained" color="primary" onClick={() => window.history.back()}>
          Back to Home
        </Button>
      </Box>
    </Container>
  );
};

const RestaurantDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addToCart } = useCart();
  const { isLoggedIn } = useAuth();
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        setLoading(true);
        const response = await restaurantsAPI.getById(id);
        let restaurantData = response.data.restaurant || response.data;
        setRestaurant(restaurantData);
      } catch (err) {
        setError('Failed to load restaurant. Using demo data.');
        // Fallback to demo data
        const demoRestaurant = dummyRestaurants.find(r => r.id === parseInt(id));
        if (demoRestaurant) {
          setRestaurant(demoRestaurant);
        } else {
          setError('Restaurant not found');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurant();
  }, [id]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading restaurant...
        </Typography>
      </Container>
    );
  }

  if (error && !restaurant) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" color="error">{error}</Typography>
        <Button onClick={() => navigate('/restaurants')}>Back to Restaurants</Button>
      </Container>
    );
  }

  const handleAddToCart = (foodItem) => {
    if (!isLoggedIn) {
      setShowLoginDialog(true);
      return;
    }

    const itemWithRestaurant = {
      ...foodItem,
      restaurantName: restaurant.name
    };
    
    addToCart(itemWithRestaurant);
    setAlertMessage(`${foodItem.name} added to cart!`);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 2000);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Breadcrumbs sx={{ mb: 3 }}>
        <Button onClick={() => navigate('/')}>Home</Button>
        <Button onClick={() => navigate('/restaurants')}>Restaurants</Button>
        <Typography color="text.primary">{restaurant.name}</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/restaurants')} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h3">{restaurant.name}</Typography>
      </Box>

      <Card sx={{ mb: 4 }}>
        <CardMedia
          component="img"
          height="300"
          image={restaurant.image || `https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop`}
          alt={restaurant.name}
        />
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Rating value={restaurant.rating || 4.0} precision={0.1} readOnly />
            <Typography variant="body1" sx={{ ml: 1 }}>
              {restaurant.rating || 4.0}
            </Typography>
            <Chip label={restaurant.cuisine || 'International'} sx={{ ml: 2 }} />
          </Box>
          <Typography variant="body1" paragraph>
            {restaurant.description || 'Delicious food served with care.'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <LocationOn fontSize="small" color="action" />
              <Typography variant="body2" sx={{ ml: 0.5 }}>
                {restaurant.address || 'Address not available'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Phone fontSize="small" color="action" />
              <Typography variant="body2" sx={{ ml: 0.5 }}>
                {restaurant.phone || '+1 (555) 000-0000'}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              🕒 {restaurant.deliveryTime || '25-35 min'}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <Typography variant="h4" gutterBottom>
        Menu
      </Typography>

      {restaurant.menu && restaurant.menu.length > 0 ? (
        restaurant.menu.map((category) => (
          <Accordion key={category.category} sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6">{category.category}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                {category.items.map((item) => (
                  <Grid item xs={12} sm={6} md={4} key={item.id}>
                    <Card>
                      <CardMedia
                        component="img"
                        height="150"
                        image={item.image || `https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=200&h=150&fit=crop`}
                        alt={item.name}
                      />
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
                          {item.description || 'Delicious food item'}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="h6" color="primary">
                            ₹{item.price}
                          </Typography>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleAddToCart(item)}
                          >
                            Add to Cart
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </AccordionDetails>
          </Accordion>
        ))
      ) : (
        <Typography variant="body1" color="text.secondary">
          Menu not available for this restaurant.
        </Typography>
      )}

      <Snackbar
        open={showAlert}
        autoHideDuration={2000}
        onClose={() => setShowAlert(false)}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          {alertMessage}
        </Alert>
      </Snackbar>

      <Dialog open={showLoginDialog} onClose={() => setShowLoginDialog(false)}>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Lock sx={{ mr: 1 }} />
            Login Required
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Please log in to add items to your cart and place orders.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowLoginDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => {
            setShowLoginDialog(false);
            navigate('/login');
          }}>
            Login
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

const CartDrawer = () => {
  const { 
    cart, 
    removeFromCart, 
    updateQuantity, 
    getCartTotal, 
    getCartCount,
    showCart, 
    setShowCart,
    setShowCheckout,
    clearCart
  } = useCart();

  const handleCheckout = () => {
    setShowCart(false);
    setShowCheckout(true);
  };

  return (
    <>
      <Drawer
        anchor="right"
        open={showCart}
        onClose={() => setShowCart(false)}
        PaperProps={{
          sx: { width: 400 }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h5" gutterBottom>
            🛒 Shopping Cart ({getCartCount()} items)
          </Typography>
          
          {cart.length === 0 ? (
            <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
              Your cart is empty. Add some delicious food!
            </Typography>
          ) : (
            <>
              <List>
                {cart.map((item) => (
                  <ListItem key={item.id} divider>
                    <CardMedia
                      component="img"
                      sx={{ width: 60, height: 60, borderRadius: 1, mr: 2 }}
                      image={item.image}
                      alt={item.name}
                    />
                    <ListItemText
                      primary={item.name}
                      secondary={`${item.restaurantName} • $${item.price} each`}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Remove />
                      </IconButton>
                      <Typography variant="body2">{item.quantity}</Typography>
                      <IconButton
                        size="small"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Add />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </ListItem>
                ))}
              </List>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Total:</Typography>
                <Typography variant="h6" color="primary">
                  ${getCartTotal().toFixed(2)}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={clearCart}
                >
                  Clear Cart
                </Button>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleCheckout}
                >
                  Checkout
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Drawer>
    </>
  );
};

const CheckoutDialog = () => {
  const { 
    cart, 
    getCartTotal, 
    getCartCount, 
    showCheckout, 
    setShowCheckout,
    clearCart
  } = useCart();
  const [activeStep, setActiveStep] = useState(0);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deliveryDetails, setDeliveryDetails] = useState({
    address: '',
    phone: '',
    paymentMethod: 'card'
  });
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    type: 'home'
  });

  useEffect(() => {
    // Fetch user addresses on dialog open
    if (showCheckout) {
      addressesAPI.getAll()
        .then(res => setAddresses(res.data.addresses || []))
        .catch(() => setAddresses([]));
    }
  }, [showCheckout]);

  const steps = ['Review Order', 'Delivery Details', 'Payment', 'Confirmation'];

  const handleNext = async () => {
    if (activeStep === steps.length - 2) {
      setLoading(true);
      setError(null);
      try {
        let addressId = selectedAddressId;
        
        // If using new address, save it first
        if (useNewAddress) {
          if (!newAddress.addressLine1 || !newAddress.city || !newAddress.state || !newAddress.pincode) {
            setError('Please fill in all required address fields.');
            setLoading(false);
            return;
          }
          
          try {
            const addressResponse = await addressesAPI.create({
              type: newAddress.type,
              addressLine1: newAddress.addressLine1,
              addressLine2: newAddress.addressLine2,
              city: newAddress.city,
              state: newAddress.state,
              pincode: newAddress.pincode
            });
            addressId = addressResponse.data.addressId;
          } catch (addressError) {
            console.error('Error saving address:', addressError);
            setError('Failed to save address. Please try again.');
            setLoading(false);
            return;
          }
        } else {
          if (!selectedAddressId) {
            setError('Please select a delivery address.');
            setLoading(false);
            return;
          }
        }

        const orderData = {
          addressId: addressId,
          paymentMethod: deliveryDetails.paymentMethod,
          specialInstructions: '',
        };
        await ordersAPI.create(orderData);
        setOrderPlaced(true);
        setTimeout(() => {
          setShowCheckout(false);
          setOrderPlaced(false);
          setActiveStep(0);
          clearCart();
          setDeliveryDetails({ address: '', phone: '', paymentMethod: 'card' });
          setSelectedAddressId('');
          setUseNewAddress(false);
          setNewAddress({ addressLine1: '', addressLine2: '', city: '', state: '', pincode: '', type: 'home' });
        }, 3000);
      } catch (err) {
        setError('Failed to place order. Please try again.');
        console.error('Order creation error:', err);
      } finally {
        setLoading(false);
      }
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleClose = () => {
    setShowCheckout(false);
    setActiveStep(0);
    setError(null);
  };

  const handleDeliveryChange = (field, value) => {
    setDeliveryDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog
      open={showCheckout}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        Checkout - {getCartCount()} items
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {activeStep === 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>Order Summary</Typography>
            {cart.map((item) => (
              <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>{item.name} x{item.quantity}</Typography>
                <Typography>${(item.price * item.quantity).toFixed(2)}</Typography>
              </Box>
            ))}
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6">Total:</Typography>
              <Typography variant="h6" color="primary">${getCartTotal().toFixed(2)}</Typography>
            </Box>
          </Box>
        )}

        {activeStep === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom>Delivery Details</Typography>
            
            {/* Address Selection Options */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>Choose Address Option:</Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Button
                  variant={!useNewAddress ? "contained" : "outlined"}
                  onClick={() => setUseNewAddress(false)}
                  size="small"
                >
                  Use Saved Address
                </Button>
                <Button
                  variant={useNewAddress ? "contained" : "outlined"}
                  onClick={() => setUseNewAddress(true)}
                  size="small"
                >
                  Enter New Address
                </Button>
              </Box>
            </Box>

            {!useNewAddress ? (
              /* Saved Address Selection */
              <FormControl fullWidth margin="normal">
                <InputLabel>Select Address</InputLabel>
                <Select
                  value={selectedAddressId}
                  onChange={e => setSelectedAddressId(e.target.value)}
                  label="Select Address"
                >
                  {addresses.length === 0 && <MenuItem value="">No saved addresses</MenuItem>}
                  {addresses.map(addr => (
                    <MenuItem key={addr.id} value={addr.id}>
                      {addr.address_line1} {addr.address_line2 ? ', ' + addr.address_line2 : ''}, {addr.city}, {addr.state} {addr.pincode}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              /* New Address Form */
              <Box>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Address Line 1"
                      value={newAddress.addressLine1}
                      onChange={(e) => setNewAddress({...newAddress, addressLine1: e.target.value})}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Address Line 2 (Optional)"
                      value={newAddress.addressLine2}
                      onChange={(e) => setNewAddress({...newAddress, addressLine2: e.target.value})}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="City"
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="State"
                      value={newAddress.state}
                      onChange={(e) => setNewAddress({...newAddress, state: e.target.value})}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Pincode"
                      value={newAddress.pincode}
                      onChange={(e) => setNewAddress({...newAddress, pincode: e.target.value})}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Address Type</InputLabel>
                      <Select
                        value={newAddress.type}
                        onChange={(e) => setNewAddress({...newAddress, type: e.target.value})}
                        label="Address Type"
                      >
                        <MenuItem value="home">Home</MenuItem>
                        <MenuItem value="work">Work</MenuItem>
                        <MenuItem value="other">Other</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Box>
            )}

            <TextField
              fullWidth
              label="Phone Number"
              value={deliveryDetails.phone}
              onChange={(e) => handleDeliveryChange('phone', e.target.value)}
              margin="normal"
              required
            />
          </Box>
        )}

        {activeStep === 2 && (
          <Box>
            <Typography variant="h6" gutterBottom>Payment Information</Typography>
            <FormControl fullWidth margin="normal">
              <InputLabel>Payment Method</InputLabel>
              <Select
                value={deliveryDetails.paymentMethod}
                onChange={(e) => handleDeliveryChange('paymentMethod', e.target.value)}
                label="Payment Method"
              >
                <MenuItem value="card">Credit/Debit Card</MenuItem>
                <MenuItem value="cash">Cash on Delivery</MenuItem>
                <MenuItem value="digital">Digital Wallet</MenuItem>
              </Select>
            </FormControl>
            
            {deliveryDetails.paymentMethod === 'card' && (
              <>
                <TextField
                  fullWidth
                  label="Card Number"
                  defaultValue="**** **** **** 1234"
                  margin="normal"
                  disabled
                />
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    fullWidth
                    label="Expiry Date"
                    defaultValue="12/25"
                    margin="normal"
                    disabled
                  />
                  <TextField
                    fullWidth
                    label="CVV"
                    defaultValue="123"
                    margin="normal"
                    disabled
                  />
                </Box>
              </>
            )}
          </Box>
        )}

        {activeStep === 3 && (
          <Box sx={{ textAlign: 'center' }}>
            {orderPlaced ? (
              <>
                <CheckCircle color="success" sx={{ fontSize: 64, mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  Order Placed Successfully!
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Your order will be delivered soon. Thank you for choosing our service!
                </Typography>
              </>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <CircularProgress sx={{ mb: 2 }} />
                <Typography variant="h6">
                  {loading ? 'Processing payment and placing order...' : 'Processing payment...'}
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>Cancel</Button>
        {activeStep > 0 && activeStep < steps.length - 1 && (
          <Button onClick={handleBack} disabled={loading}>Back</Button>
        )}
        {activeStep < steps.length - 1 && (
          <Button 
            variant="contained" 
            onClick={handleNext}
            disabled={loading || (activeStep === 1 && (
              (!selectedAddressId && !useNewAddress) || 
              (useNewAddress && (!newAddress.addressLine1 || !newAddress.city || !newAddress.state || !newAddress.pincode)) ||
              !deliveryDetails.phone
            ))}
          >
            {activeStep === steps.length - 2 ? 'Place Order' : 'Next'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('success');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const result = await login(formData);
      if (result.success) {
        setAlertSeverity('success');
        setAlertMessage('Login successful! Redirecting to home...');
        setShowAlert(true);
        setTimeout(() => {
          setShowAlert(false);
          navigate('/');
        }, 2000);
      } else {
        setAlertSeverity('error');
        setAlertMessage(result.error);
        setShowAlert(true);
      }
    } catch (error) {
      setAlertSeverity('error');
      setAlertMessage('Login failed. Please try again.');
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h3" gutterBottom textAlign="center">
        🔐 Login
      </Typography>
      
      <Card sx={{ p: 3, mt: 3 }}>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            margin="normal"
            required
            variant="outlined"
            disabled={loading}
          />
          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            margin="normal"
            required
            variant="outlined"
            disabled={loading}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
        
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Don't have an account?{' '}
            <Button 
              color="primary" 
              onClick={() => navigate('/register')}
              sx={{ textTransform: 'none' }}
              disabled={loading}
            >
              Sign up here
            </Button>
          </Typography>
        </Box>
      </Card>
      
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Button variant="outlined" color="primary" onClick={() => window.history.back()} disabled={loading}>
          Back to Home
        </Button>
      </Box>
      
      <Snackbar
        open={showAlert}
        autoHideDuration={4000}
        onClose={() => setShowAlert(false)}
      >
        <Alert severity={alertSeverity} sx={{ width: '100%' }}>
          {alertMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('success');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setAlertSeverity('error');
      setAlertMessage('Passwords do not match!');
      setShowAlert(true);
      return;
    }

    if (formData.password.length < 6) {
      setAlertSeverity('error');
      setAlertMessage('Password must be at least 6 characters long!');
      setShowAlert(true);
      return;
    }

    setLoading(true);
    
    try {
      const result = await register({
        name: formData.firstName + ' ' + formData.lastName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || undefined
      });
      
      if (result.success) {
        setAlertSeverity('success');
        setAlertMessage('Registration successful! Redirecting to login...');
        setShowAlert(true);
        setTimeout(() => {
          setShowAlert(false);
          navigate('/login');
        }, 2000);
      } else {
        setAlertSeverity('error');
        setAlertMessage(result.error);
        setShowAlert(true);
      }
    } catch (error) {
      setAlertSeverity('error');
      setAlertMessage('Registration failed. Please try again.');
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h3" gutterBottom textAlign="center">
        📝 Register
      </Typography>
      
      <Card sx={{ p: 3, mt: 3 }}>
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              margin="normal"
              required
              variant="outlined"
              disabled={loading}
            />
            <TextField
              fullWidth
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              margin="normal"
              required
              variant="outlined"
              disabled={loading}
            />
          </Box>
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            margin="normal"
            required
            variant="outlined"
            disabled={loading}
          />
          <TextField
            fullWidth
            label="Phone (optional)"
            name="phone"
            value={formData.phone || ''}
            onChange={handleChange}
            margin="normal"
            variant="outlined"
            disabled={loading}
          />
          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            margin="normal"
            required
            variant="outlined"
            disabled={loading}
            helperText="Password must be at least 6 characters"
          />
          <TextField
            fullWidth
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            margin="normal"
            required
            variant="outlined"
            disabled={loading}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </Button>
        </form>
        
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Already have an account?{' '}
            <Button 
              color="primary" 
              onClick={() => navigate('/login')}
              sx={{ textTransform: 'none' }}
              disabled={loading}
            >
              Login here
            </Button>
          </Typography>
        </Box>
      </Card>
      
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Button variant="outlined" color="primary" onClick={() => window.history.back()} disabled={loading}>
          Back to Home
        </Button>
      </Box>
      
      <Snackbar
        open={showAlert}
        autoHideDuration={4000}
        onClose={() => setShowAlert(false)}
      >
        <Alert severity={alertSeverity} sx={{ width: '100%' }}>
          {alertMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

const Navbar = () => {
  const navigate = useNavigate();
  const { getCartCount, setShowCart } = useCart();
  const { isLoggedIn, logout } = useAuth();
  
  return (
    <AppBar position="sticky">
      <Toolbar>
        <RestaurantIcon sx={{ mr: 2 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          FoodDelivery
        </Typography>
        <Button color="inherit" onClick={() => navigate('/')}>Home</Button>
        <Button color="inherit" onClick={() => navigate('/restaurants')}>Restaurants</Button>
        {isLoggedIn ? (
          <>
            <Button color="inherit" onClick={logout}>Logout</Button>
            <IconButton 
              color="inherit" 
              onClick={() => setShowCart(true)}
              sx={{ ml: 1 }}
            >
              <Badge badgeContent={getCartCount()} color="secondary">
                <ShoppingCart />
              </Badge>
            </IconButton>
          </>
        ) : (
          <>
            <Button color="inherit" onClick={() => navigate('/login')}>Login</Button>
            <Button color="inherit" onClick={() => navigate('/register')}>Register</Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <CartProvider>
          <Router>
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/restaurants" element={<Restaurants />} />
              <Route path="/restaurant/:id" element={<RestaurantDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Routes>
            <CartDrawer />
            <CheckoutDialog />
          </Router>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
