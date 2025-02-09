import { SWRConfig } from "swr";

function Providers({ children }) {
  return (
    <SWRConfig value={{ provider: () => new Map() }}>{children}</SWRConfig>
  );
}

export default Providers;
