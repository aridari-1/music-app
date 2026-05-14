"use client";

import { create } from "zustand";

export type RepeatMode = "off" | "all" | "one";

export type Song = {
  id: string;
  title: string;

  genre?: string;
  price?: number;

  cover_signed_url?: string;

  // 🎤 Artist
  artist_id?: string;
  artist_name?: string;

  // 🔐 Ownership
  is_owned?: boolean;
};

type PlayArgs = {
  song: Song;
  queue?: Song[];
  contextId?: string;
};

type PlayerState = {
  queue: Song[];

  contextId?: string;

  currentIndex: number;

  currentSong: Song | null;
  currentSongId: string | null;

  audio: HTMLAudioElement | null;

  isPlaying: boolean;
  loading: boolean;
  error: string | null;

  volume: number;
  muted: boolean;

  shuffle: boolean;
  repeat: RepeatMode;

  setQueue: (
    queue: Song[],
    startId?: string,
    contextId?: string
  ) => void;

  play: (
    args: PlayArgs
  ) => Promise<void>;

  toggle: (
    args: PlayArgs
  ) => Promise<void>;

  pause: () => void;

  resume: () => Promise<void>;

  next: () => Promise<void>;

  prev: () => Promise<void>;

  seek: (
    time: number
  ) => void;

  setVolume: (
    v: number
  ) => void;

  toggleMute: () => void;

  toggleShuffle: () => void;

  cycleRepeat: () => void;

  clear: () => void;
};

function clamp(
  n: number,
  min: number,
  max: number
) {
  return Math.max(
    min,
    Math.min(max, n)
  );
}

