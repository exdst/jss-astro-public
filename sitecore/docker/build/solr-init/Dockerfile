# escape=`

ARG PARENT_IMAGE
ARG EXPERIENCE_ACCELERATOR_IMAGE

FROM ${EXPERIENCE_ACCELERATOR_IMAGE} as sxa_services
FROM ${PARENT_IMAGE}

SHELL ["powershell", "-Command", "$ErrorActionPreference = 'Stop'; $ProgressPreference = 'SilentlyContinue';"]

COPY --from=sxa_services C:\module\solr\cores-sxa.json C:\data\cores-sxa.json