# Google Support Report

This file previously contained API keys and credentials for debugging purposes.

**All credentials have been removed for security reasons (CWE-798).**

## How to configure Google API credentials

1. Store all API keys in the `.env` file:
   ```
   GOOGLE_API_KEY=your_key_here
   GOOGLE_CLIENT_ID=your_client_id_here
   GOOGLE_CLIENT_SECRET=your_secret_here
   ```

2. Never commit API keys to version control.

3. Add `.env` to `.gitignore`.

4. For production, use Google Secret Manager or environment variables.

## References
- [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
- [Google Secret Manager](https://cloud.google.com/secret-manager)
