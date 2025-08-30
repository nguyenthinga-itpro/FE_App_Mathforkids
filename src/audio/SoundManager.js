import { Audio } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";

const VOLUME_KEY = "APP_VOLUME_LEVEL";

class SoundManager {
  constructor() {
    this.backgroundSound = null;
    this.sfxSounds = {};
    this.volume = 0.2;
  }

  async loadBackgroundSound(file) {
    try {
      const savedVolume = await AsyncStorage.getItem(VOLUME_KEY);
      if (savedVolume !== null) {
        this.volume = parseFloat(savedVolume);
      }

      if (!this.backgroundSound) {
        const { sound } = await Audio.Sound.createAsync(file);
        this.backgroundSound = sound;
      }

      await this.backgroundSound.setIsLoopingAsync(true);
      await this.backgroundSound.setVolumeAsync(this.volume);
      await this.backgroundSound.playAsync();
    } catch (error) {
      console.log("Error loadBackgroundSound:", error);
    }
  }

  async setVolume(value) {
    this.volume = Math.min(1, Math.max(0, value));
    await AsyncStorage.setItem(VOLUME_KEY, this.volume.toString());

    if (this.backgroundSound) {
      await this.backgroundSound.setVolumeAsync(this.volume);
    }
  }

  getVolume() {
    return this.volume;
  }

  async playSFX(key, file) {
    try {
      if (!this.sfxSounds[key]) {
        const { sound } = await Audio.Sound.createAsync(file);
        this.sfxSounds[key] = sound;
      }
      await this.sfxSounds[key].replayAsync();
    } catch (error) {
      console.log(`Lỗi playSFX "${key}":`, error);
    }
  }

  async unloadAll() {
    if (this.backgroundSound) {
      await this.backgroundSound.unloadAsync();
      this.backgroundSound = null;
    }
    for (const key in this.sfxSounds) {
      await this.sfxSounds[key].unloadAsync();
    }
    this.sfxSounds = {};
  }
}

export default new SoundManager();
