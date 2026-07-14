# EstatePilot AI v12 Release Notes

## Fókusz

A v12 már go-live kontrollréteget ad a v11 enterprise/pilot alapra. Nem újabb látványfunkciókat halmoz, hanem azt mutatja meg, hogy mikor lehet a rendszert biztonságosan éles demóra, pilotra vagy production környezetre vinni.

## Új modulok

- Provider Health Matrix
- Acceptance Test Center
- Deployment Environments
- Domain Readiness
- Secret Rotation Center
- SLO & Synthetic Journeys
- V12 Go-Live Readiness Center

## Új parancs

```bash
npm run release:v12-check
```

Ez végigfuttatja az env/provider/acceptance/domain/secret/SLO/v12 readiness ellenőrzéseket, majd a v11 release checket is.
