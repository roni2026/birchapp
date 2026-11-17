# Outrigger Birchstreet

Expo Android wrapper for the Outrigger Birchstreet mobile interface. The existing Vite interface is bundled offline inside a native WebView, while a second WebView maintains the authenticated BirchStreet session and handles DOM bridge actions.

## Requirements

- Node.js 22
- pnpm 10+
- An Expo account
- EAS CLI

## Local checks

```bash
pnpm install
pnpm doctor
pnpm build
```

`pnpm build` rebuilds the Vite interface, embeds it into the Expo bundle, and verifies an Android Expo export.

## Run with Expo

```bash
pnpm start
```

Scan the QR code with Expo Go on Android. The native WebView behavior is best tested in a development or preview build rather than Expo Go.

## Build a test APK

```bash
npm install --global eas-cli
eas login
eas build:configure
eas build --platform android --profile preview
```

The first `eas build:configure` creates or links the Expo project and writes its real EAS project ID into `app.json`. The `preview` profile creates an installable APK. Download it from the URL printed by EAS and open it on the Android phone.

## Build for Google Play

```bash
eas build --platform android --profile production
```

The production profile creates an Android App Bundle (`.aab`).

## Native bridge

The Expo wrapper supports these UI bridge actions:

- Real BirchStreet login using `loginID`, `password`, and subscriber `458`
- Refresh and sync
- Order Sheet entry extraction and selection
- REQ/PO Print w/Details activation

BirchStreet DOM changes may require updates to `native/bridge.ts`.
