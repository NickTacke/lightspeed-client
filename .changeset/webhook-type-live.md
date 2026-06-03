---
"lightspeed-client": patch
---

fix webhook and type schemas against live data: webhook now models the real fields (isActive, itemGroup, itemAction, format, address, language) instead of nonexistent url/secret/extra; type no longer requires createdAt/updatedAt. previously webhooks.get/list and types.get/list threw on real records.
