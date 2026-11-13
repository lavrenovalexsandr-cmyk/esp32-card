# ESP32 Lovelace Cards

**A collection of custom Lovelace cards for managing ESP32 devices through Home Assistant integrations.**

Cards are independent and can be used separately or together.

## Features

### ESP32 OTA Manager

Type: custom:esp32-ota-card

- Select an ESP32 device and display its HA registry name.
- Start OTA updates from a URL; support GitHub tokens for private releases.
- Display update status and MQTT availability.

### ESP32 Device Control

Type: custom:esp32-device-control-card

- Select an ESP32 device.
- Remotely restart it.
- Run Factory Reset with double confirmation.

### Xiaomi LYWSD03MMC Sensor Manager — planned

This card will be added after the new Xiaomi integration services are agreed.

Planned features:
- select an ESP32 BLE gateway; multiple gateways are supported;
- select a discovered or saved Xiaomi LYWSD03MMC sensor belonging to that gateway;
- enter a bind-key;
- Add sensor and Remove sensor buttons.

The card calls services from [esp32-integration-xiaomi-lywsd03](https://github.com/lavrenovalexsandr-cmyk/esp32-integration-xiaomi-lywsd03). It does not construct MQTT topics or store bind-keys. Its visual style will match the existing cards.

## Requirements

Existing cards require the universal esp32_ota integration and firmware implementing its MQTT contract.

The future Xiaomi card requires the dedicated [esp32-integration-xiaomi-lywsd03](https://github.com/lavrenovalexsandr-cmyk/esp32-integration-xiaomi-lywsd03) integration and [Xiaomi firmware](https://github.com/lavrenovalexsandr-cmyk/esp32-firmware-xiaomi-lywsd03).

## Installation

### Manual installation

1. Download esp32-cards.js.
2. Copy it to <HA config>/www/esp32-cards.js.
3. Add this Lovelace resource:

    resources:
      - url: /local/esp32-cards.js
        type: module

### Installation through HACS

1. Open HACS → menu → Custom repositories.
2. Enter https://github.com/lavrenovalexsandr-cmyk/esp32-card.
3. Select Dashboard and click Add.
4. Under HACS → Dashboard, find ESP32 Lovelace Cards and install it.
5. Restart Home Assistant and hard-refresh the browser.

If the repository is already in the HACS store, do not add it again. HACS normally registers the resource automatically. If missing, check Settings → Dashboards → Resources. A typical URL is /hacsfiles/esp32-card/esp32-cards.js.

## Configuration

OTA Manager:

    type: custom:esp32-ota-card
    title: ESP32 firmware updates

Device Control:

    type: custom:esp32-device-control-card
    title: ESP32 device control

Xiaomi Sensor Manager configuration will be documented after the card and integration services are implemented.

## Integration interface

Existing cards call esp32_ota.update, esp32_ota.restart and esp32_ota.factory_reset.

The future Xiaomi card calls esp32-component-xiaomi-lywsd03.add_sensor and esp32-component-xiaomi-lywsd03.remove_sensor. Calls target the selected gateway. The bind-key is sent only during add and is not stored or displayed after submission.

## Repository structure

- esp32-cards.js — combined distributable file.
- src/ — individual card sources.
- hacs.json — HACS metadata.

When the Xiaomi card is implemented, update its source, the combined distributable file and both README versions.

## Related projects

- [Universal ESP32 integration](https://github.com/lavrenovalexsandr-cmyk/esp32-integration-core)
- [Xiaomi Home Assistant integration](https://github.com/lavrenovalexsandr-cmyk/esp32-integration-xiaomi-lywsd03)
- [Xiaomi firmware](https://github.com/lavrenovalexsandr-cmyk/esp32-firmware-xiaomi-lywsd03)
- [ESP32 Platform Core](https://github.com/lavrenovalexsandr-cmyk/esp32-platform-core)

The primary documentation is README.md in Russian. The English version is README_EN.md.
