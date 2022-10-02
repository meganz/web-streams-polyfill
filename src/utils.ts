/// <reference lib="dom" />

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace globalThis {
  function nop(): undefined;
  function freeze(): object;
}

export const globals = typeof globalThis !== 'undefined' ? globalThis as any : self;

export const noop: (e: any) => undefined = globals.nop || (() => {
  return undefined;
});
