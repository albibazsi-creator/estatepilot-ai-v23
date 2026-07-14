# Import / Export specifikáció

## Listing JSON import

Endpoint: `POST /api/import/listings`

```json
{
  "listings": [
    {
      "title": "Új listing",
      "propertyType": "lakás",
      "city": "Budapest",
      "district": "XI. kerület",
      "price": 82900000,
      "sizeM2": 58,
      "rooms": 2,
      "descriptionRaw": "Belső leírás"
    }
  ]
}
```

## Listing export

- `GET /api/exports/listings?format=json`
- `GET /api/exports/listings?format=csv`

## Listing package export

- `GET /api/listings/:id/export-package`

Ez tartalmazza a listing alapadatokat, média listát, tourt, alaprajzot, AI outputokat, kampányokat, seller report summaryt és publish checklistet.
