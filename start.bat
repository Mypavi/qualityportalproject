@echo off
echo Starting Quality Portal Application...
echo.
echo Make sure you have Node.js and UI5 CLI installed:
echo npm install -g @ui5/cli
echo.
echo Installing dependencies...
npm install
echo.
echo Starting the application...
echo The application will be available at: http://localhost:8080
echo.
echo Press Ctrl+C to stop the server
echo.
ui5 serve --port 8080
pause