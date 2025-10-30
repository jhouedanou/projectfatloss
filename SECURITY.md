# Security Notes

## Password Protection

### Current Implementation

The history viewer is protected by a password configured via environment variables. This is a **simplified implementation** suitable for local use only.

**File:** `src/config/auth.js`
**Environment Variable:** `VITE_HISTORY_PASSWORD`

### Configuration

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Set your password in `.env`:
   ```
   VITE_HISTORY_PASSWORD=your_secure_password
   ```

3. **Important:** Never commit `.env` to version control. It's already included in `.gitignore`.

### Limitations

This client-side password protection has several limitations:

- ⚠️ The password is embedded in the client-side JavaScript bundle
- ⚠️ Anyone with browser dev tools can bypass the check
- ⚠️ No rate limiting or brute-force protection
- ⚠️ No server-side validation

### For Production Use

For a secure production environment, you should implement:

1. **Backend Authentication**
   - Use a proper authentication server (Node.js, Python, etc.)
   - Implement JWT or session-based authentication
   - Hash passwords with bcrypt or similar

2. **HTTPS**
   - Always use HTTPS in production
   - Obtain SSL certificates (Let's Encrypt is free)

3. **API Security**
   - Implement rate limiting
   - Add CSRF protection
   - Use secure session management

4. **Database**
   - Store data in a proper database
   - Never store passwords in plain text
   - Use prepared statements to prevent SQL injection

### Example Secure Flow

```
User → Login Form → Backend API → Verify Password (hashed)
                                  ↓
                          Generate JWT Token
                                  ↓
                          Return Token to Client
                                  ↓
                    Store Token (httpOnly cookie)
                                  ↓
           Subsequent Requests Include Token
                                  ↓
                    Backend Verifies Token
                                  ↓
                    Return Protected Data
```

## Data Storage

Currently, all data is stored in browser localStorage:
- Workout history
- Weight history
- Statistics

This means:
- ✅ Data stays on the device (privacy)
- ✅ Works offline
- ⚠️ Data can be lost if browser cache is cleared
- ⚠️ No automatic backup
- ⚠️ Manual export/import required for sync

## Recommendations

For personal use, this implementation is acceptable if:
- You trust the device
- You regularly export backups
- You understand the limitations

For production/public use, implement:
- Server-side authentication
- Database storage
- Automatic backups
- HTTPS encryption
- Proper user management
