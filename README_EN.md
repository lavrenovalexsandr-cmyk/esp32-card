# ESP32 Lovelace Cards

**A collection of custom Lovelace cards for controlling ESP32 devices through Home Assistant.**

This repository contains two independent cards. They can be used separately or together on the same Home Assistant dashboard.

## Contents

- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Card configuration](#card-configuration)
- [Integration interface](#integration-interface)
- [Repository structure](#repository-structure)
- [Related projects](#related-projects)

## Features

### ESP32 OTA Manager

Card type: `custom:esp32-ota-card`

- Select an ESP32 device.
- Start a firmware OTA update from a URL.
- Optionally provide a GitHub token to access private releases.
- Monitor the current update status.

The card does not download firmware itself. It calls the Home Assistant integration, which sends the update command to the device over MQTT.

### ESP32 Device Control

Card type: `custom:esp32-device-control-card`

- Select an ESP32 device.
- Remotely restart the device.
- Start a Factory Reset.
- Require two confirmations before Factory Reset to prevent accidental resets.

## Requirements

- The `esp32_ota` Home Assistant integration must be installed and configured.
- ESP32 firmware must publish device information and OTA status over MQTT according to the integration protocol.
- The integration must provide the relevant services:
  - `esp32_ota.update`
  - `esp32_ota.restart`
  - `esp32_ota.factory_reset`

## Installation

### Manual installation

1. Download `esp32-cards.js` from this repository.
2. Copy it to the `www` directory in your Home Assistant configuration: `<HA config>/www/esp32-cards.js`.
3. Add the Lovelace resource under **Settings → Dashboards → Resources**:

```yaml
resources:
  - url: /local/esp32-cards.js
    type: module
```

A single JavaScript file registers both cards. You do not need to add a separate resource for each card.

### Installation through HACS

1. Open **HACS** in Home Assistant.
2. Open the three-dot menu in the upper-right corner and select **Custom repositories**.
3. Enter the repository URL:
   `https://github.com/lavrenovalexsandr-cmyk/esp32-card`
4. Select **Dashboard** as the category.
5. Click **Add**.
6. Return to **HACS → Dashboard**. Find and open **ESP32 Lovelace Cards**.
7. Click **Download** and wait for the installation to finish.
8. Restart Home Assistant. Then perform a hard refresh in your browser (for example, `Ctrl + F5`).

**Note:** if HACS reports that the repository already exists in the store (`Repository ... exists in the store`), do not add it again. Go to **HACS → Dashboard** and find **ESP32 Lovelace Cards** there.

HACS should register the card resource automatically. If the custom cards do not appear, open **Settings → Dashboards → Resources** and check that the following resource is present:

```yaml
url: /hacsfiles/esp32-card/esp32-cards.js
type: module
```

If it is missing, add it manually. The path may vary depending on the HACS installation; use the URL shown in the installed HACS resource details. Do not add the same resource twice.

### Adding cards to a dashboard

1. Open the Home Assistant dashboard where you want to use the card.
2. Open the dashboard menu and select **Edit dashboard**.
3. Click **Add card**.
4. Find **ESP32 OTA Manager** or **ESP32 Device Control** in the custom cards list.
5. Select the card, optionally configure its title, and save.

If a card is not listed in the visual editor, add it using YAML mode and the examples in the [Card configuration](#card-configuration) section.

## Card configuration

Add cards to a Lovelace dashboard using YAML mode or the card configuration editor.

### OTA Manager

```yaml
type: custom:esp32-ota-card
title: ESP32 firmware updates
```

The `title` option is optional. If omitted, the card uses **“Обновление прошивки ESP32”** as its default title.

### Device Control

```yaml
type: custom:esp32-device-control-card
title: ESP32 device control
```

The cards are independent. You can add OTA Manager, Device Control, or both.

## Integration interface

### OTA update

The card calls the following service:

- **Service:** `esp32_ota.update`
- **Parameters:** `device_id`, `url`, and optional `token`

The integration converts the service call into an MQTT command for the selected device. The card does not calculate or request a firmware SHA-256 checksum.

### Device control

The card calls:

- `esp32_ota.restart` — restart the device;
- `esp32_ota.factory_reset` — reset the device to factory settings.

Both services receive the selected device identifier as `device_id`.

## Repository structure

- `esp32-cards.js` — distributable file for Home Assistant; contains both cards.
- `src/esp32-ota-card.js` — OTA card source.
- `src/esp32-device-control-card.js` — device control card source.
- `hacs.json` — HACS metadata.

When changing the source files, update the combined `esp32-cards.js` file used for installation.

## Related projects

- [ESP32 MQTT Home Assistant Integration](https://github.com/lavrenovalexsandr-cmyk/esp32-mqtt-ha-integration) — Home Assistant integration providing services and MQTT communication with devices.
- [ESP32 Platform Core](https://github.com/lavrenovalexsandr-cmyk/esp32-platform-core) — shared platform library for ESP32 firmware projects.

## Documentation language

The primary documentation is maintained in Russian in `README.md`. The English version is available in [README_EN.md](README_EN.md).
