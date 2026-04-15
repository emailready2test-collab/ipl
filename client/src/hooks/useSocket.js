import { useEffect, useRef } from 'react';
import { getSocket } from '../services/socket';

export function useSocket(handlers) {
  const ref = useRef(handlers);
  ref.current = handlers;

  useEffect(() => {
    const s = getSocket();
    if (!s) return;

    const on = (evt, fn) => s.on(evt, fn);
    const off = (evt, fn) => s.off(evt, fn);

    const onUpdate     = (d) => ref.current.onPurseUpdate?.(d);
    const onReset      = (d) => ref.current.onPurseReset?.(d);
    const onInitial    = (d) => ref.current.onInitialState?.(d);
    const onConnect    = ()  => ref.current.onConnect?.();
    const onDisconnect = ()  => ref.current.onDisconnect?.();
    const onBuzzerControl = (d) => ref.current.onBuzzerControl?.(d);
    const onLotPreview    = (d) => ref.current.onLotPreview?.(d);
    const onBuzzerUpdate  = (d) => ref.current.onBuzzerUpdate?.(d);
    const onTeamStatus    = (d) => ref.current.onTeamStatus?.(d);

    on('purse_update',    onUpdate);
    on('purse_reset',     onReset);
    on('initial_state',   onInitial);
    on('connect',         onConnect);
    on('disconnect',      onDisconnect);
    on('buzzer_control',  onBuzzerControl);
    on('lot_preview',     onLotPreview);
    on('buzzer_update',   onBuzzerUpdate);
    on('team_status',     onTeamStatus);

    if (s.connected) ref.current.onConnect?.();

    return () => {
      off('purse_update',   onUpdate);
      off('purse_reset',    onReset);
      off('initial_state',  onInitial);
      off('connect',        onConnect);
      off('disconnect',     onDisconnect);
      off('buzzer_control', onBuzzerControl);
      off('lot_preview',    onLotPreview);
      off('buzzer_update',  onBuzzerUpdate);
      off('team_status',    onTeamStatus);
    };
  }, []);

  return getSocket(); // Returns the actual socket object
}
