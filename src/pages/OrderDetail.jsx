import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Divider,
  Stepper,
  Step,
  StepLabel,
  StepContent,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Receipt as ReceiptIcon,
  AccessTime as TimeIcon,
  LocalShipping as ShippingIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material';
import { orderAPI } from '../services/api';

const getStatusSteps = () => [
  { label: 'Order Placed', status: 'pending' },
  { label: 'Order Confirmed', status: 'confirmed' },
  { label: 'Preparing', status: 'preparing' },
  { label: 'Out for Delivery', status: 'out_for_delivery' },
  { label: 'Delivered', status: 'delivered' },
];

const getStatusColor = (status) => {
  switch (status) {
    case 'pending':
      return 'warning';
    case 'confirmed':
      return 'info';
    case 'preparing':
      return 'primary';
    case 'out_for_delivery':
      return 'secondary';
    case 'delivered':
      return 'success';
    case 'cancelled':
      return 'error';
    default:
      return 'default';
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'pending':
      return <TimeIcon />;
    case 'confirmed':
      return <ReceiptIcon />;
    case 'preparing':
      return <ShippingIcon />;
    case 'out_for_delivery':
      return <ShippingIcon />;
    case 'delivered':
      return <CheckIcon />;
    case 'cancelled':
      return <CancelIcon />;
    default:
      return <TimeIcon />;
  }
};

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await orderAPI.getOrder(id);
      setOrder(response.data);
    } catch (error) {
      console.error('Error fetching order:', error);
      setError('Failed to load order details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateOrderTotal = (items) => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCurrentStepIndex = (status) => {
    const steps = getStatusSteps();
    const statusIndex = steps.findIndex(step => step.status === status);
    return statusIndex >= 0 ? statusIndex : 0;
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

  if (!order) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h6" color="text.secondary">
          Order not found
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate('/orders')}
          sx={{ mr: 2 }}
        >
          Back to Orders
        </Button>
        <Typography variant="h4" component="h1">
          Order #{order.id}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Order Status */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Order Status
              </Typography>
              
              <Stepper orientation="vertical" activeStep={getCurrentStepIndex(order.status)}>
                {getStatusSteps().map((step, index) => (
                  <Step key={step.label} active={index <= getCurrentStepIndex(order.status)}>
                    <StepLabel
                      icon={getStatusIcon(step.status)}
                      sx={{
                        '& .MuiStepLabel-iconContainer': {
                          color: index <= getCurrentStepIndex(order.status) ? 'primary.main' : 'grey.400',
                        },
                      }}
                    >
                      {step.label}
                    </StepLabel>
                    <StepContent>
                      <Typography variant="body2" color="text.secondary">
                        {index === 0 && 'Your order has been placed and is being processed'}
                        {index === 1 && 'Restaurant has confirmed your order'}
                        {index === 2 && 'Your food is being prepared'}
                        {index === 3 && 'Your order is on its way'}
                        {index === 4 && 'Your order has been delivered'}
                      </Typography>
                    </StepContent>
                  </Step>
                ))}
              </Stepper>

              {order.status === 'cancelled' && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
                  <Typography variant="body2" color="error.contrastText">
                    This order has been cancelled.
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Order Summary */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Order Summary
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Order Date:</strong> {formatDate(order.created_at)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Restaurant:</strong> {order.restaurant_name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Status:</strong>
                </Typography>
                <Chip
                  icon={getStatusIcon(order.status)}
                  label={order.status.replace('_', ' ').toUpperCase()}
                  color={getStatusColor(order.status)}
                  sx={{ mt: 1 }}
                />
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Delivery Information
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationIcon sx={{ mr: 1, fontSize: 16 }} />
                  <Typography variant="body2" color="text.secondary">
                    {order.delivery_address}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PhoneIcon sx={{ mr: 1, fontSize: 16 }} />
                  <Typography variant="body2" color="text.secondary">
                    {order.phone || 'Not provided'}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Payment Summary
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Subtotal:</Typography>
                  <Typography variant="body2">${calculateOrderTotal(order.items).toFixed(2)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Delivery Fee:</Typography>
                  <Typography variant="body2">${order.delivery_fee || 0}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Tax:</Typography>
                  <Typography variant="body2">${((calculateOrderTotal(order.items) * 0.08)).toFixed(2)}</Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6">Total:</Typography>
                  <Typography variant="h6" color="primary">
                    ${order.total_amount}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Order Items */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Order Items
              </Typography>
              
              {order.items.map((item, index) => (
                <Box key={index}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
                    <Box>
                      <Typography variant="body1">
                        {item.quantity}x {item.name}
                      </Typography>
                      {item.notes && (
                        <Typography variant="body2" color="text.secondary">
                          Notes: {item.notes}
                        </Typography>
                      )}
                    </Box>
                    <Typography variant="body1" color="primary">
                      ${(item.price * item.quantity).toFixed(2)}
                    </Typography>
                  </Box>
                  {index < order.items.length - 1 && <Divider />}
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Order Notes */}
        {order.notes && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Order Notes
                </Typography>
                <Typography variant="body1">
                  {order.notes}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default OrderDetail; 