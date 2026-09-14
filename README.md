# Hisab V1 — Mobile Android Build Preparation

Base checkpoint: Hisab V1 Guest Mode prototype.

## Included
- Business Khata
- Personal Udhaar
- Budget & saving planner
- EMI/loan planner
- Bills/subscriptions
- Family planning tools
- Guest Mode / no-login use
- Local device storage

## Mobile-only Android route
This checkpoint adds a Capacitor wrapper and a GitHub Actions workflow so the project can be built in the cloud without a laptop.

Workflow:
1. Upload/extract this project into a GitHub repository.
2. Open Actions.
3. Run **Hisab Android APK** manually.
4. Download the generated `hisab-v1-debug-apk` artifact.
5. Install and test it on an Android phone.

Important:
- This is a DEBUG APK build for testing, not a Play Store signed AAB.
- Data remains local in the current prototype.
- Google login is not required for normal Guest Mode use.
- Play Store release signing, privacy/ad configuration, and final AAB preparation are later steps.
