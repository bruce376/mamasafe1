#!/usr/bin/env python3
"""
Mamasafe API Testing Suite
Tests the Mamasafe health chatbot API endpoints using Python
"""

import requests
import json
import time
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class MamasafeAPITester:
    def __init__(self, base_url="http://localhost:5000"):
        self.base_url = base_url
        self.session = requests.Session()
        
    def test_health_chatbot(self, message, user_context=None):
        """Test the Mamasafe health chatbot API endpoint"""
        print(f"🤖 Testing health chatbot with message: '{message}'")
        
        endpoint = f"{self.base_url}/api/mamasafe-chat"
        payload = {
            "message": message,
            "userContext": user_context or {}
        }
        
        try:
            response = self.session.post(
                endpoint,
                json=payload,
                headers={"Content-Type": "application/json"}
            )
            
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                reply = data.get('reply', 'No response received')
                print(f"✅ Response: {reply[:200]}...")
                return True
            else:
                print(f"❌ Error: {response.status_code} - {response.text}")
                return False
                
        except requests.exceptions.RequestException as e:
            print(f"❌ Connection Error: {e}")
            return False
    
    def test_server_status(self):
        """Test if the server is running"""
        print("🔍 Testing server status...")
        
        try:
            response = self.session.get(f"{self.base_url}/")
            print(f"✅ Server is running (Status: {response.status_code})")
            return True
        except requests.exceptions.RequestException as e:
            print(f"❌ Server not accessible: {e}")
            return False
    
    def run_comprehensive_tests(self):
        """Run a comprehensive test suite"""
        print("🧪 Starting Mamasafe API Test Suite")
        print("=" * 50)
        
        # Test server status
        if not self.test_server_status():
            print("❌ Server is not running. Please start the server first.")
            return False
        
        print("\n📋 Testing Health Chatbot API...")
        
        # Test cases
        test_cases = [
            {
                "message": "pregnancy symptoms",
                "context": {"pregnancyWeek": 12},
                "description": "Pregnancy symptoms query"
            },
            {
                "message": "baby care tips",
                "context": {"babyAge": 3},
                "description": "Baby care query"
            },
            {
                "message": "nutrition advice",
                "context": {},
                "description": "General nutrition query"
            },
            {
                "message": "emergency bleeding",
                "context": {"pregnancyWeek": 20},
                "description": "Emergency situation"
            },
            {
                "message": "hello",
                "context": {},
                "description": "Simple greeting"
            }
        ]
        
        results = []
        for i, test_case in enumerate(test_cases, 1):
            print(f"\n{i}. {test_case['description']}")
            success = self.test_health_chatbot(
                test_case['message'], 
                test_case['context']
            )
            results.append(success)
            time.sleep(1)  # Small delay between requests
        
        # Summary
        print("\n" + "=" * 50)
        passed = sum(results)
        total = len(results)
        print(f"📊 Test Results: {passed}/{total} tests passed")
        
        if passed == total:
            print("🎉 All tests passed! API is working correctly.")
        else:
            print(f"⚠️  {total - passed} tests failed. Check the logs above.")
        
        return passed == total

def main():
    """Main function to run tests"""
    tester = MamasafeAPITester()
    
    print("Mamasafe API Testing Suite")
    print("Make sure the Mamasafe server is running on http://localhost:5000")
    print()
    
    # Run tests
    success = tester.run_comprehensive_tests()
    
    if success:
        print("\n✅ All tests completed successfully!")
    else:
        print("\n❌ Some tests failed. Please check the server and API configuration.")

if __name__ == "__main__":
    main()