export default create<PlayerState>(
  (set, get) => {
    let playRequestToken = 0;

    const stopAndCleanup = () => {
      const a = get().audio;

      if (!a) return;

      try {
        a.pause();
        a.src = "";
        a.load();
      } catch {}

      a.onended = null;

      set({
        audio: null,
        isPlaying: false,
      });
    };

    const attachEndedHandler = (
      audio: HTMLAudioElement
    ) => {
      audio.onended = async () => {
        const {
          repeat,
          queue,
          currentIndex,
          contextId,
        } = get();

        // 🔁 Repeat one
        if (repeat === "one") {
          try {
            audio.currentTime = 0;

            await audio.play();

            set({
              isPlaying: true,
            });
          } catch {
            set({
              isPlaying: false,
            });
          }

          return;
        }

        // 🚫 Empty queue
        if (queue.length === 0) {
          set({
            isPlaying: false,
          });

          return;
        }

        const atEnd =
          currentIndex >=
          queue.length - 1;

        // 🛑 End + repeat off
        if (
          atEnd &&
          repeat === "off"
        ) {
          set({
            isPlaying: false,
          });

          return;
        }

        // 🔁 Repeat all
        if (
          atEnd &&
          repeat === "all"
        ) {
          await get().play({
            song: queue[0],
            queue,
            contextId,
          });

          set({
            currentIndex: 0,
            currentSong: queue[0],
            currentSongId:
              queue[0].id,
          });

          return;
        }

        // ⏭️ Next
        await get().next();
      };
    };

    const pickNextIndex = () => {
      const {
        queue,
        currentIndex,
        shuffle,
      } = get();

      if (queue.length === 0)
        return -1;

      if (!shuffle) {
        return clamp(
          currentIndex + 1,
          0,
          queue.length - 1
        );
      }

      if (queue.length === 1)
        return 0;

      let next = currentIndex;

      while (
        next === currentIndex
      ) {
        next = Math.floor(
          Math.random() *
            queue.length
        );
      }

      return next;
    };

    const pickPrevIndex = () => {
      const {
        queue,
        currentIndex,
        audio,
      } = get();

      if (queue.length === 0)
        return -1;

      // 🎵 Spotify behavior
      if (
        audio &&
        audio.currentTime > 3
      ) {
        return currentIndex;
      }

      return clamp(
        currentIndex - 1,
        0,
        queue.length - 1
      );
    };

    return {
      queue: [],

      contextId: undefined,

      currentIndex: -1,

      currentSong: null,
      currentSongId: null,

      audio: null,

      isPlaying: false,
      loading: false,
      error: null,

      volume: 1,
      muted: false,

      shuffle: false,
      repeat: "off",

      setQueue: (
        queue,
        startId,
        contextId
      ) => {
        const idx = startId
          ? queue.findIndex(
              (s) =>
                s.id === startId
            )
          : 0;

        set({
          queue,

          contextId,

          currentIndex:
            idx >= 0 ? idx : 0,
        });
      },

      play: async ({
        song,
        queue,
        contextId,
      }) => {
        const token =
          ++playRequestToken;

        try {
          set({
            loading: true,
            error: null,
          });

          // 🎵 Update queue
          if (
            queue &&
            queue.length > 0
          ) {
            const idx =
              queue.findIndex(
                (s) =>
                  s.id === song.id
              );

            set({
              queue,

              contextId,

              currentIndex:
                idx >= 0
                  ? idx
                  : 0,
            });
          }

          // 🛑 Stop previous audio
          stopAndCleanup();

          // 🔐 Stream request
          const res =
            await fetch(
              "/api/stream",
              {
                method: "POST",
                body: JSON.stringify({
                  songId:
                    song.id,
                }),
              }
            );

          const data =
            await res.json();

          if (!res.ok) {
            set({
              loading: false,

              error:
                data?.error ||
                "Playback failed",
            });

            return;
          }

          // 🚫 Ignore old requests
          if (
            token !==
            playRequestToken
          )
            return;

          const a = new Audio(
            data.url
          );

          // 🔊 Restore prefs
          a.volume =
            get().volume;

          a.muted =
            get().muted;

          attachEndedHandler(a);

          await a.play();

          set({
            audio: a,

            currentSong:
              song,

            currentSongId:
              song.id,

            isPlaying: true,

            loading: false,
          });
        } catch (e: any) {
          set({
            loading: false,

            isPlaying: false,

            error:
              e?.message ||
              "Playback error",
          });
        }
      },

      toggle: async ({
        song,
        queue,
        contextId,
      }) => {
        const {
          currentSongId,
          isPlaying,
        } = get();

        // ⏯️ Same song
        if (
          currentSongId ===
          song.id
        ) {
          if (isPlaying) {
            get().pause();

            return;
          }

          await get().resume();

          return;
        }

        // ▶️ New song
        await get().play({
          song,
          queue,
          contextId,
        });
      },

      pause: () => {
        const a = get().audio;

        if (!a) return;

        a.pause();

        set({
          isPlaying: false,
        });
      },

      resume: async () => {
        const a = get().audio;

        if (!a) return;

        try {
          await a.play();

          set({
            isPlaying: true,
          });
        } catch {
          set({
            isPlaying: false,
          });
        }
      },

      next: async () => {
        const {
          queue,
          contextId,
        } = get();

        if (!queue.length)
          return;

        const nextIndex =
          pickNextIndex();

        if (nextIndex < 0)
          return;

        const nextSong =
          queue[nextIndex];

        set({
          currentIndex:
            nextIndex,

          currentSong:
            nextSong,

          currentSongId:
            nextSong.id,
        });

        await get().play({
          song: nextSong,
          queue,
          contextId,
        });
      },

      prev: async () => {
        const {
          queue,
          currentIndex,
          contextId,
        } = get();

        if (!queue.length)
          return;

        const prevIndex =
          pickPrevIndex();

        if (prevIndex < 0)
          return;

        const prevSong =
          queue[prevIndex];

        // ⏮️ Restart current
        if (
          prevIndex ===
            currentIndex &&
          get().audio
        ) {
          get().audio!.currentTime =
            0;

          return;
        }

        set({
          currentIndex:
            prevIndex,

          currentSong:
            prevSong,

          currentSongId:
            prevSong.id,
        });

        await get().play({
          song: prevSong,
          queue,
          contextId,
        });
      },

      seek: (time) => {
        const a = get().audio;

        if (
          !a ||
          !Number.isFinite(
            time
          )
        )
          return;

        a.currentTime =
          Math.max(0, time);
      },

      setVolume: (v) => {
        const volume = clamp(
          v,
          0,
          1
        );

        const a = get().audio;

        if (a) {
          a.volume = volume;
        }

        set({
          volume,
        });

        // 🔊 Auto unmute
        if (
          volume > 0 &&
          get().muted
        ) {
          if (a) {
            a.muted = false;
          }

          set({
            muted: false,
          });
        }
      },

      toggleMute: () => {
        const a = get().audio;

        const muted =
          !get().muted;

        if (a) {
          a.muted = muted;
        }

        set({
          muted,
        });
      },

      toggleShuffle: () =>
        set({
          shuffle:
            !get().shuffle,
        }),

      cycleRepeat: () => {
        const r = get().repeat;

        set({
          repeat:
            r === "off"
              ? "all"
              : r === "all"
              ? "one"
              : "off",
        });
      },

      clear: () => {
        stopAndCleanup();

        set({
          queue: [],

          contextId:
            undefined,

          currentIndex: -1,

          currentSong: null,
          currentSongId: null,

          isPlaying: false,
          loading: false,
          error: null,
        });
      },
    };
  }
);