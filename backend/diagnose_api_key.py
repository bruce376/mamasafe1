#!/usr/bin/env python3
"""
API Key Diagnostic Tool
Analyze and diagnose API key issues for Gemini API
"""

import re
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class APIKeyDiagnostic:
    def __init__(self):
        self.api_key = os.getenv('GEMINI_API_KEY')
        
    def analyze_api_key_format(self):
        """Analyze the format and characteristics of the API key"""
        print("🔍 API Key Format Analysis")
        print("=" * 30)
        
        if not self.api_key:
            print("❌ No API key found in .env file")
            return False
        
        # Show only masked key - never print full key
        masked = self.api_key[:6] + "*" * (len(self.api_key) - 10) + self.api_key[-4:]
        print(f"📋 API Key: {masked}")
        print(f"📏 Length: {len(self.api_key)} characters")
        
        # Check different API key formats
        formats = {
            "Google Standard API Key": r"^AIzaSy[A-Za-z0-9_-]{33}$",  # 39 characters starting with AIzaSy
            "Google Service Account Key": r"^[A-Za-z0-9_-]{64,}$",  # Long hex-like string
            "OpenAI API Key": r"^sk-[A-Za-z0-9]{48}$",  # OpenAI format
            "Generic API Key": r"^[A-Za-z0-9_-]{20,}$"  # Generic format
        }
        
        matched_format = None
        for format_name, pattern in formats.items():
            if re.match(pattern, self.api_key):
                matched_format = format_name
                print(f"✅ Format matches: {format_name}")
                break
        
        if not matched_format:
            print(f"❌ Unknown format. Expected patterns:")
            for format_name, pattern in formats.items():
                print(f"  - {format_name}: {pattern}")
        
        return matched_format
    
    def check_google_api_key_requirements(self):
        """Check if API key meets Google API requirements"""
        print("\n🔐 Google API Key Requirements")
        print("=" * 30)
        
        if not self.api_key:
            return False
        
        # Google API keys should start with "AIzaSy" and be 39 characters
        if self.api_key.startswith("AIzaSy"):
            print("✅ Correct Google API key prefix (AIzaSy)")
            
            if len(self.api_key) == 39:
                print("✅ Correct length (39 characters)")
                return True
            else:
                print(f"❌ Incorrect length. Expected 39, got {len(self.api_key)}")
                return False
        else:
            print("❌ Does not start with 'AIzaSy'")
            print("💡 Google API keys should start with 'AIzaSy'")
            return False
    
    def suggest_fixes(self):
        """Suggest fixes based on the analysis"""
        print("\n💡 Suggested Fixes")
        print("=" * 20)
        
        if not self.api_key:
            print("1. Add GEMINI_API_KEY to .env file")
            return
        
        # Check if it's a Google API key
        if not self.api_key.startswith("AIzaSy"):
            print("❌ Current key is not a valid Google API key format")
            print("\n🔧 To fix:")
            print("1. Go to: https://console.cloud.google.com/apis/credentials")
            print("2. Delete the current invalid key")
            print("3. Click '+ CREATE CREDENTIALS' → 'API key'")
            print("4. Copy the new key (should start with 'AIzaSy')")
            print("5. Update the .env file with the new key")
            print("6. Ensure 'Generative Language API' is enabled")
            print("7. Test the new key")
        else:
            if len(self.api_key) != 39:
                print("❌ Key length is incorrect")
                print("\n🔧 To fix:")
                print("1. Verify you copied the complete API key")
                print("2. Check for missing characters at start or end")
                print("3. Generate a new API key if needed")
            else:
                print("✅ API key format is correct")
                print("\n🔧 Other checks:")
                print("1. Ensure Generative Language API is enabled")
                print("2. Check API key restrictions")
                print("3. Verify service account status")
    
    def test_environment_setup(self):
        """Test the environment setup"""
        print("\n🌍 Environment Setup Check")
        print("=" * 25)
        
        # Check .env file
        env_file = ".env"
        if os.path.exists(env_file):
            print(f"✅ {env_file} file exists")
            
            with open(env_file, 'r') as f:
                content = f.read()
                if 'GEMINI_API_KEY=' in content:
                    print("✅ GEMINI_API_KEY found in .env")
                else:
                    print("❌ GEMINI_API_KEY not found in .env")
        else:
            print(f"❌ {env_file} file not found")
        
        # Check environment variable
        if os.getenv('GEMINI_API_KEY'):
            print("✅ Environment variable loaded")
        else:
            print("❌ Environment variable not loaded")
    
    def run_diagnostic(self):
        """Run complete diagnostic"""
        print("🩺 API Key Diagnostic Tool")
        print("=" * 40)
        print("Analyzing Gemini API key configuration...")
        print()
        
        # Test environment setup
        self.test_environment_setup()
        
        # Analyze API key format
        format_result = self.analyze_api_key_format()
        
        # Check Google requirements
        google_result = self.check_google_api_key_requirements()
        
        # Suggest fixes
        self.suggest_fixes()
        
        # Summary
        print("\n📊 Diagnostic Summary")
        print("=" * 20)
        
        if format_result == "Google Standard API Key" and google_result:
            print("✅ API key format is correct")
            print("💡 Check:")
            print("  - Generative Language API enabled")
            print("  - API key permissions")
            print("  - Service account status")
        else:
            print("❌ API key format is incorrect")
            print("🔧 Create a new Google API key")
        
        return format_result == "Google Standard API Key" and google_result

def main():
    """Main function to run diagnostic"""
    diagnostic = APIKeyDiagnostic()
    success = diagnostic.run_diagnostic()
    
    if success:
        print("\n🎉 API key format is correct! Check API permissions.")
    else:
        print("\n❌ API key issues found. Follow the suggested fixes.")

if __name__ == "__main__":
    main()
