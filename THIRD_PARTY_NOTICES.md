# Third-Party Notices

This project uses third-party libraries and hosted scripts. This file is a lightweight notice for GitHub publication and repository redistribution.

## Bundled npm dependencies

### `three`

- License: `MIT`
- Repository: `https://github.com/mrdoob/three.js`

### `@ar-js-org/ar.js-threejs`

- License: `MIT`
- Repository: `https://github.com/kalwalt/AR.js-threex.git`

### `vite`

- License: `MIT`
- Repository: `https://github.com/vitejs/vite.git`

### `typescript`

- License: `Apache-2.0`
- Repository: `https://github.com/microsoft/TypeScript.git`

### `@vitejs/plugin-basic-ssl`

- License: `MIT`
- Repository: `https://github.com/vitejs/vite-plugin-basic-ssl.git`

## Runtime-hosted browser scripts

The `phone-ar.html` page currently loads the following browser scripts from external CDNs at runtime:

### `A-Frame`

- URL: `https://aframe.io/releases/1.6.0/aframe.min.js`
- Upstream: `https://aframe.io/`
- Typical upstream license: `MIT`
- Version pinning: `1.6.0`

### `AR.js A-Frame build`

- URL: `https://raw.githack.com/AR-js-org/AR.js/3.4.7/aframe/build/aframe-ar.js`
- Upstream: `https://github.com/AR-js-org/AR.js`
- Typical upstream license: `MIT`
- Version pinning: `3.4.7`

## Notes

- This repository does not vendor `node_modules/`.
- Browser-hosted scripts may change availability or behavior independently of this repository.
- Runtime browser assets are version-pinned where practical, but they are still externally hosted.
- If you need stronger reproducibility for public release, vendor all runtime browser assets locally instead of using CDN-hosted URLs.
