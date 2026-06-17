import React from 'react';

function AdminLogin({
  loginUsername,
  setLoginUsername,
  loginPassword,
  setLoginPassword,
  loginError,
  loginLoading,
  handleLogin
}) {
  return (
    <>
      <div className="glow-bg"></div>
      <header style={{ marginBottom: '1rem' }}>
        <h1>Restricted Area</h1>
        <p className="subtitle">Log in to manage NextHouseIstant stickers</p>
      </header>
      <main className="container" style={{ alignItems: 'center' }}>
        <form onSubmit={handleLogin} className="admin-card">
          <h2 className="admin-title">Admin Login</h2>
          
          <div className="form-group">
            <label className="form-label" htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              className="form-input"
              placeholder="Username"
              value={loginUsername}
              onChange={(e) => setLoginUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              className="form-input"
              placeholder="Password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              required
            />
          </div>

          {loginError && (
            <div style={{ color: '#ef4444', fontSize: '0.9rem', textAlign: 'center', marginTop: '0.25rem' }}>
              {loginError}
            </div>
          )}

          <button type="submit" className="btn btn-download" style={{ marginTop: '1rem' }} disabled={loginLoading}>
            {loginLoading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
      </main>
      <footer>
        &copy; 2026 NextHouseIstant. All rights reserved.
      </footer>
    </>
  );
}

export default AdminLogin;
