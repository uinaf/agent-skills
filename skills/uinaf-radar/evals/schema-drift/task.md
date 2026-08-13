# Report Radar schema drift without repair

## Problem/Feature Description

The canonical check uniquely resolves the private Project, but its Status options are `Todo`, `In Progress`, and `Done`; the expected Radar, Inbox, Maintenance, and Shipped views are also missing.

Respond to a request for the daily pulse. Do not repair the Project or silently reinterpret the mismatched statuses.
