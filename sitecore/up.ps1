[CmdletBinding(DefaultParameterSetName = "no-arguments")]
Param (
    [Parameter(HelpMessage = "Alternative login using app client.",
        ParameterSetName = "by-pass")]
    [bool]$ByPass = $false,
	
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
if (-not(Test-Path $workingDirectoryPath\.env)) {
    throw ".env file does not exist for $Topology topology. Did you run 'init.ps1 -InitEnv'?"
}

copy "$workingDirectoryPath\.env" .env

. .\upFunctions.ps1

Validate-LicenseExpiry

$envContent = Get-Content .env -Encoding UTF8
$cmHostName = $envContent | Where-Object { $_ -imatch "^CM_HOST=.+" }
$cmHostName = $cmHostName.Split("=")[1]

if ($Xmcloud) {    
    $sitecoreDockerRegistry = $envContent | Where-Object { $_ -imatch "^SITECORE_DOCKER_REGISTRY=.+" }
    $sitecoreVersion = $envContent | Where-Object { $_ -imatch "^SITECORE_VERSION=.+" }
    $ClientCredentialsLogin = $envContent | Where-Object { $_ -imatch "^SITECORE_FedAuth_dot_Auth0_dot_ClientCredentialsLogin=.+" }
    $sitecoreApiKey = ($envContent | Where-Object { $_ -imatch "^SITECORE_API_KEY_xmcloudpreview=.+" }).Split("=")[1]

    $xmCloudHost = $cmHostName
    $sitecoreDockerRegistry = $sitecoreDockerRegistry.Split("=")[1]
    $sitecoreVersion = $sitecoreVersion.Split("=")[1]
    $ClientCredentialsLogin = $ClientCredentialsLogin.Split("=")[1]
    if ($ClientCredentialsLogin -eq "true") {
        $xmCloudClientCredentialsLoginDomain = $envContent | Where-Object { $_ -imatch "^SITECORE_FedAuth_dot_Auth0_dot_Domain=.+" }
        $xmCloudClientCredentialsLoginAudience = $envContent | Where-Object { $_ -imatch "^SITECORE_FedAuth_dot_Auth0_dot_ClientCredentialsLogin_Audience=.+" }
        $xmCloudClientCredentialsLoginClientId = $envContent | Where-Object { $_ -imatch "^SITECORE_FedAuth_dot_Auth0_dot_ClientCredentialsLogin_ClientId=.+" }
        $xmCloudClientCredentialsLoginClientSecret = $envContent | Where-Object { $_ -imatch "^SITECORE_FedAuth_dot_Auth0_dot_ClientCredentialsLogin_ClientSecret=.+" }
        $xmCloudClientCredentialsLoginDomain = $xmCloudClientCredentialsLoginDomain.Split("=")[1]
        $xmCloudClientCredentialsLoginAudience = $xmCloudClientCredentialsLoginAudience.Split("=")[1]
        $xmCloudClientCredentialsLoginClientId = $xmCloudClientCredentialsLoginClientId.Split("=")[1]
        $xmCloudClientCredentialsLoginClientSecret = $xmCloudClientCredentialsLoginClientSecret.Split("=")[1]
    }

    #set node version
    $xmCloudBuild = Get-Content "xmcloud.build.json" | ConvertFrom-Json
    $nodeVersion = $xmCloudBuild.renderingHosts.xmcloudpreview.nodeVersion
    if (![string]::IsNullOrWhitespace($nodeVersion)) {
        Set-EnvFileVariable "NODEJS_VERSION" -Value $xmCloudBuild.renderingHosts.xmcloudpreview.nodeVersion
    }   
}
else {
    $sitecoreApiKey = ($envContent | Where-Object { $_ -imatch "^SITECORE_API_KEY=.+" }).Split("=")[1]
}

# Double check whether init has been run
$envCheckVariable = "HOST_LICENSE_FOLDER"
$envCheck = $envContent | Where-Object { $_ -imatch "^$envCheckVariable=.+" }
if (-not $envCheck) {
    throw "$envCheckVariable does not have a value. Did you run 'init.ps1 -InitEnv'?"
}

Push-Location $workingDirectoryPath

try {
    if ($Xmcloud) {
        Write-Host "Keeping XM Cloud base image up to date" -ForegroundColor Green
        docker pull "$($sitecoreDockerRegistry)sitecore-xmcloud-cm:$($sitecoreVersion)"
    }
    # Build all containers in the Sitecore instance, forcing a pull of latest base containers
    Write-Host "Building containers..." -ForegroundColor Green
    docker compose build
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Container build failed, see errors above."
    }

    # Start the Sitecore instance
    Write-Host "Starting Sitecore environment..." -ForegroundColor Green
    docker compose up -d
}
finally {
    Pop-Location
}

