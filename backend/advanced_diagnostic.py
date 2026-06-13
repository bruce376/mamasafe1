#!/usr/bin/env python3
"""
Advanced API Diagnostic Tool
Deep analysis of Gemini API blocking issues and solutions
"""

import requests
import json
import os
import time
from dotenv import load_dotenv

class AdvancedAPIDiagnostic:
    def __init__(self):
        self.api_key = os.getenv('GEMINI_API_KEY')
        self.base_url = "https://generativelanguage.googleapis.com"
        
    def test_key_with_different_endpoints(self):
        """Test API key with various Gemini endpoints"""
        print("🔍 Advanced API Key Testing")
        print("=" * 40)
        
        if not self.api_key:
            print("❌ No API key found")
            return False
        
        print(f"📋 API Key: {self.api_key[:15]}...{self.api_key[-15:]}")
        print(f"🏷 Project ID from error: 105088806009")
        
        endpoints = [
            {
                "name": "Models List",
                "url": f"{self.base_url}/v1beta/models?key={self.api_key}",
                "method": "GET"
            },
            {
                "name": "Generate Content (gemini-pro)",
                "url": f"{self.base_url}/v1beta/models/gemini-pro:generateContent?key={self.api_key}",
                "method": "POST",
                "payload": {
                    "contents": [{"parts": [{"text": "Hello, respond with 'working' if you can understand this."}]}]
                }
            },
            {
                "name": "Generate Content (gemini-1.5-flash)",
                "url": f"{self.base_url}/v1beta/models/gemini-1.5-flash:generateContent?key={self.api_key}",
                "method": "POST",
                "payload": {
                    "contents": [{"parts": [{"text": "Test message"}]}]
                }
            }
        ]
        
        results = []
        for endpoint in endpoints:
            print(f"\n🤖 Testing: {endpoint['name']}")
            print(f"🌐 URL: {endpoint['url'][:50]}...")
            
            try:
                if endpoint['method'] == 'GET':
                    response = requests.get(endpoint['url'], timeout=10)
                else:
                    response = requests.post(
                        endpoint['url'], 
                        json=endpoint['payload'], 
                        timeout=10
                    )
                
                print(f"📊 Status: {response.status_code}")
                
                if response.status_code == 200:
                    print("✅ SUCCESS")
                    results.append({"endpoint": endpoint['name'], "status": "SUCCESS"})
                elif response.status_code == 403:
                    print("❌ BLOCKED")
                    try:
                        error_data = response.json()
                        print(f"📝 Error: {error_data}")
                        
                        # Extract detailed error information
                        if 'error' in error_data:
                            error_info = error_data['error']
                            print(f"🔍 Reason: {error_info.get('reason', 'Unknown')}")
                            print(f"🏷 Consumer: {error_info.get('metadata', {}).get('consumer', 'Unknown')}")
                            
                            # Analyze specific blocking reasons
                            if error_info.get('reason') == 'API_KEY_SERVICE_BLOCKED':
                                print("💡 This is a security block, not format issue")
                                print("🔧 Solutions:")
                                print("  1. Create completely new API key")
                                print("  2. Try different Google Cloud project")
                                print("  3. Contact Google Cloud support")
                                print("  4. Wait 24-48 hours for automatic unblock")
                    
                    except:
                        print(f"📝 Response: {response.text}")
                    results.append({"endpoint": endpoint['name'], "status": "BLOCKED", "error": str(response.status_code)})
                else:
                    print(f"⚠️  Other error: {response.status_code}")
                    results.append({"endpoint": endpoint['name'], "status": "ERROR", "error": str(response.status_code)})
                    
            except Exception as e:
                print(f"❌ Exception: {e}")
                results.append({"endpoint": endpoint['name'], "status": "EXCEPTION", "error": str(e)})
            
            time.sleep(2)  # Rate limiting
        
        return results
    
    def analyze_blocking_patterns(self, results):
        """Analyze blocking patterns and provide recommendations"""
        print("\n📊 Blocking Analysis")
        print("=" * 30)
        
        blocked_count = len([r for r in results if r.get('status') == 'BLOCKED'])
        success_count = len([r for r in results if r.get('status') == 'SUCCESS'])
        
        print(f"🚫 Blocked: {blocked_count}")
        print(f"✅ Working: {success_count}")
        
        if blocked_count > 0:
            print("\n🔧 Recommended Actions:")
            print("1. IMMEDIATE: Create new API key from different Google Cloud project")
            print("2. ALTERNATIVE: Try Vertex AI endpoint with service account")
            print("3. TEMPORARY: Wait 24-48 hours for automatic unblock")
            print("4. SUPPORT: Contact Google Cloud support about project 105088806009")
            print("5. VERIFICATION: Test API key from different network/IP")
            
            print("\n💡 Why this happens:")
            print("- Google's automated security systems flag API keys")
            print("- New keys often get flagged initially")
            print("- Service account binding can trigger security reviews")
            print("- Project-specific issues can cause blocking")
        
        return {
            "total_tests": len(results),
            "blocked": blocked_count,
            "working": success_count,
            "recommendations": self.get_recommendations(blocked_count > 0)
        }
    
    def get_recommendations(self, is_blocked):
        """Get specific recommendations based on blocking status"""
        if is_blocked:
            return [
                "Create new API key in different Google Cloud project",
                "Try Vertex AI endpoint instead of Generative Language API",
                "Contact Google Cloud support about project blocking",
                "Wait 24-48 hours for automatic security review completion",
                "Test API from different network environment",
                "Verify billing and project status"
            ]
        else:
            return [
                "API key is working correctly",
                "Test with Mamasafe chatbot application",
                "Monitor for rate limiting or quota issues"
            ]
    
    def test_alternative_approaches(self):
        """Test alternative approaches to access Gemini AI"""
        print("\n🔄 Testing Alternative Approaches")
        print("=" * 40)
        
        alternatives = [
            {
                "name": "Vertex AI API",
                "description": "Use Vertex AI with service account authentication",
                "url": "https://us-central1-aiplatform.googleapis.com/v1/projects/mamasafe-495117/locations/us-central1/publishers/google/models/gemini-1.5-pro:generateContent"
            },
            {
                "name": "Different Project",
                "description": "Create API key in completely new Google Cloud project",
                "note": "Fresh projects often don't have security flags"
            }
        ]
        
        for alt in alternatives:
            print(f"\n🎯 {alt['name']}")
            print(f"📝 {alt['description']}")
            if 'url' in alt:
                print(f"🌐 {alt['url']}")
            if 'note' in alt:
                print(f"💡 {alt['note']}")
    
    def run_comprehensive_diagnostic(self):
        """Run complete diagnostic suite"""
        print("🩺 Advanced Gemini API Diagnostic Suite")
        print("=" * 50)
        print("Deep analysis of API blocking issues...")
        print()
        
        # Test all endpoints
        results = self.test_key_with_different_endpoints()
        
        # Analyze results
        analysis = self.analyze_blocking_patterns(results)
        
        # Show recommendations
        print(f"\n🎯 Recommendations: {len(analysis['recommendations'])}")
        for i, rec in enumerate(analysis['recommendations'], 1):
            print(f"{i}. {rec}")
        
        # Test alternatives
        if analysis['blocked'] > 0:
            print(f"\n🔄 Testing {len([alt for alt in alternatives if 'url' in alt])} alternatives...")
            self.test_alternative_approaches()
        
        return analysis

def main():
    """Main function to run advanced diagnostic"""
    diagnostic = AdvancedAPIDiagnostic()
    analysis = diagnostic.run_comprehensive_diagnostic()
        
        print(f"\n📈 Final Analysis Summary:")
        print(f"Total Tests: {analysis['total_tests']}")
        print(f"Blocked Endpoints: {analysis['blocked']}")
        print(f"Working Endpoints: {analysis['working']}")
        
        if analysis['blocked'] == 0:
            print("🎉 API key is working! Update Mamasafe configuration.")
        else:
            print("❌ API key is blocked. Follow recommendations above.")

if __name__ == "__main__":
    main()
