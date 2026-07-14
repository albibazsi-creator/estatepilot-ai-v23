# SDK Examples

```ts
import { EstatePilotClient } from "./sdk/typescript/client";

const client = new EstatePilotClient({
  baseUrl: "https://your-estatepilot-domain.com",
  apiKey: process.env.ESTATEPILOT_API_KEY!
});

const listings = await client.listPartnerListings();
console.log(listings);
```

## Partner lead

```ts
await client.createPartnerLead({
  listingSlug: "budapest-13-kerulet-erkelyes-lakas-62m2",
  name: "Kovács Péter",
  phone: "+36301234567",
  gdprConsent: true,
  message: "Megtekintést szeretnék."
});
```

## Privacy export request

```ts
await client.requestPrivacyExport({ requesterEmail: "buyer@example.com" });
```
