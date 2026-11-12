# ESP32 Lovelace Cards

Two independent Lovelace cards for controlling ESP32 devices through the `esp32_ota` Home Assistant integration.

## Included cards

- **ESP32 OTA Manager** (`esp32-ota-card`) — select an ESP32, start firmware OTA from a URL, optionally provide a GitHub token, and monitor update status.
- **ESP32 Device Control** (`esp32-device-control-card`) — send restart and factory-reset commands to a selected ESP32. Factory reset requires two confirmations.

## Requirements

- Home Assistant with the `esp32_ota` integration installed and configured.
- ESP32 firmware publishing device information and OTA status over the MQTT protocol expected by the integration.
- The integration must expose the `esp32_ota.update`, `esp32_ota.restart`, and `esp32_ota.factory_reset` services as applicable.

Integration repository: https://github.com/lavrenovalexsandr-cmyk/esp32-mqtt-ha-integration

## Installation

### Manual

1. Download `esp32-cards.js` from this repository.
2. Copy it to `<HA config>/www/esp32-cards.js`.
3. Add this Lovelace resource (Settings → Dashboards → Resources):

```yaml
resources:
  - url: /local/esp32-cards.js
    type: module
```

Both custom card types are registered by this one JavaScript resource.

### Card configuration

OTA card:

```yaml
type: custom:esp32-ota-card
title: ESP32 firmware updates
```

Device control card:

```yaml
type: custom:esp32-device-control-card
title: Управление ESP32
```

The cards are independent. Add either or both to any Lovelace dashboard.

## OTA service contract

The OTA card calls:

- Service: `esp32_ota.update`
- Data: `device_id`, `url`, and optional `token`

The integration converts this into the MQTT OTA command. The card does not calculate or request a firmware SHA-256 checksum.

The device control card calls `esp32_ota.restart` and `esp32_ota.factory_reset`, passing the selected `device_id`.

## Development

The distributable `esp32-cards.js` contains both custom elements. The original card sources are kept separately in `src/`:

- `src/esp32-ota-card.js`
- `src/esp32-device-control-card.js`
