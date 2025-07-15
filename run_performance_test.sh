#!/bin/bash

# Exit on error
set -e

# Add node_modules to path
export PATH=$PATH:./node_modules/.bin:./src/node_modules/.bin

# Install Python dependencies
echo "--- Installing Python dependencies ---"
pip install -r python_workspace/requirements.txt

# Install frontend dependencies
echo "--- Installing frontend dependencies ---"
npm install --prefix apps/dashboard

# Install backend dependencies
echo "--- Installing backend dependencies ---"
npm install --prefix backend

# Run the performance test
echo "--- Running performance test ---"
python performance_test.py

echo "--- Performance test finished ---"
