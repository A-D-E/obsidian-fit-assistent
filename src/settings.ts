import { type App, Notice, PluginSettingTab, Setting } from 'obsidian'
import type FitAssistentPlugin from './main'
import { signIn, signOut, getCurrentUserId } from './api/supabase-client'

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

    // ---- Connection Section ----
    this.renderConnectionSection(containerEl)

    // ---- Sync Config ----
    this.renderSyncSection(containerEl)

    // ---- Content Toggles ----
    this.renderContentToggles(containerEl)

    // ---- Folder Config ----
    this.renderFolderConfig(containerEl)

    // ---- Display ----
    this.renderDisplaySection(containerEl)

    // ---- Advanced ----
    this.renderAdvancedSection(containerEl)
  }

  private renderConnectionSection(containerEl: HTMLElement): void {
    const section = containerEl.createDiv('setting-section')
    section.createEl('h3', {
      text: 'Verbindung',
      cls: 'setting-section-title',
    })

    new Setting(section)
      .setName('Supabase URL')
      .setDesc('Die URL deiner Self-Hosted Supabase-Instanz')
      .addText((text) =>
        text
          .setPlaceholder('https://supabase.example.com')
          .setValue(this.plugin.settings.supabaseUrl)
          .onChange(async (value) => {
            this.plugin.settings.supabaseUrl = value
            await this.plugin.saveSettings()
          }),
      )

    new Setting(section)
      .setName('Supabase Anon Key')
      .setDesc('Der öffentliche Anon-Key deiner Supabase-Instanz')
      .addText((text) =>
        text
          .setPlaceholder('eyJ...')
          .setValue(this.plugin.settings.supabaseAnonKey)
          .onChange(async (value) => {
            this.plugin.settings.supabaseAnonKey = value
            await this.plugin.saveSettings()
          }),
      )

    new Setting(section)
      .setName('E-Mail')
      .setDesc('Deine FitAssistent Login-E-Mail')
      .addText((text) =>
        text
          .setPlaceholder('user@example.com')
          .setValue(this.plugin.settings.email)
          .onChange(async (value) => {
            this.plugin.settings.email = value
            await this.plugin.saveSettings()
          }),
      )

    new Setting(section)
      .setName('Passwort')
      .setDesc('Dein FitAssistent-Passwort')
      .addText((text) => {
        text.inputEl.type = 'password'
        text
          .setPlaceholder('••••••••')
          .setValue(this.plugin.settings.password)
          .onChange(async (value) => {
            this.plugin.settings.password = value
            await this.plugin.saveSettings()
          })
      })

    new Setting(section)
      .setName('Anmelden / Abmelden')
      .setDesc('Verbindung zur FitAssistent-App herstellen')
      .addButton((button) =>
        button
          .setButtonText(this.plugin.isConnected ? 'Abmelden' : 'Anmelden')
          .setCta()
          .onClick(async () => {
            if (this.plugin.isConnected) {
              await this.plugin.disconnect()
              new Notice('FitAssistent: Abgemeldet')
            } else {
              const result = await this.plugin.connect()
              if (result.success) {
                new Notice('FitAssistent: Verbunden!')
              } else {
                new Notice(`FitAssistent: Fehler - ${result.error}`)
              }
            }
            this.display()
          }),
      )

    // Connection status indicator
    if (this.plugin.isConnected) {
      const status = section.createDiv('connection-status connected')
      status.createSpan({ cls: 'status-dot connected' })
      status.createSpan({ text: ' Verbunden' })
    }
  }

  private renderSyncSection(containerEl: HTMLElement): void {
    const section = containerEl.createDiv('setting-section')
    section.createEl('h3', {
      text: 'Synchronisation',
      cls: 'setting-section-title',
    })

    new Setting(section)
      .setName('Auto-Sync')
      .setDesc('Automatisch synchronisieren nach Zeitintervall')
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
      .setName('Sync-Intervall')
      .setDesc('Intervall für automatische Synchronisation (Minuten)')
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
      .setName('Realtime Updates')
      .setDesc(
        'Echtzeit-Updates über Supabase Realtime (sofortige Synchronisation bei Änderungen)',
      )
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
      .setName('Jetzt synchronisieren')
      .setDesc('Vollständige Synchronisation aller Daten starten')
      .addButton((button) =>
        button
          .setButtonText('Full Sync')
          .setCta()
          .onClick(async () => {
            if (!this.plugin.isConnected) {
              new Notice('FitAssistent: Bitte zuerst anmelden')
              return
            }
            new Notice('FitAssistent: Sync gestartet...')
            const result = await this.plugin.runFullSync()
            if (result.success) {
              new Notice(
                `FitAssistent: Sync abgeschlossen (${result.filesCreated} erstellt, ${result.filesUpdated} aktualisiert)`,
              )
            } else {
              new Notice(
                `FitAssistent: Sync mit ${result.errors.length} Fehlern abgeschlossen`,
              )
            }
          }),
      )
  }

  private renderContentToggles(containerEl: HTMLElement): void {
    const section = containerEl.createDiv('setting-section')
    section.createEl('h3', {
      text: 'Inhalte',
      cls: 'setting-section-title',
    })

    const toggles: [keyof typeof this.plugin.settings, string, string][] = [
      ['syncRecipes', 'Rezepte', 'Individuelle Rezept-Dateien synchronisieren'],
      ['syncMeals', 'Mahlzeiten', 'Mahlzeiten in Tagesnotizen'],
      ['syncWater', 'Wasser', 'Wasser-Einträge in Tagesnotizen'],
      ['syncWeight', 'Gewicht', 'Gewichts-Einträge in Tagesnotizen'],
      ['syncMealprep', 'Mealprep', 'Mealprep-Pläne synchronisieren'],
      ['syncProfile', 'Profil', 'Profildaten synchronisieren'],
      ['syncInventory', 'Inventar', 'Kücheninventar synchronisieren'],
      [
        'syncMedications',
        'Medikamente',
        'Medikamentenliste synchronisieren',
      ],
      [
        'syncMedicationLogs',
        'Medikamenten-Logs',
        'Medikamenten-Einnahmen in Tagesnotizen',
      ],
      [
        'syncBloodPressure',
        'Blutdruck',
        'Blutdruck-Messungen in Tagesnotizen',
      ],
      [
        'syncShoppingList',
        'Einkaufsliste',
        'Einkaufsliste synchronisieren',
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
      text: 'Ordner',
      cls: 'setting-section-title',
    })

    const folders: [keyof typeof this.plugin.settings, string, string][] = [
      ['basePath', 'Basis-Ordner', 'Hauptordner für alle FitAssistent-Daten'],
      ['recipesFolder', 'Rezepte', 'Unterordner für Rezepte'],
      ['trackerFolder', 'Tracker', 'Unterordner für Tagesnotizen'],
      ['mealprepFolder', 'Mealprep', 'Unterordner für Mealprep-Pläne'],
      ['healthFolder', 'Gesundheit', 'Unterordner für Medikamente'],
      ['listsFolder', 'Listen', 'Unterordner für Inventar & Einkaufsliste'],
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
      text: 'Anzeige',
      cls: 'setting-section-title',
    })

    new Setting(section)
      .setName('Status Bar')
      .setDesc('Sync-Status in der Statusleiste anzeigen')
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.showStatusBar)
          .onChange(async (value) => {
            this.plugin.settings.showStatusBar = value
            await this.plugin.saveSettings()
          }),
      )

    new Setting(section)
      .setName('Nährwert-Ziele')
      .setDesc('Ziel-Vergleich in Tagesnotizen anzeigen')
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
      text: 'Erweitert',
      cls: 'setting-section-title',
    })

    new Setting(section)
      .setName('Sync-State zurücksetzen')
      .setDesc(
        'Setzt den Sync-State zurück. Der nächste Sync wird alle Daten neu laden.',
      )
      .addButton((button) =>
        button
          .setButtonText('Zurücksetzen')
          .setWarning()
          .onClick(async () => {
            await this.plugin.resetSyncState()
            new Notice('FitAssistent: Sync-State zurückgesetzt')
          }),
      )

    // Sync info
    const state = this.plugin.getSyncState()
    if (state.lastFullSync) {
      const infoEl = section.createDiv('sync-info')
      const lastSync = new Date(state.lastFullSync)
      infoEl.setText(
        `Letzter Full Sync: ${lastSync.toLocaleDateString('de')} ${lastSync.toLocaleTimeString('de')}`,
      )
    }

    if (state.syncErrors.length > 0) {
      const errEl = section.createDiv('sync-info')
      errEl.setText(`Letzte Fehler: ${state.syncErrors.length}`)
    }
  }
}
