# jss-astro local development environment set up

## Prerequisites

 - . Net Core 3.1 SDK or higher
 - . Net Framework 4.8 SDK
 -  Visual Studio 2019 or higher
 -  Docker for Windows, with Windows Containers enabled
 -  Stop IIS
 -  Ensure port 8984 is free for solr
 -  Execute dotnet tool restore command before running up.ps1

## Local development environment set up

 1. Install [Sitecore CLI](https://doc.sitecore.com/xp/en/developers/100/developer-tools/install-sitecore-command-line-interface.html)

 2. **Initialize environment by running ./init.ps1**
 ```ps1
.\init.ps1 -InitEnv -LicenseXmlPath "<C:\path\to\license.xml>" -AdminPassword "desired password"
```
Note: by default it initializes environment configuration with **xm1** topology, but you can initialize it with **xp0** or **xp1** or **xmcloud** by using ```-Topology``` parameter.
There is also ```-Xmcloud``` switch that allows you to initialize an xm-cloud topology

 3. **Run containers**
 ```ps1
 .\up.ps1
 ```
 Initially Sitecore login page will be opened in order to authentificate a session to deserialize items and rebuild search indexes. 
 Sitecore CM: https://cm.headless.localhost/sitecore/shell/

Note: Use ```-Xmcloud``` switch to properly start containers for xm-cloud topology

It is also possible to run containers by running ```docker-compose up``` command directly from corresponding topology folder, for example:
```ps1
cd ./run/sitecore-xm1
docker-compose up
```

It is possible to stop and remove running containers by ```./down.ps1```.
Note: Use ```-Xmcloud``` switch to properly stop and remove containers for xm-cloud topology

In case of ```docker-compose down``` please make sure you are placed at the same folder where you run ```docker-compose up``` previously.

 4. **Rendering host**

All the topologies include Astro rendering host container (not in use by default). To use this rendering host instead of a local one the following settings have to be updated:

1. In the astro-sitecore-jss-sample\scjssconfig.json configuration file update the "sitecoreApiHost" setting as the following:
    ```"sitecoreApiHost": "http://cm",```

2. In sitecore content editor navigate to the /sitecore/system/Settings/Services/Rendering Hosts/Default item and update the next fields:
```ServerSideRenderingEngineApplicationUrl value set to: "http://rendering:4321/"```
```ServerSideRenderingEngineEndpointUrl value set to: "http://rendering:4321/api/editing/render"```

3. In sitecore content editor navigate to the /sitecore/content/Headless/Astro/Settings item and update the next fields:
```ServerSideRenderingEngineApplicationUrl value set to: "http://rendering:4321/"```
```ServerSideRenderingEngineEndpointUrl value set to: "http://rendering:4321/api/editing/render"```