import { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocationOn as LocationIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { addressAPI } from '../services/api';

const validationSchema = Yup.object({
  street: Yup.string().required('Street address is required'),
  city: Yup.string().required('City is required'),
  state: Yup.string().required('State is required'),
  zip_code: Yup.string().required('ZIP code is required'),
  label: Yup.string().required('Address label is required'),
});

const Addresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await addressAPI.getAddresses();
      setAddresses(response.data.addresses || []);
    } catch (error) {
      console.error('Error fetching addresses:', error);
      setError('Failed to load addresses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      street: '',
      city: '',
      state: '',
      zip_code: '',
      label: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setFormLoading(true);
      setError('');
      setSuccess('');

      try {
        if (editingAddress) {
          await addressAPI.updateAddress(editingAddress.id, values);
          setSuccess('Address updated successfully!');
        } else {
          await addressAPI.addAddress(values);
          setSuccess('Address added successfully!');
        }
        
        setDialogOpen(false);
        setEditingAddress(null);
        formik.resetForm();
        fetchAddresses();
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to save address');
      } finally {
        setFormLoading(false);
      }
    },
  });

  const handleEdit = (address) => {
    setEditingAddress(address);
    formik.setValues({
      street: address.street,
      city: address.city,
      state: address.state,
      zip_code: address.zip_code,
      label: address.label,
    });
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingAddress(null);
    formik.resetForm();
    setDialogOpen(true);
  };

  const handleDelete = async (addressId) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        await addressAPI.deleteAddress(addressId);
        setSuccess('Address deleted successfully!');
        fetchAddresses();
      } catch (error) {
        setError('Failed to delete address');
      }
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      await addressAPI.setDefaultAddress(addressId);
      setSuccess('Default address updated!');
      fetchAddresses();
    } catch (error) {
      setError('Failed to set default address');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          My Addresses
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAdd}
        >
          Add Address
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      {addresses.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <LocationIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No addresses saved
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Add your delivery addresses to make ordering easier
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={handleAdd}
            startIcon={<AddIcon />}
          >
            Add Your First Address
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {addresses.map((address) => (
            <Grid item xs={12} md={6} key={address.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="h6">
                          {address.label}
                        </Typography>
                        {address.is_default && (
                          <Chip
                            icon={<StarIcon />}
                            label="Default"
                            color="primary"
                            size="small"
                          />
                        )}
                      </Box>
                      <Typography variant="body1" paragraph>
                        {address.street}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {address.city}, {address.state} {address.zip_code}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(address)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(address.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {!address.is_default && (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleSetDefault(address.id)}
                      >
                        Set as Default
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Add/Edit Address Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingAddress ? 'Edit Address' : 'Add New Address'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="label"
                  name="label"
                  label="Address Label (e.g., Home, Work)"
                  value={formik.values.label}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.label && Boolean(formik.errors.label)}
                  helperText={formik.touched.label && formik.errors.label}
                  disabled={formLoading}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="street"
                  name="street"
                  label="Street Address"
                  value={formik.values.street}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.street && Boolean(formik.errors.street)}
                  helperText={formik.touched.street && formik.errors.street}
                  disabled={formLoading}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="city"
                  name="city"
                  label="City"
                  value={formik.values.city}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.city && Boolean(formik.errors.city)}
                  helperText={formik.touched.city && formik.errors.city}
                  disabled={formLoading}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="state"
                  name="state"
                  label="State"
                  value={formik.values.state}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.state && Boolean(formik.errors.state)}
                  helperText={formik.touched.state && formik.errors.state}
                  disabled={formLoading}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="zip_code"
                  name="zip_code"
                  label="ZIP Code"
                  value={formik.values.zip_code}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.zip_code && Boolean(formik.errors.zip_code)}
                  helperText={formik.touched.zip_code && formik.errors.zip_code}
                  disabled={formLoading}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={formLoading}>
            Cancel
          </Button>
          <Button
            onClick={formik.handleSubmit}
            variant="contained"
            disabled={formLoading}
          >
            {formLoading ? <CircularProgress size={20} /> : (editingAddress ? 'Update' : 'Add')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Addresses; 