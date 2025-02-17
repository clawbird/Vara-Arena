import { FC, memo, useEffect, useReducer, useState } from "react";
import "./styles.scss";
import { Button } from "components/Button";
import { AccountsModal } from "components/AccountsModal";
import stateMetaWasm from "../../assets/mint_state.meta.wasm";
import { useAccount, useAlert } from "@gear-js/react-hooks";
import { MINT_ID } from "pages/MintCharacter/constants";
import { Outlet, useNavigate } from "react-router-dom";

export const useWasmMetadata = (source: RequestInfo | URL) => {
  const alert = useAlert();
  const [data, setData] = useState<Buffer>();

  useEffect(() => {
    if (source) {
      fetch(source)
        .then((response) => response.arrayBuffer())
        .then((array) => Buffer.from(array))
        .then((buffer) => setData(buffer))
        .catch(({ message }: Error) => alert.error(`Fetch error: ${message}`));
    }
  }, [alert, source]);

  return { buffer: data };
};

export type StartScreenProps = {};

export const StartScreen: FC<StartScreenProps> = memo(() => {
  const [visible, toggle] = useReducer((state) => !state, false);
  const [userChoosed, userChoose] = useReducer((state) => !state, false);
  const navigate = useNavigate();
  const { account } = useAccount();

  useEffect(() => {
    if (account) {
      navigate("/arena");
    }
  }, [account, navigate]);

  return (
    <>
      <div className="scr_start">
        <p>Arena</p>
        <Button onClick={toggle}>Connect wallet to enter the Arena</Button>
        {visible && <AccountsModal close={toggle} userChoose={userChoose} />}
      </div>
      <Outlet />
    </>
  );
});
