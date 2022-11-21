Minecraft Manager
=================

A simple little application for interfacing with a
[Portainer](https://www.portainer.io/) server to manage Minecraft servers via
Docker.

## Technology

Backend: [NestJS](https://nestjs.com/)
Frontend: [Create React App](https://create-react-app.dev/)

## Requirements

A Portainer server where you would like to host Minecraft server instances.
A web server to host this app (it can be the Portainer server too).

## Important Notes

This is a little tool I put together so my sons could set up/start/stop their
own Minecraft servers. It is intended to be run inside a home network,
protected by a firewall. **DO NOT EXPOSE THIS TO THE INTERNET!!** There is no
authentication/authorization at all.
