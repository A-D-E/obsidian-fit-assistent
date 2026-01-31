import { type App, Notice, PluginSettingTab, Setting } from 'obsidian'
import type FitAssistentPlugin from './main'
import { t } from './i18n'

/**
 * Settings tab for the FitAssistent plugin.
 */
export class FitAssistentSettingTab extends PluginSettingTab {
  plugin: FitAssistentPlugin

  constructor(app: App, plugin: FitAssistentPlugin) {
    super(app, plugin)
    this.plugin = plugin
  }

  display(): void {
    const { containerEl } = this
    containerEl.empty()
    containerEl.addClass('fit-assistent-settings')

    this.renderConnectionSection(containerEl)
    this.renderSyncSection(containerEl)
    this.renderContentToggles(containerEl)
    this.renderFolderConfig(containerEl)
    this.renderDisplaySection(containerEl)
    this.renderAdvancedSection(containerEl)
  }

  private renderConnectionSection(containerEl: HTMLElement): void {
    const section = containerEl.createDiv('setting-section')
    section.createEl('h3', {
      text: t('connection.title'),
      cls: 'setting-section-title',
    })

    new Setting(section)
      .setName(t('connection.token'))
      .setDesc(t('connection.token_desc'))
      .addTextArea((text) => {
        text.inputEl.addClass('fit-assistent-token-input')
        text.inputEl.style.fontFamily = 'monospace'
        text.inputEl.style.fontSize = '11px'
        text.inputEl.rows = 3
        text
          .setPlaceholder(t('connection.token_placeholder'))
          .setValue(this.plugin.settings.connectionToken)
          .onChange(async (value) => {
            this.plugin.settings.connectionToken = value.trim()
            await this.plugin.saveSettings()
          })
      })

    // Help text
    const helpEl = section.createDiv('setting-item-description')
    helpEl.style.marginTop = '-8px'
    helpEl.style.marginBottom = '12px'
    helpEl.createEl('small', {
      text: t('connection.token_help'),
      cls: 'setting-item-description',
    })

    new Setting(section)
      .setName(t('connection.connect_disconnect'))
      .setDesc(t('connection.connect_disconnect_desc'))
      .addButton((button) =>
        button
          .setButtonText(
            this.plugin.isConnected
              ? t('connection.disconnect')
              : t('connection.connect'),
          )
          .setCta()
          .onClick(async () => {
            if (this.plugin.isConnected) {
              await this.plugin.disconnect()
              new Notice(`FitAssistent: ${t('connection.disconnected')}`)
            } else {
              const result = await this.plugin.connect()
              if (result.success) {
                new Notice(`FitAssistent: ${t('notice.connected')}`)
              } else {
                new Notice(
                  `FitAssistent: ${t('notice.error')} - ${result.error}`,
                )
              }
            }
            this.display()
          }),
      )

    if (this.plugin.isConnected) {
      const status = section.createDiv('connection-status connected')
      status.createSpan({ cls: 'status-dot connected' })
      status.createSpan({ text: ` ${t('connection.connected')}` })
    }
  }

