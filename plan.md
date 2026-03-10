1. *Update Supabase Client & Schema*
   - Modify `src/lib/supabase.js` to provide a mock implementation for `channel()` to prevent crashes when working without environment variables.
   - Modify `supabase/schema.sql` to add a new table `sf_timer_state` for real-time synchronization of the timer.

2. *Add Data Service Methods*
   - In `src/lib/dataService.js`, add `fetchTimerState`, `upsertTimerState`, and `subscribeToTimer` functions. These will read/write from `sf_timer_state` and use Supabase's Realtime channels.

3. *Refactor `Timer.jsx` Logic (Fix Logic Flaws)*
   - The current timer uses `setInterval` with a state increment/decrement, which causes drift and isn't syncable.
   - Refactor the component to use an absolute timestamp (`lastStartTime`), `accumulatedTime`, and `isActive` status.
   - Calculate current `time` (stopwatch) or `timeLeft` (pomodoro) dynamically based on `Date.now()`.
   - On unmount or app background (or when toggling play/pause), sync the state to Supabase.
   - On load (and via Realtime subscription), update the local state with the cloud state.
   - Implement "Debug Code" (as requested by user) by adding a small debug overlay (or console logs) to visualize the timer state syncing.

4. *Fix UI & Edge Cases (UI Flaws)*
   - Fix progress ring animation (ensure it doesn't jump weirdly when syncing).
   - Ensure the Pomodoro focus message ("Deep Work in Progress") behaves correctly.
   - Handle the case where a timer finishes while the app is closed or when loaded on another device (auto-complete the session and log it).

5. *Complete Pre-commit Steps*
   - Ensure proper testing, verification, review, and reflection are done.

6. *Submit the change*
   - Once all tests pass, submit the change with a descriptive commit message.
