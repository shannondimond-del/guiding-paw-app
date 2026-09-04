// src/lib/capacitorHealth.js
//
// Wraps @capgo/capacitor-health so the rest of the app can call two simple
// functions without thinking about HealthKit vs. Health Connect, permission
// prompts, or the website build (which has no native health store at all).
//
// Docs: https://capgo.app/docs/plugins/health/

import { Health } from '@capgo/capacitor-health';
import { Capacitor } from '@capacitor/core';

// Data types we request WRITE access for. We never read anything back —
// this only sends data to Health / Health Connect, never pulls from it.
// exerciseTime is iOS-only (Apple Exercise Time); Android has no equivalent
// writable "duration" metric outside a full workout session, which this
// plugin only supports reading, not writing — so duration on Android is
// implicitly represented by the start/end timestamps on the samples below.
const WRITE_TYPES = Capacitor.getPlatform() === 'ios'
    ? ['distance', 'calories', 'exerciseTime']
    : ['distance', 'calories'];

// ── Calorie estimate ─────────────────────────────────────────────────────
// We don't currently collect the dog walker's body weight anywhere in the
// app, so this is a MET-based estimate (3.5 METs = casual walking pace)
// against an assumed average adult weight. It's a real, useful number —
// not a fabricated one — but it IS an estimate, not a measurement.
// TODO: if/when body weight is ever collected in Settings, swap
// DEFAULT_WEIGHT_KG below for the real per-user value for real accuracy.
const DEFAULT_WEIGHT_KG = 70; // ~154 lb
const WALK_MET = 3.5;
function estimateCalories(durationSec) {
    const hours = durationSec / 3600;
    return Math.round(WALK_MET * DEFAULT_WEIGHT_KG * hours);
}

// Checks current permission status WITHOUT prompting the user.
// Returns 'unavailable' | 'authorized' | 'not-authorized'.
// Safe to call on every screen mount (e.g. when the Activity tab opens).
export async function getHealthSyncStatus() {
    if (!Capacitor.isNativePlatform()) return 'unavailable'; // running as the website
    try {
        const avail = await Health.isAvailable();
        if (!avail.available) return 'unavailable';
        const status = await Health.checkAuthorization({ write: WRITE_TYPES });
        const allGranted = WRITE_TYPES.every(t => status.writeAuthorized.includes(t));
        return allGranted ? 'authorized' : 'not-authorized';
    } catch (err) {
        console.error('[health] status check failed:', err);
        return 'unavailable';
    }
}

// Prompts the native OS permission dialog. Safe to call even if already
// granted — the OS just returns the existing status without re-prompting.
export async function requestHealthAccess() {
    if (!Capacitor.isNativePlatform()) return false;
    try {
        const avail = await Health.isAvailable();
        if (!avail.available) return false;
        const status = await Health.requestAuthorization({ write: WRITE_TYPES });
        return WRITE_TYPES.every(t => status.writeAuthorized.includes(t));
    } catch (err) {
        console.error('[health] permission request failed:', err);
        return false;
    }
}

// Writes one completed walk to Apple Health / Health Connect.
// Returns true if it actually wrote data, false otherwise (website build,
// no permission, Health Connect not installed, plugin error, etc.) — use
// this return value to set the walk log's "synced" flag for real, instead
// of hardcoding it to true.
export async function writeWalkToHealth({ startDate, endDate, distanceMi, durationSec }) {
    if (!Capacitor.isNativePlatform()) return false;

    try {
        const avail = await Health.isAvailable();
        if (!avail.available) return false;

        let status = await Health.checkAuthorization({ write: WRITE_TYPES });
        let allGranted = WRITE_TYPES.every(t => status.writeAuthorized.includes(t));
        if (!allGranted) {
            status = await Health.requestAuthorization({ write: WRITE_TYPES });
            allGranted = WRITE_TYPES.every(t => status.writeAuthorized.includes(t));
        }
        if (!allGranted) return false; // user said no — respect it, don't retry mid-flow

        const distanceMeters = distanceMi * 1609.344;
        const calories = estimateCalories(durationSec);

        await Health.saveSample({ dataType: 'distance', value: distanceMeters, startDate, endDate });
        await Health.saveSample({ dataType: 'calories', value: calories, startDate, endDate });

        if (Capacitor.getPlatform() === 'ios') {
            await Health.saveSample({
                dataType: 'exerciseTime',
                value: Math.round(durationSec / 60), // minutes
                startDate,
                endDate,
            });
        }

        return true;
    } catch (err) {
        console.error('[health] failed to write walk:', err);
        return false;
    }
}