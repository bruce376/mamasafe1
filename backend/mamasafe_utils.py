#!/usr/bin/env python3
"""
Mamasafe Utilities
Python utilities for Mamasafe project including data analysis, API monitoring, and health insights
"""

import requests
import json
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime, timedelta, timezone
import os
from dotenv import load_dotenv
import time

# Load environment variables
load_dotenv()

class MamasafeAPI:
    """Mamasafe API client for Python integration"""
    
    def __init__(self, base_url="http://localhost:5000"):
        self.base_url = base_url
        self.session = requests.Session()
    
    def chat(self, message, user_context=None):
        """Send message to Mamasafe chatbot"""
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
            
            if response.status_code == 200:
                return response.json()
            else:
                return {"error": f"API Error: {response.status_code}", "details": response.text}
                
        except Exception as e:
            return {"error": "Connection Error", "details": str(e)}
    
    def analyze_response_time(self, message, user_context=None):
        """Measure API response time"""
        start_time = time.time()
        response = self.chat(message, user_context)
        end_time = time.time()
        
        response_time = (end_time - start_time) * 1000  # Convert to milliseconds
        return {
            "response_time_ms": response_time,
            "response": response,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

class HealthDataAnalyzer:
    """Analyze health data and generate insights"""
    
    def __init__(self):
        self.data = []
    
    def add_interaction(self, message, response, user_context=None, response_time=None):
        """Add interaction data for analysis"""
        interaction = {
            "timestamp": datetime.now(timezone.utc),
            "message": message,
            "response": response[:200] + "..." if len(response) > 200 else response,
            "user_context": user_context or {},
            "response_time_ms": response_time,
            "message_length": len(message),
            "response_length": len(response)
        }
        self.data.append(interaction)
    
    def get_dataframe(self):
        """Convert data to pandas DataFrame"""
        return pd.DataFrame(self.data)
    
    def plot_response_times(self, save_path="response_times.png"):
        """Plot response time trends"""
        if not self.data:
            print("No data to plot")
            return
        
        df = self.get_dataframe()
        
        plt.figure(figsize=(12, 6))
        plt.plot(df['timestamp'], df['response_time_ms'], marker='o', linestyle='-', alpha=0.7)
        plt.title('Mamasafe API Response Times')
        plt.xlabel('Time')
        plt.ylabel('Response Time (ms)')
        plt.xticks(rotation=45)
        plt.grid(True, alpha=0.3)
        plt.tight_layout()
        plt.savefig(save_path, dpi=300, bbox_inches='tight')
        plt.show()
        print(f"Response time plot saved to {save_path}")
    
    def get_statistics(self):
        """Get interaction statistics"""
        if not self.data:
            return "No data available"
        
        df = self.get_dataframe()
        
        stats = {
            "total_interactions": len(df),
            "avg_response_time_ms": df['response_time_ms'].mean(),
            "min_response_time_ms": df['response_time_ms'].min(),
            "max_response_time_ms": df['response_time_ms'].max(),
            "avg_message_length": df['message_length'].mean(),
            "avg_response_length": df['response_length'].mean(),
            "unique_users": len(df['user_context'].apply(str).unique())
        }
        
        return stats
    
    def export_data(self, filename="mamasafe_data.csv"):
        """Export data to CSV"""
        if not self.data:
            print("No data to export")
            return
        
        df = self.get_dataframe()
        df.to_csv(filename, index=False)
        print(f"Data exported to {filename}")

class PregnancyHealthTracker:
    """Track and analyze pregnancy health data"""
    
    def __init__(self):
        self.symptoms_data = []
        self.api = MamasafeAPI()
    
    def log_symptoms(self, week, symptoms, notes=""):
        """Log pregnancy symptoms for a specific week"""
        entry = {
            "week": week,
            "symptoms": symptoms,
            "notes": notes,
            "timestamp": datetime.now(timezone.utc)
        }
        self.symptoms_data.append(entry)
        
        # Get AI advice
        context = {"pregnancyWeek": week}
        ai_response = self.api.chat(f"Symptoms: {symptoms}. Notes: {notes}", context)
        
        return {
            "logged": entry,
            "ai_advice": ai_response
        }
    
    def get_weekly_summary(self, week):
        """Get summary for a specific week"""
        week_data = [entry for entry in self.symptoms_data if entry["week"] == week]
        
        if not week_data:
            return f"No data for week {week}"
        
        symptoms = []
        for entry in week_data:
            symptoms.extend(entry["symptoms"].split(","))
        
        # Get AI analysis
        context = {"pregnancyWeek": week}
        ai_response = self.api.chat(f"Week {week} pregnancy summary with symptoms: {', '.join(set(symptoms))}", context)
        
        return {
            "week": week,
            "symptoms": list(set(symptoms)),
            "entries_count": len(week_data),
            "ai_analysis": ai_response
        }

def main():
    """Demo of Mamasafe utilities"""
    print("🤱 Mamasafe Python Utilities Demo")
    print("=" * 40)
    
    # Initialize components
    api = MamasafeAPI()
    analyzer = HealthDataAnalyzer()
    
    print("🔍 Testing API connection...")
    
    # Test API
    test_response = api.chat("pregnancy symptoms", {"pregnancyWeek": 12})
    
    if "error" not in test_response:
        print("✅ API is working!")
        print(f"Sample response: {test_response['reply'][:100]}...")
        
        # Add interaction to analyzer
        analyzer.add_interaction(
            "pregnancy symptoms", 
            test_response['reply'], 
            {"pregnancyWeek": 12},
            500  # sample response time
        )
        
        # Get statistics
        stats = analyzer.get_statistics()
        print(f"\n📊 Statistics: {stats}")
        
    else:
        print(f"❌ API Error: {test_response}")
    
    print("\n📋 Utilities available:")
    print("- MamasafeAPI: Python client for the API")
    print("- HealthDataAnalyzer: Analyze interactions and performance")
    print("- PregnancyHealthTracker: Track pregnancy health data")

if __name__ == "__main__":
    main()
