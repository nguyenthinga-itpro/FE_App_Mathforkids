import { Audio } from "expo-av";
import { useRef } from "react";

const SOUND_FILES = {
  openClick: require("../../assets/sounds/cl-sound.wav"),
  closeClick: require("../../assets/sounds/cl-close-sound.wav"),
};
export default function useSound() {
  const soundsRef = useRef({});
  const loadSound = async (key) => {
    if (!SOUND_FILES[key]) {
      return;
    }
    if (!soundsRef.current[key]) {
      const { sound } = await Audio.Sound.createAsync(SOUND_FILES[key]);
      soundsRef.current[key] = sound;
    }
  };
  const play = async (key) => {
    try {
      await loadSound(key);
      const sound = soundsRef.current[key];
      await sound.replayAsync();
    } catch (err) {
      console.log(`error`, err);
    }
  };
  return { play };
}
