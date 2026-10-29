/* ─── Same Day Delivery cutoff switch ───────────────────────────────────────
   Shopify Basic can't hide a shipping rate by time of day, so this turns the
   "Same Day Delivery" rate off at Quiqup's cutoff and back on at midnight,
   Dubai time. With the rate off, checkout can't place a Same Day order.
   Run by .github/workflows/same-day-cutoff.yml.

   Cutoffs: 3pm for Dubai, 1pm for Abu Dhabi, Sharjah and Ajman. A zone that
   holds any other emirate (or another country) never gets Same Day.

   Idempotent: each run works out what every Same Day rate should be right
   now and only writes the ones that differ, so a late or missed run heals on
   the next one.

   Local:  node --env-file=../../../.env.local scripts/same-day-cutoff.mjs --dry-run
   SAME_DAY_NOW=2026-10-29T13:05:00+04:00 simulates another time. */

const METHOD_NAME = "Same Day Delivery";
const CUTOFF_MINUTES = { DU: 15 * 60, AZ: 13 * 60, SH: 13 * 60, AJ: 13 * 60 };
const DUBAI_UTC_OFFSET_MINUTES = 4 * 60; // Gulf Standard Time, no DST
const API_VERSION = "2026-04";

const domain =
  process.env.SHOPIFY_STORE_DOMAIN ??
  process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const clientId = process.env.SHOPIFY_ADMIN_CLIENT_ID;
const clientSecret = process.env.SHOPIFY_ADMIN_CLIENT_SECRET;
const dryRun = process.argv.includes("--dry-run");

if (!domain || !clientId || !clientSecret) {
  console.error(
    "Missing SHOPIFY_STORE_DOMAIN, SHOPIFY_ADMIN_CLIENT_ID or SHOPIFY_ADMIN_CLIENT_SECRET",
  );
  process.exit(1);
}

const now = process.env.SAME_DAY_NOW
  ? new Date(process.env.SAME_DAY_NOW)
  : new Date();
const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
const dubaiMinutes = (utcMinutes + DUBAI_UTC_OFFSET_MINUTES) % (24 * 60);
const dubaiClock = `${String(Math.floor(dubaiMinutes / 60)).padStart(2, "0")}:${String(dubaiMinutes % 60).padStart(2, "0")}`;

async function getToken() {
  const res = await fetch(`https://${domain}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "client_credentials",
    }),
  });
  const json = await res.json();
  if (!res.ok || !json.access_token) {
    throw new Error(`Token exchange failed (${res.status})`);
  }
  return json.access_token;
}

async function adminGraphQL(token, query, variables = {}) {
  const res = await fetch(
    `https://${domain}/admin/api/${API_VERSION}/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": token,
      },
      body: JSON.stringify({ query, variables }),
    },
  );
  const json = await res.json();
  if (!res.ok || json.errors) {
    throw new Error(`Admin API error: ${JSON.stringify(json.errors ?? res.status)}`);
  }
  return json.data;
}

const PROFILES_QUERY = `{
  deliveryProfiles(first: 10) {
    nodes {
      id
      profileLocationGroups {
        locationGroup { id }
        locationGroupZones(first: 50) {
          nodes {
            zone { id name countries { code { countryCode } provinces { code } } }
            methodDefinitions(first: 25) { nodes { id name active } }
          }
        }
      }
    }
  }
}`;

const UPDATE_MUTATION = `mutation($id: ID!, $profile: DeliveryProfileInput!) {
  deliveryProfileUpdate(id: $id, profile: $profile) {
    userErrors { field message }
  }
}`;

/** Minutes after Dubai midnight when Same Day closes for this zone; 0 = never open. */
function zoneCutoff(zone) {
  const codes = zone.countries.flatMap((c) =>
    c.code.countryCode === "AE" ? c.provinces.map((p) => p.code) : [null],
  );
  if (codes.length === 0) return 0;
  return Math.min(...codes.map((code) => CUTOFF_MINUTES[code] ?? 0));
}

const token = await getToken();
const { deliveryProfiles } = await adminGraphQL(token, PROFILES_QUERY);

console.log(`Dubai time ${dubaiClock}${dryRun ? " (dry run)" : ""}`);
let changes = 0;

for (const profile of deliveryProfiles.nodes) {
  const locationGroupsToUpdate = [];
  for (const group of profile.profileLocationGroups) {
    const zonesToUpdate = [];
    for (const { zone, methodDefinitions } of group.locationGroupZones.nodes) {
      const cutoff = zoneCutoff(zone);
      const wanted = dubaiMinutes < cutoff;
      const methodDefinitionsToUpdate = [];
      for (const method of methodDefinitions.nodes) {
        if (method.name !== METHOD_NAME) continue;
        const action = method.active === wanted ? "ok" : wanted ? "turn on" : "turn off";
        console.log(`  ${zone.name}: ${method.active ? "on" : "off"} → ${action}`);
        if (method.active !== wanted) {
          methodDefinitionsToUpdate.push({ id: method.id, active: wanted });
        }
      }
      if (methodDefinitionsToUpdate.length) {
        zonesToUpdate.push({ id: zone.id, methodDefinitionsToUpdate });
      }
    }
    if (zonesToUpdate.length) {
      locationGroupsToUpdate.push({ id: group.locationGroup.id, zonesToUpdate });
    }
  }
  if (!locationGroupsToUpdate.length) continue;
  changes += locationGroupsToUpdate.length;
  if (dryRun) continue;
  const { deliveryProfileUpdate } = await adminGraphQL(token, UPDATE_MUTATION, {
    id: profile.id,
    profile: { locationGroupsToUpdate },
  });
  if (deliveryProfileUpdate.userErrors.length) {
    throw new Error(JSON.stringify(deliveryProfileUpdate.userErrors));
  }
}

console.log(changes ? (dryRun ? "Would update." : "Updated.") : "Nothing to change.");
