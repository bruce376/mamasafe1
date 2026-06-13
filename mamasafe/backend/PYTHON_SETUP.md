# Mamasafe Python Environment Setup Guide

## Overview

The Mamasafe project now includes a comprehensive Python environment for testing, data analysis, and utilities. This setup complements the main Node.js backend with powerful Python tools for API testing, health data analysis, and monitoring.

## 📋 What's Installed

### Core Packages
- **requests**: HTTP client for API testing
- **python-dotenv**: Environment variable management
- **pytest**: Testing framework
- **pytest-asyncio**: Async testing support

### Data Analysis & Visualization
- **pandas**: Data manipulation and analysis
- **numpy**: Numerical computing
- **matplotlib**: Plotting and visualization
- **seaborn**: Statistical data visualization

### Development Tools
- **jupyter**: Interactive notebooks
- **notebook**: Jupyter notebook interface
- **ipykernel**: Jupyter kernel for Python

## 🚀 Quick Start

### 1. Activate Virtual Environment
```bash
# On Windows (Command Prompt)
venv\Scripts\activate

# On Windows (PowerShell)
venv\Scripts\Activate.ps1
```

### 2. Test the API
```bash
python test_api.py
```

### 3. Run Utilities Demo
```bash
python mamasafe_utils.py
```

## 📁 Python Files Created

### `test_api.py`
Comprehensive API testing suite that tests:
- Server connectivity
- Health chatbot responses
- Different user contexts
- Emergency handling
- Performance metrics

### `mamasafe_utils.py`
Python utilities including:
- **MamasafeAPI**: Python client for the API
- **HealthDataAnalyzer**: Analyze interactions and performance
- **PregnancyHealthTracker**: Track pregnancy health data

### `requirements.txt`
All Python dependencies for easy installation

## 🧪 API Testing

### Basic Usage
```python
from mamasafe_utils import MamasafeAPI

api = MamasafeAPI()
response = api.chat("pregnancy symptoms", {"pregnancyWeek": 12})
print(response['reply'])
```

### Performance Testing
```python
from mamasafe_utils import MamasafeAPI

api = MamasafeAPI()
result = api.analyze_response_time("pregnancy symptoms", {"pregnancyWeek": 12})
print(f"Response time: {result['response_time_ms']}ms")
```

## 📊 Data Analysis

### Track Interactions
```python
from mamasafe_utils import HealthDataAnalyzer

analyzer = HealthDataAnalyzer()
analyzer.add_interaction("message", "response", {"context": "data"}, 500)
stats = analyzer.get_statistics()
print(stats)
```

### Visualize Performance
```python
analyzer.plot_response_times("performance.png")
```

## 🤱 Pregnancy Health Tracking

### Log Symptoms
```python
from mamasafe_utils import PregnancyHealthTracker

tracker = PregnancyHealthTracker()
result = tracker.log_symptoms(12, "nausea, fatigue", "mild symptoms")
print(result['ai_advice'])
```

### Get Weekly Analysis
```python
summary = tracker.get_weekly_summary(12)
print(summary['ai_analysis'])
```

## 📈 Test Results

The Python testing suite successfully validated:
- ✅ API connectivity
- ✅ Response handling
- ✅ Emergency detection
- ✅ Context awareness
- ✅ Fallback mechanisms

## 🔧 Development Workflow

### 1. Environment Setup
```bash
# Create virtual environment (if not exists)
python -m venv venv

# Activate and install dependencies
venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Run Tests
```bash
# API testing
python test_api.py

# Utilities demo
python mamasafe_utils.py
```

### 3. Development
```bash
# Start Jupyter for interactive development
jupyter notebook

# Run specific tests
pytest test_api.py -v
```

## 📝 Usage Examples

### API Client
```python
from mamasafe_utils import MamasafeAPI

# Initialize client
api = MamasafeAPI("http://localhost:5000")

# Send message with context
response = api.chat(
    "nutrition advice", 
    {"pregnancyWeek": 20, "babyAge": 0}
)

# Check for errors
if "error" not in response:
    print(f"AI Response: {response['reply']}")
else:
    print(f"Error: {response['error']}")
```

### Performance Monitoring
```python
from mamasafe_utils import HealthDataAnalyzer

# Initialize analyzer
analyzer = HealthDataAnalyzer()

# Track multiple interactions
for i in range(10):
    response = api.chat("test message", {"pregnancyWeek": i})
    analyzer.add_interaction(
        f"test {i}", 
        response['reply'], 
        {"week": i},
        300 + i * 10  # simulated response time
    )

# Get statistics
stats = analyzer.get_statistics()
print(f"Average response time: {stats['avg_response_time_ms']}ms")

# Export data
analyzer.export_data("api_performance.csv")
```

## 🎯 Benefits

1. **Comprehensive Testing**: Automated API testing with multiple scenarios
2. **Performance Monitoring**: Track response times and system performance
3. **Data Analysis**: Analyze user interactions and health data
4. **Development Tools**: Jupyter notebooks for interactive development
5. **Health Tracking**: Specialized tools for pregnancy health monitoring

## 🔄 Integration with Node.js

The Python environment complements the main Node.js application:
- **Node.js**: Main server and API endpoints
- **Python**: Testing, analysis, and utilities
- **Both**: Share the same API endpoints and database

## 🚀 Next Steps

1. **Extend Testing**: Add more comprehensive test cases
2. **Data Visualization**: Create dashboards for health insights
3. **Machine Learning**: Add predictive health models
4. **Monitoring**: Set up continuous performance monitoring
5. **Automation**: Integrate with CI/CD pipelines

## 📞 Support

For questions about the Python environment:
1. Check the test files for usage examples
2. Run the demo scripts to see functionality
3. Use Jupyter notebooks for interactive exploration
4. Refer to the main Mamasafe documentation

The Python environment is now ready for development, testing, and analysis! 🎉
