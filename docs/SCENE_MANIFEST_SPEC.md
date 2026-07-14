# V17 Scene Manifest Specification

The scene manifest is the stable contract between reconstruction providers and web viewers.

## Required sections

- `version`
- `sceneId`
- `listingId`
- `viewer.adapter`
- `viewer.publicUrl`
- `assets.splatUrl` or `assets.ksplatUrl` or `assets.plyUrl`
- `quality.overallScore`
- `compliance.disclosureRequired`
- `compliance.disclosureText`
- `compliance.publishGate`

## Publish rule

A scene should not be presented as an exact measurement source unless a verified measurement provider is connected. It must be labeled as an AI reconstruction preview and the original photos/floorplan must remain accessible.
