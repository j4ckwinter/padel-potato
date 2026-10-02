# Run the friends beta

Use iOS or Android as the primary review target. Web Storybook is a secondary component review tool.

## Configure the backend

Copy `.env.example` to `.env.local`. Set the hosted Supabase URL and publishable key. Never bundle a service-role key.

Apply every committed migration before starting the app against that project. The game management migration adds leave and reschedule functions.

For email confirmation and recovery, allow these redirect URLs in Supabase Authentication URL Configuration.

- `padel-potato://auth-callback?flow=signup`
- `padel-potato://auth-callback?flow=recovery`

Allow the app's OAuth redirect URI for Apple and Google. Configure the providers' credentials in Supabase. Verify provider callbacks on native devices.

## Verify locally

Run `npm ci`, then `npm run verify`.

Start local Supabase with `npx supabase start`. Run `npm run supabase:test`. This resets only the local database. The checks cover profiles, game results, storage, game management, favourites, invitation races, and real recovery email delivery through local Mailpit.

On this Mac, Docker uses `unix:///Users/jackwinter/.docker/run/docker.sock`. Set `DOCKER_HOST` to that socket for Supabase commands if its default socket is unavailable.

## Build a beta

The app identifiers are `com.padelpotato.app` on both platforms. The EAS preview profile produces an Android APK and an internal iOS build. The development profile uses the iOS simulator. These are regular app builds. They do not require Expo Go.

Run `npx eas-cli build:configure` to connect this repository to an EAS project. Set the two public Supabase environment variables in the selected EAS environment. Run `npx eas-cli build --profile preview --platform android` or the corresponding iOS command. iOS device distribution requires an Apple Developer account and registered devices.

For local Android builds, install an Android SDK and JDK 17 or newer. Set `ANDROID_HOME` and `JAVA_HOME`. Use `npx expo run:android`. Local iOS builds require full Xcode and a simulator runtime.

## Review the complete journey

Use four test accounts.

1. Register, complete onboarding with a photo, relaunch, and check that the saved profile remains visible.
2. Discover another real player. Favourite that player and verify persistence after relaunch.
3. Create a future game. Invite the other accounts. Accept and decline invitations from the inbox.
4. Have two accounts compete for the final place. Check that only one joins.
5. Leave a future game. Check that a place reopens. Cancel a game as its organiser and check that pending invitations close.
6. Reschedule before another player joins. Confirm that old invitations close. Confirm that rescheduling is unavailable after someone joins.
7. Opt into reminders and allow notification permission. Check a scheduled reminder and tap it to open the correct game. Disable reminders and sign out to check cancellation.
8. Finish a four-player game and record the result. Check completed-game statistics.
9. Sign out, request a password reset, open the email on the device, and choose a new password. Verify that recovery never exposes the product before completion.
10. Review the relevant stories with `npm run storybook:native` on both platforms.

## Beta rules

Only the organiser records results. Opponent confirmation, disputes, and a calculated rating algorithm are later product decisions.

Reminders are device-local and default to off. The app reconciles them after local game changes, on foreground, and while active. Remote game changes while the app is closed cannot update an already scheduled local reminder. Server push delivery is separate work.

The directory and inbox use focus and foreground refreshes. Directory pagination is needed before the account count exceeds the API row limit.
