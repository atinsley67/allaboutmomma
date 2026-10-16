import "../styles.css";
import { DraftModeBanner } from "../components/layout/draftModeBanner";

const App = ({ Component, pageProps }) => {
  return (
    <>
      <Component {...pageProps} />
      {pageProps.draftMode && <DraftModeBanner />}
    </>
  );
};

export default App;
