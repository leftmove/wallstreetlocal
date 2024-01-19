export default function setCik(state, action) {
  state.cik = action.payload;

  return state;
}
