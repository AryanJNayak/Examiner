import React, { useState } from 'react';
import { Link, redirect, useNavigate } from 'react-router-dom';

const Signup = () => {
  const [form, setForm] = useState({
    role: 'student',
    id: '', // generic id field
    name: '',
    email: '',
    password: '',
    contact: ''
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Prepare payload with correct id field
    let payload = {
      role: form.role,
      name: form.name,
      email: form.email,
      password: form.password,
      contact: form.contact
    };
    if (form.role === 'student') {
      payload.student_id = form.id;
    } else if (form.role === 'teacher') {
      payload.teacher_id = form.id;
    } else if (form.role === 'admin') {
      payload.admin_id = form.id;
    }
    try {
      const res = await fetch('http://localhost:8000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setMessage(data.message);
      // or data.success === true if your API returns it
      if (res.ok) {
        navigate('/login', { state: { message: 'User created successfully' } }); 
      } else {
        setMessage(data.message || 'Signup failed');
      }
    } catch (err) {
      setMessage('Signup failed');
    }
  };

  return (
    <div className='container mt-5' style={{ maxWidth: '600px' }}>
      <h2 className='text-center mb-4'>Signup</h2>
      {/* Message display */}
      {message && <div className='alert alert-info mt-3'>{message}</div>}
      <form onSubmit={handleSubmit}>
        {/* Role selection */}
        <div className='mb-3'>
          <label htmlFor='role' className='form-label'>
            Select Role
          </label>
          <select className='form-select' id='role' name='role' value={form.role} onChange={handleChange}>
            <option value='student'>Student</option>
            <option value='teacher'>Teacher</option>
            <option value='admin'>Admin</option>
          </select>
        </div>

        {/* ID input, label changes by role */}
        <div className='mb-3'>
          <label htmlFor='id' className='form-label'>
            {form.role === 'student' && 'Student ID'}
            {form.role === 'teacher' && 'Teacher ID'}
            {form.role === 'admin' && 'Admin ID'}
          </label>
          <input
            type='text'
            className='form-control'
            id='id'
            name='id'
            placeholder={form.role.charAt(0).toUpperCase() + form.role.slice(1) + ' ID'}
            value={form.id}
            onChange={handleChange}
            required
          />
        </div>

        {/* Name */}
        <div className='mb-3'>
          <label htmlFor='name' className='form-label'>
            Name
          </label>
          <input
            type='text'
            className='form-control'
            id='name'
            name='name'
            placeholder='Full Name'
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>

        {/* Email */}
        <div className='mb-3'>
          <label htmlFor='email' className='form-label'>
            Email address
          </label>
          <input
            type='email'
            className='form-control'
            id='email'
            name='email'
            placeholder='Enter email'
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        {/* Password */}
        <div className='mb-3'>
          <label htmlFor='password' className='form-label'>
            Password
          </label>
          <input
            type='password'
            className='form-control'
            id='password'
            name='password'
            placeholder='Password'
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>

        {/* Contact */}
        <div className='mb-3'>
          <label htmlFor='contact' className='form-label'>
            Contact
          </label>
          <input
            type='text'
            className='form-control'
            id='contact'
            name='contact'
            placeholder='Phone number'
            value={form.contact}
            onChange={handleChange}
            required
          />
        </div>

        {/* Submit button */}
        <button type='submit' className='btn btn-success w-100'>
          Signup
        </button>
      </form>

      <div className='text-center mt-3'>
        Already have an account? <Link to='/login'>Login here</Link>
      </div>
    </div>
  );
};

export default Signup;
