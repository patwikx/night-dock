# Optional ad/upload service and update guard

These scripts apply the ad/upload service and firmware-update settings verified on an LG 55UT8050PSB running firmware 33.31.75 and webOS 10.3.2. They run separately from the launcher package and require an already rooted TV with Homebrew startup support and Node.js. Installing Night Dock does not enable them.

## What changes

- Sets `support.automaticUpdate` to `off` and enables Homebrew's `webosbrew_block_updates` flag.
- Applies Homebrew's update-host block immediately: `snu.lge.com`, `su-dev.lge.com`, `su.lge.com` and `su-ssl.lge.com` resolve to IPv4/IPv6 loopback. The existing Homebrew startup script recreates this block at boot.
- Removes the admanager, adoverlay and uploadd registrations from the running service bus using `removeOneManifest`. Their original manifest files are retained.
- Runtime-masks `uploadd.service` and stops the three targeted executables. A one-shot Homebrew boot hook reapplies this configuration; there is no polling daemon or repeated kill loop.

The scripts do not flash firmware, patch the system image, replace binaries, or edit the original service definitions. They change writable settings, add Homebrew files, bind a writable hosts file at runtime, and change runtime service-bus/systemd state. Core logging, voice, networking, audio, display and contentminer services are outside their scope. They do not change `dbgLogUpload` or `faultLogUpload`.

Disabling these optional services can affect LG advertising controls, ad overlays and diagnostic uploads. This does not establish that every tracker is blocked. The update block does not prevent manual USB installation or guarantee coverage of every possible update endpoint. Disabling automatic updates also means firmware security fixes will not install automatically.

The implementation follows [Homebrew's startup update block](https://github.com/webosbrew/webos-homebrew-channel/blob/main/services/startup.sh) and the [webOS service-bus manifest API](https://www.webosose.org/docs/reference/ls2-api/com-webos-service-bus/#removeonemanifest). API availability and service dependencies can differ on other firmware.

## Fresh setup

Use an existing root SSH alias. Keep SSH keys outside the repository. From the project directory:

```sh
export TV_HOST=your-root-tv-ssh-alias
ssh "$TV_HOST" 'umask 077; mkdir -p /var/lib/webosbrew/nightdock-privacy-guard'
scp scripts/tv-privacy-guard/*.cjs "${TV_HOST}:/var/lib/webosbrew/nightdock-privacy-guard/"
ssh -tt "$TV_HOST" 'node /var/lib/webosbrew/nightdock-privacy-guard/snapshot.cjs'
```

The snapshot saves original settings, host contents, service state and selected system-file hashes on the TV. It refuses to overwrite an existing snapshot or an existing guard hook. Preserve that snapshot for rollback; do not copy saved device state into the public repository.

Apply the configuration only after the snapshot succeeds:

```sh
ssh -tt "$TV_HOST" 'node /var/lib/webosbrew/nightdock-privacy-guard/apply.cjs'
```

After successful application, install the boot hook:

```sh
scp scripts/tv-privacy-guard/privacy-update-guard "${TV_HOST}:/var/lib/webosbrew/init.d/privacy-update-guard"
ssh "$TV_HOST" 'chmod 755 /var/lib/webosbrew/init.d/privacy-update-guard'
```

All three `.cjs` scripts locate their state beside themselves. The example uses a generic writable Homebrew directory; the hook must point to the chosen `apply.cjs` path.

If application fails partway through, use the saved rollback instead of discarding the snapshot. Partial settings or service changes may already have been applied.

## Verification performed

On the tested TV, automatic updates read `off`, the Homebrew update-block flag existed, and all four update hostnames resolved only to loopback. Direct calls to the three targeted services returned `Service does not exist`, and their executable processes were absent. The boot hook was run directly a second time successfully.

SHA-256 checks of the original three manifests and the admanager, adoverlay-service, uploadd, update and ls-hubd binaries matched their saved hashes. Night Dock remained ready in the foreground. Core logging, voice, audio, networking, the application manager and compositor remained running. A subsequent cold reboot and all LG features have not been verified after this change.

## Rollback

```sh
ssh -tt "$TV_HOST" 'node /var/lib/webosbrew/nightdock-privacy-guard/rollback.cjs'
```

Rollback removes this boot hook, restores the three original service-bus registrations, removes the newly introduced runtime upload-service mask, restores the original automatic-update value and update-block flag/hosts state, and starts previously running targeted services.

**If automatic updates were originally on, rollback turns them back on.** This restores the recorded configuration, rather than keeping the new update protection.

The rollback script passed syntax checking; a complete rollback was not executed because it would undo the requested protection. Keep the on-TV state files and scripts together.
