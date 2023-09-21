# escape=`

ARG PARENT_IMAGE
ARG SOLUTION_IMAGE
ARG TOOLS_IMAGE
ARG MANAGEMENT_SERVICES_IMAGE
ARG SPE_IMAGE
ARG HEADLESS_SERVICES_IMAGE
ARG EXPERIENCE_ACCELERATOR_IMAGE

FROM ${SOLUTION_IMAGE} as solution
FROM ${TOOLS_IMAGE} as tools
FROM ${MANAGEMENT_SERVICES_IMAGE} AS management_services
FROM ${SPE_IMAGE} AS spe_services
FROM ${HEADLESS_SERVICES_IMAGE} AS headless_services
FROM ${EXPERIENCE_ACCELERATOR_IMAGE} AS sxa_services
FROM ${PARENT_IMAGE}

SHELL ["powershell", "-Command", "$ErrorActionPreference = 'Stop'; $ProgressPreference = 'SilentlyContinue';"]

WORKDIR C:\inetpub\wwwroot

# Copy developer tools and entrypoint
COPY --from=tools C:\tools C:\tools

# Copy the Sitecore Management Services Module
COPY --from=management_services C:\module\cm\content C:\inetpub\wwwroot

# Copy the Sitecore Powershell Extensions Module
COPY --from=spe_services C:\module\cm\content C:\inetpub\wwwroot

# Copy and init the JSS / Headless Services Module
COPY --from=headless_services C:\module\cm\content C:\inetpub\wwwroot
COPY --from=headless_services C:\module\tools C:\module\tools
RUN C:\module\tools\Initialize-Content.ps1 -TargetPath C:\inetpub\wwwroot; `
    Remove-Item -Path C:\module -Recurse -Force;

# Copy and init the SXA / Sitecore Experience Accelerator
COPY --from=sxa_services C:\module\cm\content C:\inetpub\wwwroot
COPY --from=sxa_services C:\module\tools C:\module\tools
RUN C:\module\tools\Initialize-Content.ps1 -TargetPath C:\inetpub\wwwroot; `
    Remove-Item -Path C:\module -Recurse -Force;

# Copy solution website files
COPY --from=solution /artifacts/sitecore/ ./
COPY readme.md *.config*  c:\inetpub\wwwroot\App_Config\Include\

# Copy role transforms
COPY .\transforms\ \transforms\role\

# Perform role transforms
RUN C:\tools\scripts\Invoke-XdtTransform.ps1 -Path .\ -XdtPath C:\transforms\role
