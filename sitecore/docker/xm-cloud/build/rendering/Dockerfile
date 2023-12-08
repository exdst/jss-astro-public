# escape=`

#
# Development-only image for running Next.js in a containerized environment.
# Assumes that the Next.js rendering host source is mounted to c:\app.
#

ARG PARENT_IMAGE
FROM ${PARENT_IMAGE} as debug

WORKDIR /app/packages/astro-sitecore-jss-sample

EXPOSE 4321
#ENTRYPOINT "npm install && npm install next@canary && npm run start:connected"
ENTRYPOINT "npm install && npm run dev"