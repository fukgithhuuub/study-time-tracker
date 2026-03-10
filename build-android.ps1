Write-Host "Installing dependencies..."
npm install @capacitor/core @capacitor/android @capacitor/app @capacitor/status-bar @capacitor/splash-screen
npm install @capacitor/cli --save-dev
Write-Host "Initializing capacitor..."
npx cap init "StudyFlow" "com.pavneet.studyflow" --web-dir dist
Write-Host "Building project..."
npm run build
Write-Host "Adding android platform..."
npx cap add android
Write-Host "Done"
