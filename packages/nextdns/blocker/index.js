/**
 * This script manages automatic blocking and unblocking of TLDs (Top-Level Domains)
 * using the NextDNS API. Blocking is activated during specific periods (days and hours)
 * defined by environment variables. The script uses the Madrid time zone to determine
 * when to apply or remove blocks.
 */

import { DateTime } from "luxon";
import axios from "axios";

export const main = async (args) => {
  try {
    const axios = (await import("axios")).default;
    const { DateTime } = await import("luxon");

    // NextDNS API Token and Profile ID from environment variables
    const TOKEN = process.env.NEXTDNS_API_TOKEN;
    const PROFILE_ID = process.env.NEXTDNS_PROFILE_ID;
    const BLOCKED_TLDS = process.env.BLOCKED_TLDS || "com,net";
    const TIMEZONE = process.env.TIMEZONE || "Europe/Madrid"; // New environment variable with default

    /**
     * Determines if it's time to block TLDs based on current day and hour and defined blocking periods.
     * @param {number} currentDay - Current day of the week (1-7, where 1 is Monday)
     * @param {number} currentHour - Current hour (0-23)
     * @param {number[]} blockDays - Array with start and end days for blocking period
     * @param {number[]} blockHours - Array with start and end hours for blocking period
     * @returns {boolean} True if it's blocking time, false otherwise
     */
    function isBlockingTLDsTime(
      currentDay,
      currentHour,
      blockDays,
      blockHours
    ) {
      const [startDay, endDay] = blockDays;
      const [startHour, endHour] = blockHours;

      return (
        currentDay >= startDay &&
        currentDay <= endDay &&
        currentHour >= startHour &&
        currentHour < endHour
      );
    }

    /**
     * Blocks a specific TLD using the NextDNS API.
     * @param {string} tld - The TLD to block
     */
    async function blockTLD(tld) {
      try {
        // TODO: Check if the TLD is already blocked
        await axios.post(
          `https://api.nextdns.io/profiles/${PROFILE_ID}/security/tlds`,
          { id: tld },
          {
            headers: {
              "x-api-key": TOKEN,
              "Content-Type": "application/json",
            },
          }
        );
        console.log(`Blocked TLD: ${tld}`);
      } catch (error) {
        console.error(`Error blocking TLD ${tld}:`, error.message);
      }
    }

    /**
     * Unblocks a specific TLD using the NextDNS API.
     * @param {string} tld - The TLD to unblock
     */
    async function unblockTLD(tld) {
      try {
        // TODO: Check if the TLD is already unblocked
        await axios.delete(
          `https://api.nextdns.io/profiles/${PROFILE_ID}/security/tlds/${tld}`,
          {
            headers: {
              "x-api-key": TOKEN,
              "Content-Type": "application/json",
            },
          }
        );
        console.log(`Unblocked TLD: ${tld}`);
      } catch (error) {
        console.error(`Error unblocking TLD ${tld}:`, error.message);
      }
    }

    /**
     * Manages blocking or unblocking of all specified TLDs.
     * @param {boolean} shouldBlock - True to block TLDs, false to unblock
     * @returns {Object} Response object with body indicating the action taken
     */
    async function manageTLDs(shouldBlock) {
      const tlds = BLOCKED_TLDS.split(",");
      for (const tld of tlds) {
        if (shouldBlock) {
          await blockTLD(tld.trim());
        } else {
          await unblockTLD(tld.trim());
        }
      }
      return {
        body: `TLDs ${shouldBlock ? "blocked" : "unblocked"}: ${BLOCKED_TLDS}`,
      };
    }

    // Check if required environment variables are set
    if (!TOKEN || !PROFILE_ID) {
      return {
        body: "Error: NEXTDNS_API_TOKEN or NEXTDNS_PROFILE_ID environment variable is not set.",
      };
    }

    // Get current time and day in the specified time zone
    const now = DateTime.now().setZone(TIMEZONE);
    const hour = now.hour;
    const day = now.weekday; // 1 for Monday, 7 for Sunday

    console.log(`Current ${TIMEZONE} time: ${now.toISO()}`);
    console.log(`Current ${TIMEZONE} hour: ${hour}`);
    console.log(`Current ${TIMEZONE} day: ${day} (1 = Monday, 7 = Sunday)`);

    // Define blocking period using environment variables
    const blockDays = process.env.BLOCK_TLDS_DAYS_PERIOD
      ? process.env.BLOCK_TLDS_DAYS_PERIOD.split(",").map(Number)
      : [1, 5];
    const blockHours = process.env.BLOCK_TLDS_HOURS_PERIOD
      ? process.env.BLOCK_TLDS_HOURS_PERIOD.split(",").map(Number)
      : [6, 9];

    // Determine whether to block or unblock TLDs based on current time
    if (isBlockingTLDsTime(day, hour, blockDays, blockHours)) {
      await manageTLDs(true);
    } else {
      await manageTLDs(false);
    }

    return { body: "Function executed successfully" };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: { error: "An error occurred" },
    };
  }
};
