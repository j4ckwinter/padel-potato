# Android product verification

The local Android SDK 36 arm64 emulator runs the native debug APK `com.padelpotato.app` against local Supabase through `adb reverse`.

- PASS. Favourite saved from player details appears under My players after a force-stop and native relaunch.
- PASS. Create form produces an organiser-owned scheduled game and shows Game created.
- PASS. Reschedule changes the saved day and start time and returns to game details. The initial attempt exposed a Fabric reparenting crash. `DayTimeSelector` now keeps its outer native view stable with `collapsable={false}`. The repeatable six-step plan passed after a full Metro cache restart.
- PASS. Reminder opt-in shows the Android permission prompt. Allow enables the switch and schedules a native RTC alarm one hour before the saved game. A second timed backend fixture delivered an actual local notification through the Android inexact alarm window; tapping the notification opened the correct game.
- PASS. A backend-seeded invitation appears in the native inbox. Accept changes it to accepted and the game details expose Leave game.
- PASS. Leave game confirmation removes the player and exposes Join game.
- PASS. Recovery opens the native password update gate from a real local Supabase callback. A matching new password returns to product Home. Backend verification separately confirmed the original password is denied and the new password works. Generating the callback before global signout initially invalidated its session, so the valid fixture was regenerated after signout.
- PASS. Cancel game confirmation changes the organiser game to cancelled. Its native scheduled alarm is removed.

Backend fixture creation is setup. The actions above were performed through native UI. Screenshots contain no entered credentials.

Rerun from a scheduled organiser game details screen with `python3 scripts/verify-native-android.py --adb <adb> --serial <serial> --plan .audit/native/android-reschedule-plan.json`. The saved plan uses the dates from this verification run and needs new future dates for a later run.

- PASS. Outgoing invite from a game open slot changes the chosen player to Invited and shows Invitation sent.
- PASS. A second incoming fixture was declined through the native inbox.
- PASS. Native result entry saved 7-5, 6-4 and rendered Game completed / YOU WON. Cold relaunch rendered Games 1 / Win rate 100%. Immediate profile statistics were stale before relaunch. The focus refresh repair was then verified: baseline Games 1, controlled backend second result, Games to Profile without app restart showed Games 2.
- PASS. Android native Storybook rendered DayTimeSelector canonical disabled false to true to false and Avatar canonical. Product Metro configuration was restored afterward.

- PASS. Fresh Expo Go data clear and a new Metro port rendered the product sign-in screen. The local notification adapter no longer triggers the root remote-push import failure.
- PASS. A queued inexact Android alarm remained the same after foreground reconciliation 12 seconds after its nominal due time, subsequently delivered, and its notification opened the correct delayed-reminder game. See the before/after dumps and delivered screenshot.

- PASS. Actual email registration entered onboarding. Native system photo picker selected a repository brand PNG fixture, all three onboarding steps completed, and a cold relaunch retained the new identity, uploaded avatar and preferences. See android-signup-onboarding-completed.png and android-signup-persisted.png.

The repeated reschedule plan ran twice (six steps each); the result JSON retains only the latest six-step run. iOS native proof remains unavailable on this host. Google and Apple provider sign-in requires external configured provider credentials and was not claimed. The dev build sometimes emits an ExpoRoot ContextNavigator mount warning, which was dismissed through LogBox; no application suppression was added.
