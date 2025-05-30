import { SkinInstallStatus, SkinConfiguration } from "@/types/rainmeter";

const STORAGE_KEYS = {
  INSTALLED_SKINS: "rainmeter_installed_skins",
  SKIN_CONFIGS: "rainmeter_skin_configs",
  SKIN_STATES: "rainmeter_skin_states",
} as const;

interface SkinState {
  skinId: string;
  isEnabled: boolean;
  lastEnabled?: string;
  enableCount: number;
}

class RainmeterStorage {
  /**
   * Get all installed skins from localStorage
   */
  getInstalledSkins(): SkinInstallStatus[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.INSTALLED_SKINS);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Failed to load installed skins:", error);
      return [];
    }
  }

  /**
   * Get specific skin installation status
   */
  getSkinStatus(skinId: string): SkinInstallStatus | null {
    const installedSkins = this.getInstalledSkins();
    return installedSkins.find((skin) => skin.skinId === skinId) || null;
  }

  /**
   * Check if a skin is installed
   */
  isSkinInstalled(skinId: string): boolean {
    return this.getSkinStatus(skinId) !== null;
  }

  /**
   * Add a skin to installed list
   */
  addInstalledSkin(skinStatus: SkinInstallStatus): void {
    try {
      const installedSkins = this.getInstalledSkins();
      const existingIndex = installedSkins.findIndex(
        (skin) => skin.skinId === skinStatus.skinId
      );

      if (existingIndex >= 0) {
        // Update existing skin
        installedSkins[existingIndex] = {
          ...installedSkins[existingIndex],
          ...skinStatus,
          installedAt: installedSkins[existingIndex].installedAt,
        };
      } else {
        // Add new skin
        installedSkins.push({
          ...skinStatus,
          installedAt: new Date().toISOString(),
        });
      }

      localStorage.setItem(
        STORAGE_KEYS.INSTALLED_SKINS,
        JSON.stringify(installedSkins)
      );

      // Initialize skin state
      this.updateSkinState(skinStatus.skinId, {
        isEnabled: skinStatus.isEnabled || false,
        enableCount: 0,
      });
    } catch (error) {
      console.error("Failed to add installed skin:", error);
      throw new Error("Failed to save skin installation status");
    }
  }

  /**
   * Remove a skin from installed list
   */
  removeInstalledSkin(skinId: string): void {
    try {
      const installedSkins = this.getInstalledSkins();
      const filteredSkins = installedSkins.filter(
        (skin) => skin.skinId !== skinId
      );

      localStorage.setItem(
        STORAGE_KEYS.INSTALLED_SKINS,
        JSON.stringify(filteredSkins)
      );

      // Remove configuration and state
      this.removeSkinConfiguration(skinId);
      this.removeSkinState(skinId);
    } catch (error) {
      console.error("Failed to remove installed skin:", error);
      throw new Error("Failed to remove skin installation status");
    }
  }

  /**
   * Update skin enabled/disabled status
   */
  updateSkinEnabledStatus(skinId: string, isEnabled: boolean): void {
    try {
      const installedSkins = this.getInstalledSkins();
      const skinIndex = installedSkins.findIndex(
        (skin) => skin.skinId === skinId
      );

      if (skinIndex >= 0) {
        installedSkins[skinIndex].isEnabled = isEnabled;
        localStorage.setItem(
          STORAGE_KEYS.INSTALLED_SKINS,
          JSON.stringify(installedSkins)
        );

        // Update state
        this.updateSkinState(skinId, {
          isEnabled,
          lastEnabled: isEnabled ? new Date().toISOString() : undefined,
          enableCount: isEnabled
            ? (this.getSkinState(skinId)?.enableCount || 0) + 1
            : this.getSkinState(skinId)?.enableCount || 0,
        });
      }
    } catch (error) {
      console.error("Failed to update skin enabled status:", error);
      throw new Error("Failed to update skin status");
    }
  }

  /**
   * Get skin configurations
   */
  getSkinConfigurations(): SkinConfiguration[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SKIN_CONFIGS);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Failed to load skin configurations:", error);
      return [];
    }
  }

  /**
   * Get specific skin configuration
   */
  getSkinConfiguration(skinId: string): SkinConfiguration | null {
    const configurations = this.getSkinConfigurations();
    return configurations.find((config) => config.skinId === skinId) || null;
  }

  /**
   * Save skin configuration
   */
  saveSkinConfiguration(configuration: SkinConfiguration): void {
    try {
      const configurations = this.getSkinConfigurations();
      const existingIndex = configurations.findIndex(
        (config) => config.skinId === configuration.skinId
      );

      if (existingIndex >= 0) {
        configurations[existingIndex] = configuration;
      } else {
        configurations.push(configuration);
      }

      localStorage.setItem(
        STORAGE_KEYS.SKIN_CONFIGS,
        JSON.stringify(configurations)
      );
    } catch (error) {
      console.error("Failed to save skin configuration:", error);
      throw new Error("Failed to save skin configuration");
    }
  }

  /**
   * Remove skin configuration
   */
  removeSkinConfiguration(skinId: string): void {
    try {
      const configurations = this.getSkinConfigurations();
      const filteredConfigs = configurations.filter(
        (config) => config.skinId !== skinId
      );

      localStorage.setItem(
        STORAGE_KEYS.SKIN_CONFIGS,
        JSON.stringify(filteredConfigs)
      );
    } catch (error) {
      console.error("Failed to remove skin configuration:", error);
    }
  }

  /**
   * Get skin states
   */
  getSkinStates(): SkinState[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SKIN_STATES);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Failed to load skin states:", error);
      return [];
    }
  }

  /**
   * Get specific skin state
   */
  getSkinState(skinId: string): SkinState | null {
    const states = this.getSkinStates();
    return states.find((state) => state.skinId === skinId) || null;
  }

  /**
   * Update skin state
   */
  updateSkinState(
    skinId: string,
    updates: Partial<Omit<SkinState, "skinId">>
  ): void {
    try {
      const states = this.getSkinStates();
      const existingIndex = states.findIndex(
        (state) => state.skinId === skinId
      );

      if (existingIndex >= 0) {
        states[existingIndex] = {
          ...states[existingIndex],
          ...updates,
        };
      } else {
        states.push({
          skinId,
          isEnabled: false,
          enableCount: 0,
          ...updates,
        });
      }

      localStorage.setItem(STORAGE_KEYS.SKIN_STATES, JSON.stringify(states));
    } catch (error) {
      console.error("Failed to update skin state:", error);
    }
  }

  /**
   * Remove skin state
   */
  removeSkinState(skinId: string): void {
    try {
      const states = this.getSkinStates();
      const filteredStates = states.filter((state) => state.skinId !== skinId);

      localStorage.setItem(
        STORAGE_KEYS.SKIN_STATES,
        JSON.stringify(filteredStates)
      );
    } catch (error) {
      console.error("Failed to remove skin state:", error);
    }
  }

  /**
   * Get installed skin IDs as a Set for quick lookup
   */
  getInstalledSkinIds(): Set<string> {
    const installedSkins = this.getInstalledSkins();
    return new Set(installedSkins.map((skin) => skin.skinId));
  }

  /**
   * Get enabled skin IDs as a Set for quick lookup
   */
  getEnabledSkinIds(): Set<string> {
    const installedSkins = this.getInstalledSkins();
    return new Set(
      installedSkins.filter((skin) => skin.isEnabled).map((skin) => skin.skinId)
    );
  }

  /**
   * Export all skin data for backup
   */
  exportSkinData(): {
    installedSkins: SkinInstallStatus[];
    configurations: SkinConfiguration[];
    states: SkinState[];
    exportedAt: string;
  } {
    return {
      installedSkins: this.getInstalledSkins(),
      configurations: this.getSkinConfigurations(),
      states: this.getSkinStates(),
      exportedAt: new Date().toISOString(),
    };
  }

  /**
   * Import skin data from backup
   */
  importSkinData(data: {
    installedSkins?: SkinInstallStatus[];
    configurations?: SkinConfiguration[];
    states?: SkinState[];
  }): void {
    try {
      if (data.installedSkins) {
        localStorage.setItem(
          STORAGE_KEYS.INSTALLED_SKINS,
          JSON.stringify(data.installedSkins)
        );
      }

      if (data.configurations) {
        localStorage.setItem(
          STORAGE_KEYS.SKIN_CONFIGS,
          JSON.stringify(data.configurations)
        );
      }

      if (data.states) {
        localStorage.setItem(
          STORAGE_KEYS.SKIN_STATES,
          JSON.stringify(data.states)
        );
      }
    } catch (error) {
      console.error("Failed to import skin data:", error);
      throw new Error("Failed to import skin data");
    }
  }

  /**
   * Clear all skin data
   */
  clearAllData(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.INSTALLED_SKINS);
      localStorage.removeItem(STORAGE_KEYS.SKIN_CONFIGS);
      localStorage.removeItem(STORAGE_KEYS.SKIN_STATES);
    } catch (error) {
      console.error("Failed to clear skin data:", error);
      throw new Error("Failed to clear skin data");
    }
  }

  /**
   * Get storage statistics
   */
  getStorageStats() {
    const installedSkins = this.getInstalledSkins();
    const enabledSkins = installedSkins.filter((skin) => skin.isEnabled);
    const configurations = this.getSkinConfigurations();

    return {
      totalInstalled: installedSkins.length,
      totalEnabled: enabledSkins.length,
      totalConfigurations: configurations.length,
      storageUsed: {
        installedSkins: JSON.stringify(installedSkins).length,
        configurations: JSON.stringify(configurations).length,
        states: JSON.stringify(this.getSkinStates()).length,
      },
    };
  }
}

export const rainmeterStorage = new RainmeterStorage();
