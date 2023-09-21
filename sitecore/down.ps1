$topologyArray = "xp0", "xp1", "xm1";

$startDirectory = ".\run\sitecore-";
$workinDirectoryPath;
$envCheck;
$envCheckVariable = "HOST_LICENSE_FOLDER";

foreach ($topology in $topologyArray) {
  $envCheck = Get-Content (Join-Path -Path ($startDirectory + $topology) -ChildPath .env) -Encoding UTF8 | Where-Object { $_ -imatch "^$envCheckVariable=.+" }
  if ($envCheck) {
    $workinDirectoryPath = $startDirectory + $topology;
    break
  }
}

Push-Location $workinDirectoryPath

Write-Host "Down containers..." -ForegroundColor Green
try {
  docker-compose down
  if ($LASTEXITCODE -ne 0) {
    Write-Error "Container down failed, see errors above."
  }
}
finally {
  Pop-Location
}
