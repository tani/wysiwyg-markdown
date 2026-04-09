# Change Log

All notable changes to the "wysiwyg-markdown" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [0.2.2] - 2026-04-09

- Fix: Prevent cursor reset when VS Code Auto Save is enabled.
- Fix: Skip redundant updates in the extension host using content-based filtering.
- Test: Add test case for auto-save scenario in provider unit tests.

## [0.2.1] - 2026-04-09

- Fix: Prevent cursor reset while typing by breaking the circular update loop.
- Fix: Improve text normalization to avoid redundant synchronization.
- Test: Add comprehensive unit tests and integration tests for editor synchronization.
- Test: Correct extension identifier in existing tests.

## [0.2.0] - 2026-04-05

- Initial release with Vditor integration.