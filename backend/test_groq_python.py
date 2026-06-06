#!/usr/bin/env python3
"""
Test Groq API with Python requests
Direct API testing using the user's provided approach
"""

import requests
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_groq_python():
    print("🧪 Testing Groq API with Python requests")
    print("=" * 50)
    
    # Get API key
    api_key = os.environ.get("GROQ_API_KEY")
    
    if not api_key:
        print("❌ GROQ_API_KEY not found in environment")
        return False
    
    print(f"🔑 API Key: {api_key[:10]}...{api_key[-10:]}")
    
    # API endpoint
    url = "https://api.groq.com/openai/v1/models"
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    try:
        print("📋 Getting available models...")
        response = requests.get(url, headers=headers)
        
        print(f"🌐 Status Code: {response.status_code}")
        
        if response.status_code == 200:
            models = response.json()
            print("✅ Available models:")
            
            for model in models.get('data', []):
                model_id = model.get('id', 'Unknown')
                print(f"  - {model_id}")
            
            # Test a working model
            working_models = [
                'llama3-70b-8192',
                'mixtral-8x7b-32768',
                'gemma-7b-it'
            ]
            
            for model in working_models:
                if model in [m.get('id') for m in models.get('data', [])]:
                    print(f"\n🚀 Testing model: {model}")
                    test_model(model, api_key)
                    break
                    
        else:
            print(f"❌ Error: {response.status_code}")
            print(f"📝 Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Exception: {e}")
        return False

def test_model(model_name, api_key):
    """Test a specific model with a health query"""
    print(f"🤱 Testing {model_name} with health query...")
    
    url = "https://api.groq.com/openai/v1/chat/completions"
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": model_name,
        "messages": [
            {
                "role": "system",
                "content": """You are Mamasafe Health Assistant, a specialized AI health companion for pregnant women, new mothers, and families. 

IMPORTANT GUIDELINES:
1. Always provide a medical disclaimer
2. Be empathetic and supportive
3. Never provide definitive diagnoses
4. Focus on evidence-based information
5. For emergencies, advise seeking immediate medical attention

Remember: Your goal is to support and inform, never to replace professional medical care."""
            },
            {
                "role": "user",
                "content": "I'm 12 weeks pregnant and experiencing morning sickness. What can help?"
            }
        ],
        "max_tokens": 500,
        "temperature": 0.7
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload)
        
        print(f"🌐 Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if 'choices' in data and len(data['choices']) > 0:
                text = data['choices'][0]['message']['content']
                print(f"✅ Response: {text[:100]}...")
                return True
            else:
                print("❌ No response content")
                return False
        else:
            print(f"❌ Error: {response.status_code}")
            print(f"📝 Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Exception: {e}")
        return False

if __name__ == "__main__":
    test_groq_python()
