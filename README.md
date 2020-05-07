# vLight

**:construction: This project is a Work in Progress! :hammer_and_wrench:**

## Software Needed

- [Node.js](https://nodejs.org/en/)
- [Yarn](https://yarnpkg.com/lang/en/)

Build tools for native Node.js addons are also needed depending on your platform.

### Docker

You can also build and run this project through Docker (in a Linux container):

```
> ./docker-build.sh
> ./docker-run.sh
```

## Getting Started

Install and setup:

```sh
> yarn
```

Start in development mode with hot reloading:

```sh
> yarn start
```

Start in production mode:

```sh
> yarn start:prod
```

### Windows Notes

The automatic installation of the Visual Studio Build tools does not include all features that are necessary to compile this project's addons. Find them under "Control Panel > Software / Apps & Features" and change the installation to contain the following features:

- Visual C++ ATL for x86 and x64

## DMX Interfaces

- ArtNet
- USB for [FX5](https://fx5.de/) and [Digital Enlightenment](http://www.digital-enlightenment.de/)
- Custom Binary protocol

## Documentation

[vLight Client Protocol via REST/WebSocket](./backend/src/services/api/README.md)

[vLight Binary Protocol via TCP/UDP](./backend/src/devices/vlight/README.md)
