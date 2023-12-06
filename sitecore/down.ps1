[CmdletBinding(DefaultParameterSetName = "no-arguments")]
Param (    
  [Parameter(Mandatory = $false,
    HelpMessage = "Sets the instance topology")]
  [ValidateSet("xp0", "xp1", "xm1", "xmcloud")]
  [string]$Topology = "xm1",

    
  [Parameter(Mandatory = $false,
    HelpMessage = "Force use of xm-cloud topology.")]
  [switch]$Xmcloud
)

if ($Xmcloud) {
  $Topology = "xmcloud"	
}

$ErrorActionPreference = "Stop";
$workingDirectoryPath = ".\topology\sitecore-$Topology";

# Double check whether init has been run
$envCheckVariable = "HOST_LICENSE_FOLDER";
$envCheck = Get-Content (Join-Path -Path ($workingDirectoryPath) -ChildPath .env) -Encoding UTF8 | Where-Object { $_ -imatch "^$envCheckVariable=.+" }
if (-not $envCheck) {
  throw "$envCheckVariable does not have a value. Did you run 'init.ps1 -InitEnv'?"
}

Push-Location $workingDirectoryPath

Write-Host "Down containers..." -ForegroundColor Green
try {
  docker compose down
  if ($LASTEXITCODE -ne 0) {
    Write-Error "Container down failed, see errors above."
  }
}
finally {
  Pop-Location
}
