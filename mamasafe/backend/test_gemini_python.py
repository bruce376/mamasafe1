#!/usr/bin/env python3
"""
Gemini API Testing with Python
Direct testing of Gemini API to diagnose issues
"""

import requests
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class GeminiAPITester:
    def __init__(self):
        self.api_key = os.getenv('GEMINI_API_KEY')
        self.base_url = "https://generativelanguage.googleapis.com"
        
    def test_api_key_validity(self):
        """Test if the API key is valid by checking basic endpoint"""
        print("🔑 Testing API key validity...")
        
        if not self.api_key:
            print("❌ No API key found in .env file")
            return False
            
        print(f"📋 API Key: {self.api_key[:10]}...{self.api_key[-10:]}")
        print(f"📏 Length: {len(self.api_key)} characters")
        
        # Test with a simple endpoint that doesn't require model
        try:
            url = f"{self.base_url}/v1beta/models?key={self.api_key}"
            response = requests.get(url)
            
            print(f"🌐 Status Code: {response.status_code}")
            
            if response.status_code == 200:
                models = response.json()
                print(f"✅ API key is valid!")
                print(f"📊 Available models: {len(models.get('models', []))}")
                
                # Show available models
                for model in models.get('models', []):
                    name = model.get('name', '').split('/')[-1]
                    display_name = model.get('displayName', name)
                    print(f"  - {display_name} ({name})")
                
                return True
            else:
                print(f"❌ API key error: {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"📝 Error details: {error_data}")
                except:
                    print(f"📝 Response: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Connection error: {e}")
            return False
    
    def test_model_endpoint(self, model_name):
        """Test a specific model endpoint"""
        print(f"\n🤖 Testing model: {model_name}")
        
        url = f"{self.base_url}/v1beta/models/{model_name}:generateContent?key={self.api_key}"
        
        payload = {
            "contents": [{
                "parts": [{
                    "text": "Hello, please respond with 'API working' if you can understand this."
                }]
            }],
            "generationConfig": {
                "temperature": 0.7,
                "maxOutputTokens": 100
            }
        }
        
        try:
            response = requests.post(url, json=payload)
            print(f"🌐 Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                if 'candidates' in data and len(data['candidates']) > 0:
                    text = data['candidates'][0]['content']['parts'][0]['text']
                    print(f"✅ Response: {text}")
                    return True
                else:
                    print(f"❌ No response content")
                    print(f"📝 Response: {data}")
                    return False
            else:
                print(f"❌ Error: {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"📝 Error details: {error_data}")
                except:
                    print(f"📝 Response: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Request error: {e}")
            return False
    
    def test_vertex_ai_endpoint(self):
        """Test Vertex AI endpoint as alternative"""
        print(f"\n🔧 Testing Vertex AI endpoint...")
        
        # Try Vertex AI format
        project_id = "mamasafe-495117"
        model_name = "gemini-1.5-pro"
        
        url = f"https://us-central1-aiplatform.googleapis.com/v1/projects/{project_id}/locations/us-central1/publishers/google/models/{model_name}:generateContent?key={self.api_key}"
        
        payload = {
            "contents": [{
                "parts": [{
                    "text": "Hello, please respond with 'Vertex AI working' if you can understand this."
                }]
            }]
        }
        
        try:
            response = requests.post(url, json=payload)
            print(f"🌐 Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                if 'candidates' in data and len(data['candidates']) > 0:
                    text = data['candidates'][0]['content']['parts'][0]['text']
                    print(f"✅ Vertex AI Response: {text}")
                    return True
                else:
                    print(f"❌ No response content")
                    print(f"📝 Response: {data}")
                    return False
            else:
                print(f"❌ Vertex AI Error: {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"📝 Error details: {error_data}")
                except:
                    print(f"📝 Response: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Vertex AI Request error: {e}")
            return False
    
    def run_comprehensive_test(self):
        """Run comprehensive Gemini API testing"""
        print("🧪 Gemini API Comprehensive Test Suite")
        print("=" * 50)
        
        # Test 1: API Key Validity
        if not self.test_api_key_validity():
            print("\n❌ API key is invalid. Cannot proceed with model testing.")
            return False
        
        # Test 2: Common Model Names
        common_models = [
            "gemini-1.5-pro",
            "gemini-1.5-flash", 
            "gemini-pro",
            "gemini-1.0-pro",
            "text-bison-001",
            "chat-bison-001"
        ]
        
        working_models = []
        for model in common_models:
            if self.test_model_endpoint(model):
                working_models.append(model)
        
        # Test 3: Vertex AI Alternative
        vertex_working = self.test_vertex_ai_endpoint()
        
        # Summary
        print("\n" + "=" * 50)
        print("📊 Test Results Summary:")
        print(f"✅ API Key: Valid")
        print(f"🤖 Working Models: {len(working_models)}")
        if working_models:
            for model in working_models:
                print(f"  - {model}")
        print(f"🔧 Vertex AI: {'Working' if vertex_working else 'Not Working'}")
        
        # Recommendations
        print("\n💡 Recommendations:")
        if working_models:
            print("✅ Use one of the working models in your Node.js application")
            print(f"📝 Update model name in healthChatbot.js to: {working_models[0]}")
        else:
            print("❌ No working models found. Check:")
            print("  - API key permissions")
            print("  - Service account status")
            print("  - Generative Language API enabled")
        
        if vertex_working:
            print("✅ Consider using Vertex AI endpoint as alternative")
        
        return len(working_models) > 0 or vertex_working

def main():
    """Main function to run Gemini API tests"""
    print("🤖 Gemini API Python Testing Suite")
    print("Testing direct API connectivity to diagnose issues")
    print()
    
    tester = GeminiAPITester()
    success = tester.run_comprehensive_test()
    
    if success:
        print("\n🎉 Gemini API is working! Update your Node.js configuration.")
    else:
        print("\n❌ Gemini API issues detected. Check API key configuration.")

if __name__ == "__main__":
    main()
