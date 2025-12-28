# Next-Auth Google SSO Setup Guide

This guide will walk you through setting up Google OAuth authentication with Next-Auth in your application.

## 📋 Prerequisites

- A Google Cloud Platform (GCP) account
- Access to Google Cloud Console
- Your application running locally or deployed

## 🔧 Step-by-Step Setup

### Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select or create a project
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. If prompted, configure the OAuth consent screen:
   - Choose **External** (unless you have a Google Workspace)
   - Fill in the required information:
     - App name: "GitHub Inspector" (or your app name)
     - User support email: Your email
     - Developer contact: Your email
   - Click **Save and Continue**
   - Add scopes: `email`, `profile`, `openid`
   - Add test users (if in testing mode)
   - Click **Save and Continue**
6. For the OAuth client:
   - Application type: **Web application**
   - Name: "GitHub Inspector Web Client"
   - Authorized JavaScript origins:
     - `http://localhost:3000` (for local development)
     - `https://yourdomain.com` (for production)
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (for local development)
     - `https://yourdomain.com/api/auth/callback/google` (for production)
   - Click **Create**
7. Copy the **Client ID** and **Client Secret**

### Step 2: Set Up Environment Variables

1. Create or update `.env.local` in the `github-inspector/` directory
2. Add the following variables:

```env
# Next-Auth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Google OAuth Credentials
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Step 3: Generate NEXTAUTH_SECRET

You can generate a secure secret using one of these methods:

**Option 1: Using OpenSSL (recommended)**
```bash
openssl rand -base64 32
```

**Option 2: Using Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Option 3: Online generator**
Visit: https://generate-secret.vercel.app/32

Copy the generated secret and add it to your `.env.local` file.

### Step 4: Update NEXTAUTH_URL for Production

When deploying to production, update `NEXTAUTH_URL` in your environment variables:

```env
NEXTAUTH_URL=https://yourdomain.com
```

Also make sure to add your production URL to Google OAuth credentials:
- Authorized JavaScript origins: `https://yourdomain.com`
- Authorized redirect URIs: `https://yourdomain.com/api/auth/callback/google`

### Step 5: Restart Your Development Server

After setting up environment variables:

```bash
npm run dev
```

## ✅ Verification

1. Navigate to `http://localhost:3000`
2. You should be redirected to the sign-in page
3. Click "Sign in with Google"
4. Complete the Google OAuth flow
5. You should be redirected back to the homepage
6. Check the sidebar - you should see your profile picture and name
7. Click "Sign Out" to test logout functionality

## 🔒 Security Notes

- **Never commit `.env.local` to version control** - it's already in `.gitignore`
- Keep your `NEXTAUTH_SECRET` secure and unique
- Use different OAuth credentials for development and production
- Regularly rotate secrets in production environments

## 🐛 Troubleshooting

### Error: "Invalid credentials"
- Verify your `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correct
- Check that there are no extra spaces in your `.env.local` file
- Ensure you've restarted the dev server after adding environment variables

### Error: "redirect_uri_mismatch"
- Verify the redirect URI in Google Console matches exactly: `http://localhost:3000/api/auth/callback/google`
- Check that `NEXTAUTH_URL` matches your application URL
- Make sure there are no trailing slashes

### Error: "NEXTAUTH_SECRET is missing"
- Ensure `NEXTAUTH_SECRET` is set in `.env.local`
- Restart your development server after adding it

### Session not persisting
- Check that cookies are enabled in your browser
- Verify `NEXTAUTH_URL` is set correctly
- In production, ensure your domain is using HTTPS

## 📚 Additional Resources

- [Next-Auth Documentation](https://next-auth.js.org/)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Next-Auth Google Provider](https://next-auth.js.org/providers/google)

