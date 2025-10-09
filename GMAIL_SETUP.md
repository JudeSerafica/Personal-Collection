# Gmail SMTP Setup Guide

## Step 1: Enable 2-Factor Authentication on Gmail

1. Go to your Google Account: https://myaccount.google.com/
2. Click on **Security** (left sidebar)
3. Under "Signing in to Google", click **2-Step Verification**
4. Follow the steps to enable 2FA if not already enabled

## Step 2: Generate App Password

1. After enabling 2FA, go back to **Security**
2. Under "Signing in to Google", click **App passwords**
   - Or directly visit: https://myaccount.google.com/apppasswords
3. You may need to sign in again
4. Under "Select app", choose **Mail**
5. Under "Select device", choose **Other (Custom name)**
6. Type a name like: `NextJS App` or `Signup Verification`
7. Click **Generate**
8. Google will show you a 16-character password (e.g., `abcd efgh ijkl mnop`)
9. **Copy this password** - you won't be able to see it again!

## Step 3: Add to Environment Variables

1. Create or edit `.env.local` file in your project root:

```env
# Gmail SMTP Configuration
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=abcdefghijklmnop
```

**Important:**
- Replace `your-email@gmail.com` with your actual Gmail address
- Replace `abcdefghijklmnop` with the 16-character app password (remove spaces)
- Do NOT use your regular Gmail password!

## Step 4: Restart Your Development Server

```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

## Step 5: Test the Signup

1. Go to your signup page
2. Enter an email and password
3. Check your Gmail inbox for the verification code
4. The code should arrive within seconds!

## Troubleshooting

### "Invalid login" error
- Make sure 2FA is enabled on your Gmail account
- Double-check the app password (no spaces)
- Make sure you're using the app password, not your regular password

### Email not arriving
- Check your spam/junk folder
- Verify the GMAIL_USER email is correct
- Check the server console for error messages

### "Less secure app access" error
- This shouldn't happen with App Passwords
- Make sure you're using an App Password, not your regular password

## Security Notes

- Never commit `.env.local` to Git (it's already in `.gitignore`)
- Never share your app password
- You can revoke app passwords anytime from Google Account settings
- Each app should have its own app password
