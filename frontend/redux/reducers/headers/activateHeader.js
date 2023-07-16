export default function activateHeader(state, action) {
  const headers = state.headers;
  const payload = action.payload;
  state.headers = headers.map((h) =>
    h.accessor === payload ? { ...h, active: !h.active } : h
  );

  return state;
}
