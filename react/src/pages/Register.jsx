import { useState, useMemo } from 'react';
import './Register.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Register() {
   const navigate = useNavigate();

   const [form, setForm] = useState({
      username: '',
      email: '',
      firstName: '',
      lastName: '',
      password: '',
      showPassword: false,
   });

   const [submitted, setSubmitted] = useState(null);
   const [touched, setTouched] = useState({});
   const [errorsFromServer, setErrorsFromServer] = useState(null);

   // Compute validation errors
   const errors = useMemo(() => {
      const e = {};
      if (!form.username.trim()) e.username = 'Username required';
      if (!form.email.trim()) e.email = 'Email required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email';
      if (!form.firstName.trim()) e.firstName = 'First name required';
      if (!form.lastName.trim()) e.lastName = 'Last name required';
      if (!form.password) e.password = 'Password required';
      else if (form.password.length < 6) e.password = 'Min 6 chars';
      return e;
   }, [form]);

   const isValid = Object.keys(errors).length === 0;

   // Handle input change
   function handleChange(e) {
      const { name, value } = e.target;
      setForm(f => ({ ...f, [name]: value }));
   }

   // Handle blur for touched fields
   function handleBlur(e) {
      const { name } = e.target;
      setTouched(t => ({ ...t, [name]: true }));
   }

   function togglePassword() {
      setForm(f => ({ ...f, showPassword: !f.showPassword }));
   }

   // Handle form submission
   async function handleSubmit(e) {
      e.preventDefault();

      // Mark all fields touched for validation
      setTouched({
         username: true,
         email: true,
         firstName: true,
         lastName: true,
         password: true,
      });

      // Reset server errors
      setErrorsFromServer(null);

      if (!isValid) return;

      try {
         const payload = {
            userName: form.username.trim(),
            email: form.email.trim(),
            fullName: {
               firstName: form.firstName.trim(),
               lastName: form.lastName.trim(),
            },
            password: form.password,
         };

         setSubmitted(payload); 

         const response = await axios.post(
            'http://localhost:8080/api/auth/register',
            payload,
            { withCredentials: true }
         );

         console.log('Server response:', response.data);
         navigate('/home');
      } catch (err) {
         console.error(err.response?.data || err.message);
         if (err.response?.data) {
            setErrorsFromServer(err.response.data);
         }
      }
   }


   return (
      <div className="register-wrapper">
         <div className="register-container">
            <header className="register-heading">
               <h1>Create your account</h1>
               <p>Join us. It only takes a minute.</p>
            </header>

            <form className="form-card" onSubmit={handleSubmit} noValidate>
               <div className="form-grid">
                  {/* Username */}
                  <div className="field">
                     <label htmlFor="username">Username</label>
                     <div className="input-shell">
                        <input
                           id="username"
                           name="username"
                           type="text"
                           placeholder="e.g. johndoe"
                           value={form.username}
                           onChange={handleChange}
                           onBlur={handleBlur}
                           aria-invalid={!!errors.username}
                           aria-describedby={errors.username ? 'err-username' : undefined}
                        />
                     </div>
                     {touched.username && errors.username && (
                        <small id="err-username" style={{ color: 'var(--color-danger)' }}>
                           {errors.username}
                        </small>
                     )}
                  </div>

                  {/* Email */}
                  <div className="field">
                     <label htmlFor="email">Email</label>
                     <div className="input-shell">
                        <input
                           id="email"
                           name="email"
                           type="email"
                           placeholder="you@example.com"
                           value={form.email}
                           onChange={handleChange}
                           onBlur={handleBlur}
                           aria-invalid={!!errors.email}
                           aria-describedby={errors.email ? 'err-email' : undefined}
                        />
                     </div>
                     {touched.email && errors.email && (
                        <small id="err-email" style={{ color: 'var(--color-danger)' }}>
                           {errors.email}
                        </small>
                     )}
                  </div>

                  {/* First & Last Name */}
                  <div className="form-grid two-col">
                     <div className="field">
                        <label htmlFor="firstName">First Name</label>
                        <div className="input-shell">
                           <input
                              id="firstName"
                              name="firstName"
                              type="text"
                              placeholder="John"
                              value={form.firstName}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              aria-invalid={!!errors.firstName}
                              aria-describedby={errors.firstName ? 'err-firstName' : undefined}
                           />
                        </div>
                        {touched.firstName && errors.firstName && (
                           <small id="err-firstName" style={{ color: 'var(--color-danger)' }}>
                              {errors.firstName}
                           </small>
                        )}
                     </div>

                     <div className="field">
                        <label htmlFor="lastName">Last Name</label>
                        <div className="input-shell">
                           <input
                              id="lastName"
                              name="lastName"
                              type="text"
                              placeholder="Doe"
                              value={form.lastName}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              aria-invalid={!!errors.lastName}
                              aria-describedby={errors.lastName ? 'err-lastName' : undefined}
                           />
                        </div>
                        {touched.lastName && errors.lastName && (
                           <small id="err-lastName" style={{ color: 'var(--color-danger)' }}>
                              {errors.lastName}
                           </small>
                        )}
                     </div>
                  </div>

                  {/* Password */}
                  <div className="field">
                     <label htmlFor="password">Password</label>
                     <div className="input-shell">
                        <input
                           id="password"
                           name="password"
                           type={form.showPassword ? 'text' : 'password'}
                           placeholder="••••••"
                           value={form.password}
                           onChange={handleChange}
                           onBlur={handleBlur}
                           aria-invalid={!!errors.password}
                           aria-describedby={errors.password ? 'err-password' : undefined}
                        />
                        <button
                           type="button"
                           className="password-toggle"
                           onClick={togglePassword}
                           aria-label={form.showPassword ? 'Hide password' : 'Show password'}
                        >
                           {form.showPassword ? 'Hide' : 'Show'}
                        </button>
                     </div>
                     {touched.password && errors.password && (
                        <small id="err-password" style={{ color: 'var(--color-danger)' }}>
                           {errors.password}
                        </small>
                     )}
                  </div>
               </div>

               {/* Server error */}
               {errorsFromServer && (
                  <div style={{ color: 'var(--color-danger)', marginTop: '0.5rem' }}>
                     {typeof errorsFromServer === 'string' ? errorsFromServer : JSON.stringify(errorsFromServer)}
                  </div>
               )}

               <div className="actions">
                  <button className="submit-btn" disabled={!isValid} type="submit">
                     Create Account
                  </button>
                  {submitted && (
                     <div className="helper-row">
                        <small style={{ color: 'var(--color-text-dim)' }}>
                           Submitted payload preview (for debug):
                        </small>
                     </div>
                  )}
               </div>
            </form>

            {submitted && (
               <div className="json-preview-wrapper" style={{ marginTop: 'var(--space-6)' }}>
                  <strong style={{ color: 'var(--color-text-dim)', fontWeight: 600 }}>Last submitted:</strong>
                  <pre style={{ margin: 0 }}>{JSON.stringify(submitted, null, 2)}</pre>
               </div>
            )}

            <footer className="register-footer">© {new Date().getFullYear()} Your Company. All rights reserved.</footer>
         </div>
      </div>
   );
}
