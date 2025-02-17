import { FC, useEffect, useMemo, useState } from "react";
import "./styles.scss";
import { TableUI } from "components/Table";
import { TableColumnsType } from "components/Table/types";
import AvatarIcon from "../../assets/images/avatar.png";
import ProgressIcon from "../../assets/svg/progress.svg";
import { useAccount, useApi, useReadWasmState } from "@gear-js/react-hooks";
import { ProgramMetadata } from "@gear-js/api";
import { ARENA_ID, METADATA } from "pages/StartFight/constants";

import { useUnit } from "effector-react";
import { useNavigate } from "react-router-dom";
import { logsStore } from "model/logs";
import { isEmpty } from "lodash";
import { UnsubscribePromise } from "@polkadot/api/types";
import { battle } from "model/battleLogs";
import { PlayAndCancelButtons } from "./components/PlayAndCancelButtons";
import arenaMetaWasm from "../../assets/arena_state.meta.wasm";
import { useWasmMetadata } from "../MintCharacter/hooks/useWasmMetadata";
import { log } from "console";
import { MetaWasmDataType } from "app/types/metaWasmDataType";

export type QueueProps = {};

const inProgressColumns: TableColumnsType[] = [
  {
    field: "id",
    headerName: "Player ID",
    width: 220,
    position: "center",
  },
  {
    field: "NB",
    headerName: "Number of battles",
    width: 144,
    position: "center",
  },
  {
    field: "level",
    headerName: "Level",
    width: 172,
    position: "center",
  },
];

const getRows = (
  players: Array<{
    id: string;
    attributes: {
      agility: string;
      experience: string;
      level: string;
      stamina: string;
      strength: string;
      vitality: string;
    };
    name: string;
  }>
) => {
  return players.map((player) => ({
    id: (
      <div className="row_player">
        <img src={AvatarIcon} alt="AvatarIcon" />
        <div>
          <p className="row_name">{player.name}</p>
        </div>
      </div>
    ),
    NB: "0",
    level: <span className="row_lvl">{player.attributes.level}LVL</span>,
  }));
};

export const Queue: FC<QueueProps> = () => {
  const [updateUsersReadyForBattle, setBattleLog] = useUnit([
    logsStore.updateUsersReadyForBattle,
    battle.setBattleLog,
  ]);
  const { account } = useAccount();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [timer, setTimer] = useState(0);
  const [players, setPlayers] = useState([]);
  const navigate = useNavigate();
  const meta = useMemo(() => ProgramMetadata.from(METADATA), []);

  const inProgressRows = useMemo(() => {
    if (!players || isEmpty(Object.values(players))) {
      return [];
    }
    return getRows(Object.values(players));
  }, [players]);

  const { buffer } = useWasmMetadata(arenaMetaWasm);

  const metaWasmData: MetaWasmDataType = useMemo(
    () => ({
      programId: ARENA_ID,
      programMetadata: meta,
      wasm: buffer,
      functionName: "registered",
      argument: account?.decodedAddress,
    }),
    [account?.decodedAddress, meta, buffer]
  );

  const registered = useReadWasmState<
    Array<{
      attributes: {
        strength: string;
        agility: string;
        vitality: string;
        stamina: string;
      };
      energy: string;
      hp: string;
      id: string;
      name: string;
      owner: string;
      position: string;
    }>
  >(metaWasmData).state;

  useEffect(() => {
    setPlayers(JSON.parse(localStorage.getItem("players")));
  }, [setPlayers]);

  useEffect(() => {
    if (registered) {
      setPlayers(registered);
      localStorage.setItem("players", JSON.stringify(registered));
    }

    if (registered && !isEmpty(registered)) {
      // const queue = JSON.parse(localStorage.getItem("usersOnQueue")) ?? {};
      const usersOnQueue = registered.reduce((acc, cur) => {
        return {
          ...acc,
          [`${cur.id}`]: cur,
        };
      }, {});
      localStorage.setItem("usersOnQueue", JSON.stringify(usersOnQueue));
      updateUsersReadyForBattle(usersOnQueue);
    }
  }, [registered, updateUsersReadyForBattle]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const { api } = useApi();

  useEffect(() => {
    let unsub: UnsubscribePromise | undefined;
    if (api?.gearEvents) {
      unsub = api.gearEvents.subscribeToGearEvent(
        "UserMessageSent",
        ({ data: { message } }) => {
          if (JSON.parse(message.toString()).source === ARENA_ID) {
            const result = meta
              .createType(meta.types.handle.output, message.payload)
              .toJSON();

            if (typeof result !== "object") return;

            console.log("result", result);

            if ("arenaLog" in result) {
              setBattleLog(result.arenaLog);
              const allBattleLog =
                JSON.parse(localStorage.getItem("allBattleLog")) ?? [];
              localStorage.setItem(
                "battleLog",
                JSON.stringify(result.arenaLog)
              );

              localStorage.setItem(
                "allBattleLog",
                JSON.stringify(allBattleLog.concat(result?.arenaLog ?? []))
              );
              navigate("/battle");
            }
          }
        }
      );
    }

    return () => {
      unsub?.then((res) => console.log("res", res()));
    };
  }, [api, meta, navigate, setBattleLog, updateUsersReadyForBattle]);

  return (
    <div className="queue">
      <div className="modal_queue">
        <div className="modal_loader">
          <p className="modal_tille">Tournament participants</p>
          <img
            className={"modal_progress"}
            src={ProgressIcon}
            alt="ProgressIcon"
          />
          <p className="modal_info">Waiting players</p>
          <p className="modal_badge">{`${Math.floor(timer / 60)
            .toString()
            .padStart(2, "0")}:${(timer - Math.floor(timer / 60) * 60)
            .toString()
            .padStart(2, "0")}`}</p>
        </div>
        <div className="modal_table">
          <TableUI rows={inProgressRows} columns={inProgressColumns} />
        </div>
        <PlayAndCancelButtons
          isPlayDisabled={players?.length < 2}
          isDoubleReservationNeeded={players?.length > 2}
        />
      </div>
    </div>
  );
};
