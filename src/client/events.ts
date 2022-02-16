import EventEmitter from 'eventemitter3';

const eventEmitter = new EventEmitter();

/* eslint-disable  @typescript-eslint/no-explicit-any */
const Emitter = {
  on: (event: string, fn: (...data: any) => void) => eventEmitter.on(event, fn),
  once: (event: string, fn: (...data: any) => void) => eventEmitter.once(event, fn),
  off: (event: string, fn: (...data: any) => void) => eventEmitter.off(event, fn),
  emit: (event: string, ...payload: any) => eventEmitter.emit(event, ...payload),
};

Object.freeze(Emitter);

export default Emitter;
