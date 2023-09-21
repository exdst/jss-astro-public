# escape=`

ARG PARENT_IMAGE
ARG SPE_IMAGE
ARG HEADLESS_SERVICES_IMAGE

FROM ${SPE_IMAGE} AS spe_services
FROM ${HEADLESS_SERVICES_IMAGE} AS headless_services
FROM ${PARENT_IMAGE}


# Copy and init the SPE / Sitecore Powershell Extensions
COPY --from=spe_services C:\module\db C:\resources\spe

# Copy and init the JSS / Headless Services Module
COPY --from=headless_services C:\module\db C:\resources\jss