  private renderSyncSection(containerEl: HTMLElement): void {
    const section = containerEl.createDiv('setting-section')
    section.createEl('h3', {
      text: t('sync.title'),
      cls: 'setting-section-title',
    })

    new Setting(section)
      .setName(t('sync.auto'))
      .setDesc(t('sync.auto_desc'))
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.autoSync)
          .onChange(async (value) => {
            this.plugin.settings.autoSync = value
            await this.plugin.saveSettings()
            this.plugin.setupAutoSync()
          }),
      )

    new Setting(section)
      .setName(t('sync.interval'))
      .setDesc(t('sync.interval_desc'))
      .addSlider((slider) =>
        slider
          .setLimits(5, 120, 5)
          .setValue(this.plugin.settings.syncIntervalMinutes)
          .setDynamicTooltip()
          .onChange(async (value) => {
            this.plugin.settings.syncIntervalMinutes = value
            await this.plugin.saveSettings()
            this.plugin.setupAutoSync()
          }),
      )

    new Setting(section)
      .setName(t('sync.realtime'))
      .setDesc(t('sync.realtime_desc'))
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.realtimeEnabled)
          .onChange(async (value) => {
            this.plugin.settings.realtimeEnabled = value
            await this.plugin.saveSettings()
            if (value) {
              this.plugin.startRealtime()
            } else {
              this.plugin.stopRealtime()
            }
          }),
      )

    new Setting(section)
      .setName(t('sync.now'))
      .setDesc(t('sync.now_desc'))
      .addButton((button) =>
        button
          .setButtonText(t('sync.full'))
          .setCta()
          .onClick(async () => {
            if (!this.plugin.isConnected) {
              new Notice(`FitAssistent: ${t('notice.please_sign_in')}`)
              return
            }
            new Notice(`FitAssistent: ${t('sync.started')}`)
            const result = await this.plugin.runFullSync()
            if (result.success) {
              new Notice(
                `FitAssistent: ${t('notice.sync_done', { created: result.filesCreated, updated: result.filesUpdated })}`,
              )
            } else {
              new Notice(
                `FitAssistent: ${t('notice.sync_errors', { count: result.errors.length })}`,
              )
            }
          }),
      )
  }

  private renderContentToggles(containerEl: HTMLElement): void {
    const section = containerEl.createDiv('setting-section')
    section.createEl('h3', {
      text: t('content.title'),
      cls: 'setting-section-title',
    })

    const toggles: [keyof typeof this.plugin.settings, string, string][] = [
      ['syncRecipes', t('content.recipes'), t('content.recipes_desc')],
      ['syncMeals', t('content.meals'), t('content.meals_desc')],
      ['syncWater', t('content.water'), t('content.water_desc')],
      ['syncWeight', t('content.weight'), t('content.weight_desc')],
      ['syncMealprep', t('content.mealprep'), t('content.mealprep_desc')],
      ['syncProfile', t('content.profile'), t('content.profile_desc')],
      ['syncInventory', t('content.inventory'), t('content.inventory_desc')],
      [
        'syncMedications',
        t('content.medications'),
        t('content.medications_desc'),
      ],
      [
        'syncMedicationLogs',
        t('content.medication_logs'),
        t('content.medication_logs_desc'),
      ],
      [
        'syncBloodPressure',
        t('content.blood_pressure'),
        t('content.blood_pressure_desc'),
      ],
      [
        'syncShoppingList',
        t('content.shopping_list'),
        t('content.shopping_list_desc'),
      ],
    ]

    for (const [key, name, desc] of toggles) {
      new Setting(section)
        .setName(name)
        .setDesc(desc)
        .addToggle((toggle) =>
          toggle
            .setValue(this.plugin.settings[key] as boolean)
            .onChange(async (value) => {
              ;(this.plugin.settings[key] as boolean) = value
              await this.plugin.saveSettings()
            }),
        )
    }
  }

  private renderFolderConfig(containerEl: HTMLElement): void {
    const section = containerEl.createDiv('setting-section')
    section.createEl('h3', {
      text: t('folders.title'),
      cls: 'setting-section-title',
    })

    const folders: [keyof typeof this.plugin.settings, string, string][] = [
      ['basePath', t('folders.base'), t('folders.base_desc')],
      ['recipesFolder', t('folders.recipes'), t('folders.recipes_desc')],
      ['trackerFolder', t('folders.tracker'), t('folders.tracker_desc')],
      ['mealprepFolder', t('folders.mealprep'), t('folders.mealprep_desc')],
      ['healthFolder', t('folders.health'), t('folders.health_desc')],
      ['listsFolder', t('folders.lists'), t('folders.lists_desc')],
    ]

    for (const [key, name, desc] of folders) {
      new Setting(section)
        .setName(name)
        .setDesc(desc)
        .addText((text) =>
          text
            .setValue(this.plugin.settings[key] as string)
            .onChange(async (value) => {
              ;(this.plugin.settings[key] as string) = value
              await this.plugin.saveSettings()
            }),
        )
    }
  }

  private renderDisplaySection(containerEl: HTMLElement): void {
    const section = containerEl.createDiv('setting-section')
    section.createEl('h3', {
      text: t('display.title'),
      cls: 'setting-section-title',
    })

    new Setting(section)
      .setName(t('display.status_bar'))
      .setDesc(t('display.status_bar_desc'))
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.showStatusBar)
          .onChange(async (value) => {
            this.plugin.settings.showStatusBar = value
            await this.plugin.saveSettings()
          }),
      )

    new Setting(section)
      .setName(t('display.nutrition_goals'))
      .setDesc(t('display.nutrition_goals_desc'))
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.showNutritionGoals)
          .onChange(async (value) => {
            this.plugin.settings.showNutritionGoals = value
            await this.plugin.saveSettings()
          }),
      )
  }

  private renderAdvancedSection(containerEl: HTMLElement): void {
    const section = containerEl.createDiv('setting-section')
    section.createEl('h3', {
      text: t('advanced.title'),
      cls: 'setting-section-title',
    })

    new Setting(section)
      .setName(t('advanced.reset'))
      .setDesc(t('advanced.reset_desc'))
      .addButton((button) =>
        button
          .setButtonText(t('advanced.reset_button'))
          .setWarning()
          .onClick(async () => {
            await this.plugin.resetSyncState()
            new Notice(`FitAssistent: ${t('advanced.reset_done')}`)
          }),
      )

    const state = this.plugin.getSyncState()
    if (state.lastFullSync) {
      const infoEl = section.createDiv('sync-info')
      const lastSync = new Date(state.lastFullSync)
      infoEl.setText(
        `${t('advanced.last_sync')}: ${lastSync.toLocaleDateString()} ${lastSync.toLocaleTimeString()}`,
      )
    }

    if (state.syncErrors.length > 0) {
      const errEl = section.createDiv('sync-info')
      errEl.setText(`${t('advanced.last_errors')}: ${state.syncErrors.length}`)
    }
  }
}
