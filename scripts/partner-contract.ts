import { partnerApiContractV2 } from "../lib/partner-contract";

if (!partnerApiContractV2.endpoints.length) {
  throw new Error("Partner API contract has no endpoints");
}
console.log(JSON.stringify(partnerApiContractV2, null, 2));