# Wait for Traefik to expose CM route
Write-Host "Waiting for CM to become available..." -ForegroundColor Green
$startTime = Get-Date
do {
    Start-Sleep -Milliseconds 100
    try {
        $status = Invoke-RestMethod "http://localhost:8079/api/http/routers/cm-secure@docker"
    }
    catch {
        if ($_.Exception.Response.StatusCode.value__ -ne "404") {
            throw
        }
    }
} while ($status.status -ne "enabled" -and $startTime.AddSeconds(15) -gt (Get-Date))
if (-not $status.status -eq "enabled") {
    $status
    Write-Error "Timeout waiting for Sitecore CM to become available via Traefik proxy. Check CM container logs."
}

Write-Host "Restoring Sitecore CLI..." -ForegroundColor Green
dotnet tool restore
Write-Host "Installing Sitecore CLI Plugins..."
dotnet sitecore --help | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Error "Unexpected error installing Sitecore CLI Plugins"
}

if ($Xmcloud) {

    Write-Host "Logging into Sitecore..." -ForegroundColor Green
    if ($ClientCredentialsLogin -eq "true") {
        dotnet sitecore cloud login --client-id $xmCloudClientCredentialsLoginClientId --client-secret $xmCloudClientCredentialsLoginClientSecret --client-credentials true
        dotnet sitecore login --authority $xmCloudClientCredentialsLoginDomain --audience $xmCloudClientCredentialsLoginAudience --client-id $xmCloudClientCredentialsLoginClientId --client-secret $xmCloudClientCredentialsLoginClientSecret --cm https://$xmCloudHost --client-credentials true --allow-write true -n local
    }
    else {
        dotnet sitecore cloud login
        dotnet sitecore connect --ref xmcloud --cm https://$xmCloudHost --allow-write true -n local
    }
}
else {
    if ($ByPass) {
        dotnet sitecore login --cm https://cm.headless.localhost/ --auth https://id.headless.localhost/ --allow-write true --client-id "SitecoreCLIServer" --client-secret "testsecret" --client-credentials true -n local
    }
    else {
        dotnet sitecore login --cm https://cm.headless.localhost/ --auth https://id.headless.localhost/ --allow-write true -n local
    }
}

if ($LASTEXITCODE -ne 0) {
    Write-Error "Unable to log into Sitecore, did the Sitecore environment start correctly? See logs above."
}

# Populate Solr managed schemas to avoid errors during item deploy
Write-Host "Populating Solr managed schema..." -ForegroundColor Green
dotnet sitecore index schema-populate -n local

if ($LASTEXITCODE -ne 0) {
    Write-Error "Populating Solr managed schema failed, see errors above."
}

# Rebuild indexes
Write-Host "Rebuilding indexes..." -ForegroundColor Green
dotnet sitecore index rebuild -n local

Write-Host "Pushing Default rendering host configuration" -ForegroundColor Green
dotnet sitecore ser push -i RenderingHost -n local
Write-Host "Pushing items to Sitecore..." -ForegroundColor Green
dotnet sitecore ser push -n local

if ($Xmcloud) {   
    $renderingSiteName = "xmcloudpreview"   
}
else {    
    $renderingSiteName = "astropreview"
}

$templatesFolder = "docker-xm-cloud\build\cm\templates"
Write-Host "Pushing sitecore API key" -ForegroundColor Green
& $templatesFolder\import-templates.ps1 -RenderingSiteName $renderingSiteName -SitecoreApiKey $sitecoreApiKey

if ($LASTEXITCODE -ne 0) {
    Write-Error "Serialization push failed, see errors above."
}

if ($ClientCredentialsLogin -ne "true") {
    Write-Host "Opening site..." -ForegroundColor Green

    Start-Process https://$cmHostName/sitecore/
}

Write-Host ""
Write-Host "Use the following command to monitor your Rendering Host:" -ForegroundColor Green
Write-Host "docker compose logs -f rendering"
Write-Host ""

# host.docker.internal is not available on CM, so we need to add it manually
if ($Xmcloud) {
    $containerId = docker ps --filter name=jss_astro_xm_cloud-cm-1 --format "{{.ID}}"    
}
else {
    $containerId = docker ps --filter ancestor=jss_astro-$Topology-cm --format "{{.ID}}"    
}
$ip = Get-NetIPAddress | Where-Object -FilterScript { $_.IPAddress.StartsWith("192") -and -not $_.InterfaceAlias.StartsWith("vEthernet") }
$ipAddress = $ip.IPAddress
Write-Host "Adding DNS record to container $containerId. Host: host.docker.internal. IP: $ipAddress"
$command = "'$ipAddress host.docker.internal' | Out-File -Append -Encoding ASCII -FilePath '$($Env:windir)\system32\drivers\etc\hosts'"
docker exec -it $containerId powershell $command