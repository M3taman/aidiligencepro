#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# Run the test suite
npm test

# Start the development server in the background for a health check
npm run dev &

# Wait for a few seconds to let the server start
sleep 10

# Check if the server is running (optional, but good practice)
# This is a simple check, a more robust solution might use curl or a similar tool
if ps | grep -q 'vite'; then
  echo "Development server started successfully."
else
  echo "Failed to start development server."
  exit 1
fi

# The emulators will shut down automatically after this script finishes.
