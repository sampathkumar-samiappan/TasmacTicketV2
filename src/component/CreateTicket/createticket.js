import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  MenuItem,
  Box,
  Typography,
  Paper,
} from '@mui/material';
import {BASE_URL} from "../API Config/config";

const priorities = ['Low', 'Medium', 'High', 'Critical'];


const CreateTicketForm = () => {

  const [categories, setCategories] = useState([]);
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const params = new URLSearchParams({
          "fields": JSON.stringify(["*"]),
          "limit_page_length": "100"
        });


        const response = await fetch(`${BASE_URL}/api/resource/Ticket Category?${params.toString()}`, {
          method: 'GET',
          headers: {
            "Authorization": `Basic ${btoa('e83e516ccf13a60' + ":" + 'bfc4a5bef2aaf8e')}`,
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
        });

        const data = await response.json();
        if (data.data) {
          const categoryNames = data.data.map((cat) => cat.category_name);
          setCategories(categoryNames);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };

    fetchCategories();
  }, []);


  const [formData, setFormData] = useState({
    requester_name: '',
    email: '',
    description: '',
    category: 'Technical',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log(formData)
      const response = await fetch('${BASE_URL}/api/method/ticket_submit', {
        method: 'POST',
        headers: {
          "Authorization": `Basic ${btoa('e83e516ccf13a60' + ":" + 'bfc4a5bef2aaf8e')}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        },

        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Ticket submitted successfully!');
        setFormData({
          requester_name: '',
          email: '',
          description: '',
          category: '',
        });
      } else {
        alert('Error submitting ticket');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong.');
    }
  };

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        bgcolor: '#f5f5f5',
        px: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          px: 3,
          py: 2,
          width: '100%',
          maxWidth: 500,
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <Box display="flex" justifyContent="center" mb={2}>
          <img src="/logo.png" alt="Logo" style={{ height: 40 }} />
        </Box>

        <Typography variant="h6" align="center" gutterBottom>
          Create Helpdesk Ticket
        </Typography>

        <Box component="form" onSubmit={handleSubmit} noValidate autoComplete="off">
          <TextField
            fullWidth
            margin="dense"
            label="Name"
            name="requester_name"
            value={formData.requester_name}
            onChange={handleChange}
            required
          />
          <TextField
            fullWidth
            margin="dense"
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <TextField
            fullWidth
            margin="dense"
            label="Issue Category"
            name="category"
            select
            value={formData.category}
            onChange={handleChange}
            required
          >
            {categories.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            margin="dense"
            label="Description"
            name="description"
            multiline
            rows={3}
            value={formData.description}
            onChange={handleChange}
            required
          />

          <Button
            variant="contained"
            color="primary"
            type="submit"
            fullWidth
            sx={{ mt: 2 }}
          >
            Submit
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default CreateTicketForm;
