import fs from "fs";
import Stripe from "stripe";

const env = Object.fromEntries(
  fs
    .readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      let val = l.slice(i + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      return [l.slice(0, i), val];
    })
);

const stripe = new Stripe(env.STRIPE_SECRET_KEY);
const subId = "sub_1TlVJ5PKUGu1fHDYGYm7LF5s";
const sub = await stripe.subscriptions.retrieve(subId);
const firstItem = sub.items.data[0];

console.log(
  JSON.stringify(
    {
      subscription_id: sub.id,
      status: sub.status,
      top_level_current_period_start: sub.current_period_start,
      top_level_current_period_end: sub.current_period_end,
      start_date: sub.start_date,
      billing_cycle_anchor: sub.billing_cycle_anchor,
      item_id: firstItem?.id,
      item_current_period_start: firstItem?.current_period_start,
      item_current_period_end: firstItem?.current_period_end,
      item_current_period_start_iso: firstItem?.current_period_start
        ? new Date(firstItem.current_period_start * 1000).toISOString()
        : null,
      item_current_period_end_iso: firstItem?.current_period_end
        ? new Date(firstItem.current_period_end * 1000).toISOString()
        : null,
      subscription_top_level_keys_with_period: Object.keys(sub).filter((k) =>
        k.includes("period")
      ),
      item_keys_with_period: firstItem
        ? Object.keys(firstItem).filter((k) => k.includes("period"))
        : [],
    },
    null,
    2
  )
);
