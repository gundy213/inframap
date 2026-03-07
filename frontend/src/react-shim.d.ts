// Minimal React/shim types for editor static checking when React types aren't installed
declare module 'react' {
  const React: any;
  export default React;
  export const useState: any;
  export const useEffect: any;
  export const useRef: any;
  export const FC: any;
}

declare namespace JSX {
  interface IntrinsicElements { [elemName: string]: any }
}
