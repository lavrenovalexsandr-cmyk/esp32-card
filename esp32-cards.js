class Esp32OtaCard extends HTMLElement {
  setConfig(config) {
    this.config = { title: "Обновление прошивки ESP32", ...config };
    this.render();
  }

  set hass(hass) {
    this._hass = hass;
    this.render();
  }

  getDevices() {
    if (!this._hass) return [];
    return Object.values(this._hass.states)
      .filter(state => state.entity_id.startsWith("sensor.") &&
        state.attributes && state.attributes.device_id)
      .map(state => ({
        id: String(state.attributes.device_id),
        name: state.attributes.device_name ||
          state.attributes.friendly_name || state.attributes.device_id,
        status: String(state.state || "unknown"),
        available: state.attributes.device_available === true,
        progress: state.attributes.progress,
        message: state.attributes.message || ""
      }));
  }

  getStatus(status) {
    const states = {
      online: {label: "На связи", icon: "mdi:check-circle", color: "success", detail: "Устройство подключено к MQTT."},
      offline: {label: "Не в сети", icon: "mdi:lan-disconnect", color: "error", detail: "Нет MQTT-соединения с устройством."},
      downloading: {label: "Загрузка прошивки", icon: "mdi:download", color: "active", detail: "Получение файла прошивки по HTTPS."},
      verifying: {label: "Подготовка образа", icon: "mdi:package-check", color: "active", detail: "Подготовка образа прошивки к установке."},
      installing: {label: "Проверка образа", icon: "mdi:package-check", color: "active", detail: "Проверка совместимости образа ESP-IDF."},
      rebooting: {label: "Перезагрузка", icon: "mdi:restart", color: "active", detail: "Прошивка записана. Устройство перезагружается."},
      success: {label: "Обновление успешно", icon: "mdi:check-decagram", color: "success", detail: "Новая прошивка успешно запущена и проверена."},
      error: {label: "Ошибка обновления", icon: "mdi:alert-circle", color: "error", detail: "Устройство сообщило об ошибке OTA."}
    };
    return states[status] || {
      label: status === "Ожидание" ? "Ожидание команды" : status,
      icon: "mdi:information-outline",
      color: "neutral",
      detail: "Ожидание сообщения от устройства."
    };
  }

  render() {
    if (!this._hass || !this.config) return;

    const devices = this.getDevices();
    const selected = this._selected || (devices[0] && devices[0].id) || "";
    const device = devices.find(item => item.id === selected) || devices[0];
    if (device) this._selected = device.id;

    const previous = {};
    for (const id of ["url", "token"]) {
      const input = this.querySelector("#" + id);
      if (input) previous[id] = input.value;
    }

    const status = device ? this.getStatus(device.available ? device.status : "offline") : {
      label: "Устройство не обнаружено",
      icon: "mdi:lan-disconnect",
      color: "neutral",
      detail: "Ожидание MQTT-сообщения от ESP32."
    };
    const progress = device && Number.isFinite(Number(device.progress))
      ? Math.max(0, Math.min(100, Number(device.progress))) : null;
    const showProgress = device &&
      ["downloading", "verifying", "installing", "rebooting"].includes(device.status);

    this.innerHTML = `
      <ha-card header="${this.escape(this.config.title)}">
        <style>
          .ota-content { padding: 16px; }
          .ota-label { display:block; font-size:13px; color:var(--secondary-text-color); margin:12px 0 5px; }
          .ota-input { box-sizing:border-box; width:100%; padding:11px; border:1px solid var(--divider-color); border-radius:8px; background:var(--card-background-color); color:var(--primary-text-color); font:inherit; }
          .ota-status { display:flex; align-items:center; gap:12px; padding:14px; border-radius:10px; background:var(--secondary-background-color); margin:12px 0; }
          .ota-status ha-icon { --mdc-icon-size:28px; color:var(--secondary-text-color); }
          .ota-status.success ha-icon { color:var(--success-color, #2e7d32); }
          .ota-status.error ha-icon { color:var(--error-color, #c62828); }
          .ota-status.active ha-icon { color:var(--info-color, #1976d2); }
          .ota-status-title { font-weight:600; }
          .ota-detail { color:var(--secondary-text-color); font-size:13px; margin-top:3px; }
          .ota-progress { height:8px; background:var(--divider-color); border-radius:8px; overflow:hidden; margin-top:10px; }
          .ota-progress > div { height:100%; background:var(--primary-color); transition:width .25s ease; }
          .ota-actions { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:18px; }
          .ota-actions button { min-height:48px; border:0; border-radius:9px; padding:10px; font:inherit; font-weight:600; cursor:pointer; }
          .ota-actions .ota-update { background:var(--error-color); color:white; }
          .ota-actions .ota-save { background:var(--primary-color); color:var(--text-primary-color, white); }
          .ota-actions button:disabled { opacity:.45; cursor:not-allowed; }
          @media(max-width:380px) { .ota-actions { grid-template-columns:1fr; } }
          .ota-message { font-size:13px; overflow-wrap:anywhere; color:var(--secondary-text-color); margin-top:9px; }
          .ota-device-id { font-size:12px; color:var(--secondary-text-color); }
        </style>
        <div class="ota-content">
          <label class="ota-label" for="device">Устройство</label>
          <select id="device" class="ota-input">
            ${devices.map(item => `<option value="${this.escape(item.id)}" ${device && item.id === device.id ? "selected" : ""}>${this.escape(item.name)} · ${this.escape(item.id)}</option>`).join("")}
          </select>

          <div class="ota-status ${status.color}">
            <ha-icon icon="${status.icon}"></ha-icon>
            <div>
              <div class="ota-status-title">${this.escape(status.label)}</div>
              <div class="ota-detail">${this.escape(status.detail)}</div>
              ${showProgress && progress !== null ? `
                <div class="ota-progress"><div style="width:${progress}%"></div></div>
                <div class="ota-detail">${progress}%</div>
              ` : ""}
            </div>
          </div>
          ${device && device.message ? `<div class="ota-message">${this.escape(device.message)}</div>` : ""}
          ${device ? `<div class="ota-device-id">ID: ${this.escape(device.id)}</div>` : ""}

          <label class="ota-label" for="url">URL файла прошивки (.bin)</label>
          <input id="url" class="ota-input" type="url" placeholder="https://github.com/.../firmware.bin">
          <label class="ota-label" for="token">GitHub token (необязательно)</label>
          <input id="token" class="ota-input" type="password" autocomplete="new-password" placeholder="Пустое поле — использовать сохранённый токен">
          <div class="ota-actions">
            <button type="button" class="ota-update" id="update" ${devices.length ? "" : "disabled"}>Начать обновление</button>
            <button type="button" class="ota-save" id="save">Сохранить токен</button>
          </div>
          <div id="action-status" class="ota-message">${devices.length ? "Готово к отправке OTA-команды." : "Ожидание обнаружения ESP32 по MQTT…"}</div>
        </div>
      </ha-card>`;

    for (const id of ["url", "token"]) {
      const input = this.querySelector("#" + id);
      if (input && previous[id] !== undefined) input.value = previous[id];
    }

    this.querySelector("#device").addEventListener("change", event => {
      this._selected = event.target.value;
      this.render();
    });

    this.querySelector("#save").addEventListener("click", async () => {
      const token = this.querySelector("#token").value;
      if (!token) return this.message("Введите GitHub token для сохранения.");
      try {
        await this._hass.callService("esp32_ota", "save_token", {token});
        this.querySelector("#token").value = "";
        this.message("GitHub token сохранён в secrets.yaml.");
      } catch (error) {
        this.message("Не удалось сохранить токен: " + error);
      }
    });

    this.querySelector("#update").addEventListener("click", async () => {
      const device_id = this.querySelector("#device").value;
      const url = this.querySelector("#url").value.trim();
      const token = this.querySelector("#token").value;
      if (!device_id || !url) {
        return this.message("Выберите устройство и заполните URL файла прошивки.");
      }
      try {
        await this._hass.callService("esp32_ota", "update", {device_id, url, token});
        this.querySelector("#token").value = "";
        this.message("Команда отправлена. Ожидаем статус от ESP32…");
      } catch (error) {
        this.message("Ошибка запуска OTA: " + error);
      }
    });
  }

  message(text) {
    const element = this.querySelector("#action-status");
    if (element) element.textContent = text;
  }

  escape(value) {
    return String(value).replace(/[&<>"']/g, char => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[char]));
  }

  getCardSize() { return 7; }
}

customElements.define("esp32-ota-card", Esp32OtaCard);
window.customCards = window.customCards || [];
window.customCards.push({
  type: "esp32-ota-card",
  name: "ESP32 OTA Manager",
  description: "OTA updates and live status for ESP32 devices over MQTT"
});


class Esp32DeviceControlCard extends HTMLElement {
  setConfig(config) {
    this.config = { title: "Управление ESP32", ...config };
    this.render();
  }

  set hass(hass) {
    this._hass = hass;
    this.render();
  }

  getDevices() {
    if (!this._hass) return [];
    const found = new Map();
    Object.values(this._hass.states).forEach(state => {
      const id = state.attributes && state.attributes.device_id;
      if (state.entity_id.startsWith("sensor.") && id) {
        found.set(String(id).toUpperCase(), {
          id: String(id).toUpperCase(),
          name: state.attributes.device_name || state.attributes.friendly_name || "ESP32"
        });
      }
    });
    return [...found.values()].sort((a, b) => a.name.localeCompare(b.name, "ru"));
  }

  render() {
    if (!this._hass || !this.config) return;
    const devices = this.getDevices();
    const selected = this._selected || (devices[0] && devices[0].id) || "";
    this._selected = selected;
    this.innerHTML = `
      <ha-card header="${this.escape(this.config.title)}">
        <style>
          .control-content { padding: 16px; }
          .control-label { display:block; color:var(--secondary-text-color); font-size:13px; margin:0 0 7px; }
          .control-select { box-sizing:border-box; width:100%; padding:12px; border:1px solid var(--divider-color); border-radius:8px; background:var(--card-background-color); color:var(--primary-text-color); font:inherit; }
          .control-actions { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:18px; }
          .control-actions button { min-height:48px; border:0; border-radius:9px; padding:10px; font:inherit; font-weight:600; cursor:pointer; }
          .reset { background:var(--error-color); color:white; }
          .restart { background:var(--primary-color); color:var(--text-primary-color, white); }
          button:disabled, select:disabled { opacity:.45; cursor:not-allowed; }
          .control-hint { margin-top:12px; color:var(--secondary-text-color); font-size:12px; line-height:1.45; }
          @media(max-width:380px) { .control-actions { grid-template-columns:1fr; } }
        </style>
        <div class="control-content">
          <label class="control-label" for="esp-device">Устройство</label>
          <select id="esp-device" class="control-select" ${devices.length ? "" : "disabled"}>
            ${devices.map(d => `<option value="${this.escape(d.id)}" ${d.id === selected ? "selected" : ""}>${this.escape(d.name)} · ${this.escape(d.id)}</option>`).join("")}
          </select>
          <div class="control-actions">
            <button class="reset" id="factory-reset" ${devices.length ? "" : "disabled"}>Полный сброс</button>
            <button class="restart" id="restart" ${devices.length ? "" : "disabled"}>Перезагрузка</button>
          </div>
          <div class="control-hint" id="control-status">${devices.length ? "Выберите ESP32 и действие." : "Устройства пока не обнаружены. Проверьте MQTT-подключение."}</div>
        </div>
      </ha-card>`;

    this.querySelector("#esp-device").addEventListener("change", e => {
      this._selected = e.target.value;
    });
    this.querySelector("#restart").addEventListener("click", async () => {
      const device = devices.find(d => d.id === this.querySelector("#esp-device").value);
      if (!device || !window.confirm(`Перезагрузить устройство «${device.name}»?`)) return;
      await this.sendCommand("restart", device);
    });
    this.querySelector("#factory-reset").addEventListener("click", async () => {
      const device = devices.find(d => d.id === this.querySelector("#esp-device").value);
      if (!device || !window.confirm(`ВНИМАНИЕ! Полностью сбросить настройки «${device.name}»? Wi-Fi и привязки BLE будут удалены. Отменить это действие нельзя.`)) return;
      if (!window.confirm("Подтвердите полный сброс ещё раз.")) return;
      await this.sendCommand("factory_reset", device);
    });
  }

  async sendCommand(service, device) {
    const status = this.querySelector("#control-status");
    status.textContent = "Отправка команды…";
    try {
      await this._hass.callService("esp32_ota", service, { device_id: device.id });
      status.textContent = service === "restart"
        ? "Команда перезагрузки отправлена."
        : "Команда полного сброса отправлена.";
    } catch (error) {
      status.textContent = "Не удалось отправить команду: " + error;
    }
  }

  escape(value) {
    return String(value).replace(/[&<>"']/g, ch => ({
      "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
    }[ch]));
  }

  getCardSize() { return 3; }
}

customElements.define("esp32-device-control-card", Esp32DeviceControlCard);
window.customCards = window.customCards || [];
window.customCards.push({
  type: "esp32-device-control-card",
  name: "ESP32 Device Control",
  description: "Отдельная карточка для перезагрузки и полного сброса ESP32"
});
