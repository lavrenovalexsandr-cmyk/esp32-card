# ESP32 Lovelace Cards

**Набор пользовательских Lovelace-карточек для управления ESP32-устройствами через интеграции Home Assistant.**

Карточки независимы и могут использоваться отдельно или вместе.

## Возможности

### ESP32 OTA Manager

Тип: custom:esp32-ota-card

- Выбор ESP32-устройства и отображение его имени из реестра HA.
- Запуск OTA-обновления по URL; поддержка GitHub token для закрытых релизов.
- Отображение статуса обновления и MQTT-доступности.

### ESP32 Device Control

Тип: custom:esp32-device-control-card

- Выбор ESP32-устройства.
- Удалённый перезапуск.
- Factory Reset с двойным подтверждением.

### Xiaomi LYWSD03MMC Sensor Manager — планируется

Карточка будет добавлена после согласования сервисов новой Xiaomi-интеграции.

Планируемые возможности:
- выбор ESP32 BLE-шлюза; поддерживается несколько шлюзов;
- выбор найденного или сохранённого Xiaomi LYWSD03MMC выбранного шлюза;
- поле ввода bind-key;
- кнопки «Добавить датчик» и «Удалить датчик».

Карточка вызывает сервисы [esp32-integration-xiaomi-lywsd03](https://github.com/lavrenovalexsandr-cmyk/esp32-integration-xiaomi-lywsd03), не формирует MQTT-топики самостоятельно и не хранит bind-key. Визуальный стиль соответствует существующим карточкам.

## Требования

Для существующих карточек требуется универсальная интеграция esp32_ota и поддержка соответствующего MQTT-контракта прошивкой.

Для будущей Xiaomi-карточки потребуются специализированная интеграция [esp32-integration-xiaomi-lywsd03](https://github.com/lavrenovalexsandr-cmyk/esp32-integration-xiaomi-lywsd03) и [Xiaomi firmware](https://github.com/lavrenovalexsandr-cmyk/esp32-firmware-xiaomi-lywsd03).

## Установка

### Ручная установка

1. Скачайте esp32-cards.js.
2. Скопируйте в <HA config>/www/esp32-cards.js.
3. Добавьте ресурс Lovelace:

    resources:
      - url: /local/esp32-cards.js
        type: module

### Установка через HACS

1. Откройте HACS → меню → Пользовательские репозитории.
2. Укажите https://github.com/lavrenovalexsandr-cmyk/esp32-card.
3. Выберите категорию Dashboard и нажмите «Добавить».
4. В HACS → Панели найдите ESP32 Lovelace Cards и установите.
5. Перезагрузите Home Assistant и обновите страницу браузера с очисткой кеша.

Если репозиторий уже есть в магазине HACS, повторно добавлять его не нужно. HACS обычно регистрирует ресурс автоматически. Если ресурс отсутствует, проверьте Настройки → Панели управления → Ресурсы. Типичный URL: /hacsfiles/esp32-card/esp32-cards.js.

## Настройка

OTA Manager:

    type: custom:esp32-ota-card
    title: Обновление прошивки ESP32

Device Control:

    type: custom:esp32-device-control-card
    title: Управление ESP32

Конфигурация Xiaomi Sensor Manager будет описана после реализации карточки и сервисов интеграции.

## Взаимодействие с интеграциями

Существующие карточки вызывают esp32_ota.update, esp32_ota.restart и esp32_ota.factory_reset.

Будущая Xiaomi-карточка вызывает esp32_xiaomi_lywsd03.add_sensor и esp32_xiaomi_lywsd03.remove_sensor. Вызовы адресуются выбранному шлюзу. Bind-key передаётся только при добавлении и не сохраняется/не отображается после отправки.

## Структура репозитория

- esp32-cards.js — общий файл для установки.
- src/ — исходники отдельных карточек.
- hacs.json — метаданные HACS.

При добавлении Xiaomi-карточки обновляются исходник, общий distributable-файл и обе версии README.

## Связанные проекты

- [Универсальная ESP32 интеграция](https://github.com/lavrenovalexsandr-cmyk/esp32-integration-core)
- [Xiaomi Home Assistant Integration](https://github.com/lavrenovalexsandr-cmyk/esp32-integration-xiaomi-lywsd03)
- [Xiaomi Firmware](https://github.com/lavrenovalexsandr-cmyk/esp32-firmware-xiaomi-lywsd03)
- [ESP32 Platform Core](https://github.com/lavrenovalexsandr-cmyk/esp32-platform-core)

Основная документация — README.md на русском языке; английская версия — README_EN.md.
