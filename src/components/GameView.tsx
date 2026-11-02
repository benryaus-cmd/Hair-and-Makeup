import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';
import {
  createGame,
  type GameConfig,
  type GameHandle,
} from '@/game/create-game';
import type { GameEvent } from '@/game/types';
import type { StudioBootStatus } from '@/ui/startup-model';

type GameViewProps = {
  config: GameConfig;
  onError: (message: string) => void;
  onEvent: (event: GameEvent) => void;
  initialCollectedCards: number[];
  onBoot: (status: StudioBootStatus) => void;
};

export type GameViewHandle = GameHandle;

export const GameView = forwardRef<GameViewHandle, GameViewProps>(
  function GameView({ config, onError, onEvent, onBoot, initialCollectedCards }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const handleRef = useRef<GameHandle | null>(null);
    const callbacksRef = useRef({ onError, onEvent, onBoot, initialCollectedCards });
    const initialConfigRef = useRef(config);

    useEffect(() => {
      callbacksRef.current = { onError, onEvent, onBoot, initialCollectedCards };
    }, [onError, onEvent, onBoot, initialCollectedCards]);

    useImperativeHandle(ref, () => {
      const proxy: GameHandle = {
        playArrival: skip => handleRef.current?.playArrival(skip),
        finishArrival: () => handleRef.current?.finishArrival(),
        pause: () => handleRef.current?.pause(),
        resume: () => handleRef.current?.resume(),
        restart: () => handleRef.current?.restart(),
        updateConfig: next => handleRef.current?.updateConfig(next),
        dispose: () => handleRef.current?.dispose(),
        setLook: look => handleRef.current?.setLook(look),
        setPose: pose => handleRef.current?.setPose(pose),
        setActivity: kind => handleRef.current?.setActivity(kind),
        setActivityInput: value => handleRef.current?.setActivityInput(value),
        setPouring: on => handleRef.current?.setPouring(on),
        setPetAction: action => handleRef.current?.setPetAction(action),
        setPhotoCompanion: id => handleRef.current?.setPhotoCompanion(id),
        setPhotoGroup: (ids,pose,pair) => handleRef.current?.setPhotoGroup(ids,pose,pair),
        zoomCamera: delta => handleRef.current?.zoomCamera(delta),
        panCamera:(dx,dy)=>handleRef.current?.panCamera(dx,dy),
        resetPhotoFraming:()=>handleRef.current?.resetPhotoFraming(),
        capturePhoto: fullFrame => handleRef.current?.capturePhoto(fullFrame) || null,
        setMove: (x, y) => handleRef.current?.setMove(x, y),
        rotateCamera: (dx, dy) => handleRef.current?.rotateCamera(dx, dy),
        jump: () => handleRef.current?.jump(),
        interact: () => handleRef.current?.interact(),
        setOutfit: id => handleRef.current?.setOutfit(id),
        setHair: id => handleRef.current?.setHair(id),
        setAccessory: id => handleRef.current?.setAccessory(id),
        setShoes: id => handleRef.current?.setShoes(id),
        setMoodLight: color => handleRef.current?.setMoodLight(color),
        setPresentation: mode => handleRef.current?.setPresentation(mode),
        setInputEnabled: enabled => handleRef.current?.setInputEnabled(enabled),
        setDancing: on => handleRef.current?.setDancing(on),
        setCollectedCards: ids => handleRef.current?.setCollectedCards(ids),
        celebrate: () => handleRef.current?.celebrate(),
      };
      return proxy;
    }, []);

    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;
      let active = true;
      let handle: GameHandle;
      try {
      handle = createGame(
        container,
        initialConfigRef.current,
        message => { if (active) callbacksRef.current.onError(message); },
        event => { if (active) callbacksRef.current.onEvent(event); },
        status => { if (active) callbacksRef.current.onBoot(status); }
      );
      } catch (error) {
        callbacksRef.current.onError(error instanceof Error ? error.message : 'The studio could not start. Try lighter graphics.');
        return () => { active = false; };
      }
      handleRef.current = handle;
      handle.setInputEnabled(false);
      handle.setCollectedCards(callbacksRef.current.initialCollectedCards);
      return () => {
        active = false;
        handle.dispose();
        handleRef.current = null;
      };
    }, []);

    useEffect(() => {
      handleRef.current?.updateConfig(config);
    }, [config]);

    return <div ref={containerRef} className="game-view" />;
  }
);