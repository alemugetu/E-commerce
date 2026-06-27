import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';

import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const Register = () => {
  const navigate = useNavigate();
  
  // 1. Expanded Form State to match your Django controller inputs
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    addresse: '', // Spelled with an extra 'e' to mirror your Django variable exactly
    password: '',
    confirm_password: '',
  });

  const [localError, setLocalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    
    // Frontend structural validation
    if (!formData.email || !formData.password) {
      setLocalError('Email and password fields are strictly required.');
      return;
    }

    if (formData.password !== formData.confirm_password) {
      setLocalError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 8) {
      setLocalError('Password must contain a minimum of 8 characters.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 2. Map payload keys perfectly to match request.data.get() rules in Django
      await api.post('/auth/register/', {
        email: formData.email,
        password: formData.password,
        phone_number: formData.phone_number || null,
        first_name: formData.first_name,
        last_name: formData.last_name,
        addresse: formData.addresse || null, 
      });

      navigate('/login', { 
        state: { message: "Account created successfully! Please sign in." } 
      });

    } catch (error) {
      // 3. FIX: Read error.response.data.error directly from your backend's return payload
      const errorMsg = error.response?.data?.error 
        || error.response?.data?.detail 
        || "Failed to create account. Please try again.";
      setLocalError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center py-12">
      <Card className="w-full max-w-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Create an Account</h2>
          <p className="text-slate-500 text-sm mt-2">Join STORE.ET to manage your orders and profile.</p>
        </div>

        {localError && (
          <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700 font-medium text-center">
            {localError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* First Name & Last Name Grid Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input 
              label="First Name"
              name="first_name"
              type="text"
              placeholder="Abebe"
              value={formData.first_name}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            <Input 
              label="Last Name"
              name="last_name"
              type="text"
              placeholder="Kebede"
              value={formData.last_name}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>

          <Input 
            label="Email Address *"
            name="email"
            type="email"
            placeholder="name@example.com"
            value={formData.email}
            onChange={handleChange}
            disabled={isSubmitting}
          />

          {/* Phone Number Input Field */}
          <Input 
            label="Phone Number"
            name="phone_number"
            type="text"
            placeholder="+251 911..."
            value={formData.phone_number}
            onChange={handleChange}
            disabled={isSubmitting}
          />

          {/* Delivery Address Input Field */}
          <Input 
            label="Delivery Address"
            name="addresse"
            type="text"
            placeholder="Sub-City, District, House No."
            value={formData.addresse}
            onChange={handleChange}
            disabled={isSubmitting}
          />
          
          {/* Passwords Grid Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input 
              label="Password *"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            <Input 
              label="Confirm Password *"
              name="confirm_password"
              type="password"
              placeholder="••••••••"
              value={formData.confirm_password}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>

          <Button 
            type="submit" 
            variant="primary" 
            className="w-full mt-6"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating Account...' : 'Register Account'}
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
            Sign in here
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default Register;

