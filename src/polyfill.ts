import {
  ByteLengthQueuingStrategy,
  CountQueuingStrategy,
  ReadableByteStreamController,
  ReadableStream,
  ReadableStreamBYOBReader,
  ReadableStreamBYOBRequest,
  ReadableStreamDefaultController,
  ReadableStreamDefaultReader,
  TransformStream,
  TransformStreamDefaultController,
  WritableStream,
  WritableStreamDefaultController,
  WritableStreamDefaultWriter
} from './ponyfill';
import { globals } from './utils';

// Export
export * from './ponyfill';

(e => {
  const freeze = globals.freeze || Object.freeze;

  for (const p in e) {
    if (Object.prototype.hasOwnProperty.call(e, p)) {
      Object.defineProperty(globals, p, {
        value: e[p as (keyof typeof e)],
        writable: true,
        configurable: true
      });
    }
  }

  Object.defineProperty(globals, 'WebStreamsPolyfill', { value: freeze(e) });
})({
  ReadableStream,
  ReadableStreamDefaultController,
  ReadableByteStreamController,
  ReadableStreamBYOBRequest,
  ReadableStreamDefaultReader,
  ReadableStreamBYOBReader,

  WritableStream,
  WritableStreamDefaultController,
  WritableStreamDefaultWriter,

  ByteLengthQueuingStrategy,
  CountQueuingStrategy,

  TransformStream,
  TransformStreamDefaultController
});
