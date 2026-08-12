import { FSItem } from '../types';

export const DEFAULT_WORKSPACE_ITEMS: FSItem[] = [
  {
    id: 'f-main',
    name: 'main.py',
    path: '/main.py',
    isFolder: false,
    parentId: null,
    content: `# Python You Python IDE - Main Entry Point
import sys
import time
from utils import greet_user, calculate_stats
from calculator import Calculator

def main():
    print("=" * 45)
    print("🚀 Welcome to Python You Local Python IDE!")
    print(f"🐍 Python Executable: {sys.executable}")
    print(f"⏰ Current Time: {time.strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 45)

    # 1. Test Module Import & Function Call
    user = "Developer"
    message = greet_user(user)
    print(f"\\n[Utils]: {message}")

    # 2. Test Data Processing
    numbers = [12, 45, 67, 89, 23, 56, 91, 34, 78]
    stats = calculate_stats(numbers)
    print("\\n[Data Analysis Results]:")
    for key, val in stats.items():
        print(f"  • {key.capitalize()}: {val}")

    # 3. Test Class Instance
    calc = Calculator()
    calc.add(10).multiply(5).subtract(4)
    print(f"\\n[Calculator]: 10 * 5 - 4 = {calc.get_result()}")

if __name__ == "__main__":
    main()
`
  },
  {
    id: 'f-utils',
    name: 'utils.py',
    path: '/utils.py',
    isFolder: false,
    parentId: null,
    content: `# Helper utility functions module
import math

def greet_user(name: str) -> str:
    """Returns a warm greeting string."""
    return f"Hello, {name}! Python You Python IDE is running locally."

def calculate_stats(numbers: list[float]) -> dict:
    """Calculates basic mathematical statistics for a list of numbers."""
    if not numbers:
        return {"count": 0, "sum": 0, "mean": 0, "max": 0, "min": 0, "std_dev": 0}

    n = len(numbers)
    total = sum(numbers)
    mean = total / n
    variance = sum((x - mean) ** 2 for x in numbers) / n
    std_dev = math.sqrt(variance)

    return {
        "count": n,
        "sum": round(total, 2),
        "mean": round(mean, 2),
        "max": max(numbers),
        "min": min(numbers),
        "std_dev": round(std_dev, 2)
    }
`
  },
  {
    id: 'f-calculator',
    name: 'calculator.py',
    path: '/calculator.py',
    isFolder: false,
    parentId: null,
    content: `# Fluent Calculator Class Implementation

class Calculator:
    """A simple chained calculator class for demonstration."""
    def __init__(self, initial_value: float = 0.0):
        self.value = float(initial_value)

    def add(self, n: float) -> 'Calculator':
        self.value += n
        return self

    def subtract(self, n: float) -> 'Calculator':
        self.value -= n
        return self

    def multiply(self, n: float) -> 'Calculator':
        self.value *= n
        return self

    def divide(self, n: float) -> 'Calculator':
        if n == 0:
            raise ValueError("Cannot divide by zero!")
        self.value /= n
        return self

    def reset(self) -> 'Calculator':
        self.value = 0.0
        return self

    def get_result(self) -> float:
        return self.value

if __name__ == '__main__':
    c = Calculator(5)
    result = c.add(15).divide(4).multiply(10).get_result()
    print(f"Calculator Demo Result: {result}")
`
  },
  {
    id: 'f-data-analysis',
    name: 'data_analysis.py',
    path: '/data_analysis.py',
    isFolder: false,
    parentId: null,
    content: `# Data processing and JSON manipulation example
import json
import random

def generate_sales_data():
    categories = ["Electronics", "Books", "Clothing", "Home & Garden"]
    data = []
    for i in range(1, 11):
        item = {
            "id": f"ORD-{1000 + i}",
            "category": random.choice(categories),
            "amount": round(random.uniform(15.0, 450.0), 2),
            "status": random.choice(["Completed", "Pending", "Shipped"])
        }
        data.append(item)
    return data

def main():
    print("📊 Generating Sample Sales Report...")
    sales = generate_sales_data()
    json_str = json.dumps(sales, indent=2)
    print(json_str)
    
    total_revenue = sum(item["amount"] for item in sales)
    print(f"\\n💰 Total Revenue: \${total_revenue:.2f}")

if __name__ == "__main__":
    main()
`
  },
  {
    id: 'folder-data',
    name: 'data',
    path: '/data',
    isFolder: true,
    parentId: null,
    isOpen: true,
    children: [
      {
        id: 'f-sample-json',
        name: 'sample_data.json',
        path: '/data/sample_data.json',
        isFolder: false,
        parentId: 'folder-data',
        content: `{\n  "project": "Python You Local Python IDE",\n  "version": "0.3.3",\n  "features": [\n    "File Tree Explorer",\n    "Pyodide Python 3.11 Execution",\n    "Interactive REPL Console",\n    "Gemini AI Code Assistant"\n  ]\n}`
      }
    ]
  },
  {
    id: 'f-readme',
    name: 'README.md',
    path: '/README.md',
    isFolder: false,
    parentId: null,
    content: `# Python You Python IDE

Welcome to **Python You**, a full-featured local Python IDE running directly in your browser.

## Features
- **File Explorer**: Tree view attached directly next to sidebar. Create, edit, rename, and delete Python files and folders.
- **In-Browser Execution**: Runs Python 3.11 using Pyodide WebAssembly engine with zero server latency.
- **Interactive REPL**: Try Python statements line-by-line in the bottom terminal.
- **Package Manager**: Install Pyodide-supported packages like \`numpy\`, \`pandas\`, \`matplotlib\`, and more.
- **AI Assistant**: Built-in Gemini AI assistant to debug errors, explain code, and generate algorithms.
`
  }
];
