# Audio-electronics filterAttributes normalization — post-write report

Run: `audioElectronics.mjs --write` (single transaction `GhUTqnkp8hhcHuJpSRhTzF`), then dry-run re-verify.
Backup: `sanity-cms/backups/backup_audio-electronics_bulk_2026-09-29T10-07-26-575Z.json`
Post-write dry run: 0 docs to patch (idempotent). 234 audio-electronics docs total.

Patched: deviceType ×56, inputs ×2 (`xlr` → `xlr-balanced`), condition ×169.

## UNRESOLVED (deviceType still missing)

- AudioQuest Jitterbug FMJ (k27n1AQuIbSr5iozG1vKge)
- Topping L30 II (n10eAegrGspodtsQvy3fgK)
- iFi Zen CAN 3 (xMEqvkRBbdrlJXyFG8huOv)

## Value counts (after patches)

    deviceType:
      dac: 128
      headphone-amplifier: 43
      network-streamer: 24
      digital-audio-player: 12
      preamplifier: 10
      integrated-amplifier: 9
      cd-player-transport: 3
      power-amplifier: 2
      <missing>: 3
    formFactor:
      desktop: 168
      portable: 60
      dongle: 5
      <missing>: 1
    deviceConnectivity:
      wired: 136
      wired-wireless: 61
      wifi-networked: 30
      bluetooth: 4
      <missing>: 3
    inputs:
      usb: 161
      coaxial: 94
      bluetooth: 92
      optical: 92
      rca: 82
      xlr-balanced: 69
      phono-mm-mc: 33
      aes-ebu: 21
      ethernet-lan: 18
      hdmi-earc: 16
      i2s-iis: 14
      <missing>: 38
    amplification:
      solid-state: 36
      tube: 10
      hybrid: 3
      class-d: 1
      <missing>: 184
    dacIncluded:
      true: 170
      false: 64
      <missing>: 0
    balancedOutput:
      true: 122
      false: 106
      <missing>: 6
    dsdSupport:
      dsd256-plus: 141
      dsd128: 6
      none: 2
      dsd64: 1
      <missing>: 84
    dacChipsetFamily:
      ess-sabre: 77
      akm: 24
      r2r-ladder: 14
      cirrus-logic: 12
      <missing>: 107
    streamingPlatformSupport:
      roon-ready: 68
      dlna: 35
      airplay2: 33
      tidal-connect: 26
      spotify-connect: 21
      chromecast: 1
      <missing>: 163
    bluetoothCodecs:
      LDAC: 48
      AAC: 45
      SBC: 44
      aptX HD: 42
      aptX: 40
      aptX Adaptive: 25
      aptx-hd: 19
      sbc: 18
      aptX LL: 18
      ldac: 16
      aac: 14
      aptx: 13
      aptX Lossless: 2
      aptx-ll: 2
      LC3: 1
      <missing>: 153
    condition:
      new: 218
      open-box: 16
      <missing>: 0

## Turntable-only fields (live docs, any category, non-null)

    driveType: 0
    turntableOperation: 0
    speedsSupported: 2
    phonoPreampBuiltIn: 0
    cartridgeIncluded: 0
    usbDigitalOutput: 0
