$workspace = Split-Path -Parent $PSScriptRoot
$jdk = Get-ChildItem -Directory -LiteralPath (Join-Path $workspace ".tools") -ErrorAction SilentlyContinue |
  Where-Object { $_.Name -like "jdk-17*" } |
  Select-Object -First 1

if (-not $jdk) {
  throw "Project-local JDK 17 was not found under .tools."
}

$sdkPath = $env:ANDROID_SDK_ROOT
if (-not $sdkPath -or -not (Test-Path -LiteralPath $sdkPath)) {
  $sdkPath = $env:ANDROID_HOME
}
if (-not $sdkPath -or -not (Test-Path -LiteralPath $sdkPath)) {
  $sdkPath = 'C:\Users\Administrator\AppData\Local\Android\Sdk'
}
if (-not (Test-Path -LiteralPath $sdkPath)) {
  throw "Android SDK was not found. Set ANDROID_SDK_ROOT or ANDROID_HOME."
}

$env:JAVA_HOME = $jdk.FullName
$env:ANDROID_SDK_ROOT = $sdkPath
$env:ANDROID_HOME = $env:ANDROID_SDK_ROOT
$env:GRADLE_USER_HOME = Join-Path $workspace ".gradle-user-home"

$javaCompatibilityFiles = @(
  (Join-Path $workspace "node_modules\\@capacitor\\android\\capacitor\\build.gradle"),
  (Join-Path $workspace "android\\app\\capacitor.build.gradle")
)
foreach ($file in $javaCompatibilityFiles) {
  if (Test-Path -LiteralPath $file) {
    $contents = [System.IO.File]::ReadAllText($file)
    if ($contents.Contains("JavaVersion.VERSION_21")) {
      [System.IO.File]::WriteAllText($file, $contents.Replace("JavaVersion.VERSION_21", "JavaVersion.VERSION_17"))
    }
  }
}

$wrapper = Join-Path $workspace "android\\gradlew.bat"
$androidProject = Join-Path $workspace "android"
Push-Location -LiteralPath $androidProject
try {
  & $wrapper assembleDebug --no-daemon
  if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
  }
} finally {
  Pop-Location
}
