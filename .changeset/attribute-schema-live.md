---
"lightspeed-client": patch
---

fix attribute schema against live data: no longer requires createdAt/updatedAt (the api omits them) and models defaultValue + types. previously attributes.create threw on the response.
