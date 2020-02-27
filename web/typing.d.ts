interface UseFunction<Params = { [key: string]: any }> {
  (node: HTMLElement, params?: Params): {
    destroy();
  };
}
