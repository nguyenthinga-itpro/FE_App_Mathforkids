import React, { createContext, useContext, useEffect, useState } from "react";
import SoundManager from "./SoundManager";

const SoundContext = createContext();

export const SoundProvider = ({ children }) => {
  const [volume, setVolume] = useState(null);

  useEffect(() => {
    const load = async () => {
      await SoundManager.loadBackgroundSound(
        // require("../../assets/sounds/bg-sound.mp3")
      );
      setVolume(SoundManager.getVolume());
    };

    load();

    return () => {
      SoundManager.unloadAll();
    };
  }, []);

  const increaseVolume = async () => {
    const newVolume = Math.min(1, volume + 0.1);
    setVolume(newVolume);
    await SoundManager.setVolume(newVolume);
  };

  const decreaseVolume = async () => {
    const newVolume = Math.max(0, volume - 0.1);
    setVolume(newVolume);
    await SoundManager.setVolume(newVolume);
  };

  const playSFX = async (key, file) => {
    await SoundManager.playSFX(key, file);
  };

  return (
    <SoundContext.Provider
      value={{
        volume,
        setVolume,
        increaseVolume,
        decreaseVolume,
        playSFX,
      }}
    >
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = () => useContext(SoundContext);
