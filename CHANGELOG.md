# Changelog

## December 2023

- Added "Save as Memory" button for fixture and fixture group states
- Added map legend in fixture test mode
- Added printing of local network address and QR code when starting
- Improvements for dynamic pages
  - Improved behavior when selecting and deselecting entities
- Fixed Node 21 compatibility by replacing `usb-detection` with `usb`
- Fixed fading for multiple live chases at the same time

## September 2023

- Improvements for the map page
  - The map can now be rotated by 180 degrees
- Improvements for fixture groups
  - Group members can now be toggled on the map
- Improvements for memories
  - Added new display modes: Fader, flash button or toggle button
  - Added mirroring mode for gradients
  - Added state and gradient ordering by map coordinates
- Improvements for live chases
  - Added "same color" and "same state" modes for all active members
- Improvements for dynamic pages
  - Filter out already selected entities when selecting more
  - Selected entities can be reordered via drag & drop
- Fixed live memory members getting lost after changing its name

## May 2023

- Added global DMX universe fading
- The DMX master no longer affects non-color channels for fixtures with a master channel
- Fixed widget mapping input changing during typing
- Fixed errors when starting with a non-existent project directory

## February / March 2023

- Improvements for memories
  - Made live memory widgets smaller by moving the fixture selection and preview into dialogs
- Improvements for live chases
  - Made widgets smaller by moving the fixture selection into a dialog
  - Added "Stop all" button to global control widget and chases page
- Improvements for dynamic pages
  - Added mapping filter for fixture and group widgets
- Improvements to the configuration
  - Added button to clone a configuration entry
  - Added ability to position fixtures on the map via mouse and touch
  - When deleting a group, members chases and memories are changed to contain the group's members instead
- Added position picker control for controlling pan/tilt of moving heads
- Added fixture dialogs to map page
- Added corner button to toggle fullscreen mode
- Fixed warning when changing the configuration
- Tried to improve connection loss detection by introducing heartbeats

## December 2022 / January 2023

- New DMX master control for global fading and blackout
- New control to turn all controls off
- Added keyboard input
  - Widgets can be focused using the number keys (or tab with 0)
  - Turn a widget on/off using the Space key
  - When focused, some buttons (e.g. for chases) have hotkeys
  - Navigate to other pages using Shift+number keys
  - Dialogs and prompts can be controlled using the Return or Escape key
- Improvements for live chases
  - Single-mode chases turn off other chases temporarily while in burst mode
  - Color drafts can be applied instantly or deleted
- Improvements for fixtures
  - Added channel offset between multiple fixtures of a definition
- Improvements for dynamic pages
  - Multiple entities of the same type (e.g. memories) can be referenced in a single configuration
  - Improved UI/UX for editing a dynamic page

## July/August 2022

- Added fixture test mode on map page
- Improvements for live chases
  - The colors editor now allows editing all colors at once
  - Colors can be saved as draft
  - Added color library for saving frequently used states
- Improvements for fixtures
  - Display range of occupied channels per definition
  - Default to the first free channel of the largest gap for new fixtures
  - Warn about overlapping channels with other fixtures
