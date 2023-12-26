import { useSendMessage } from "@gear-js/react-hooks";
import { useCallback, useMemo } from "react";
import { METADATA, MINT_ID } from "../constants";
import { ProgramMetadata } from "@gear-js/api";
import { useNavigate } from "react-router-dom";
import { MAX_GAS_LIMIT } from "consts";

export const useOnSubmit = ({
  codeId,
  name,
  stats,
}: {
  codeId: string;
  name: string;
  stats: {
    strength: number;
    agility: number;
    vitality: number;
    stamina: number;
    points: number;
  };
}): VoidFunction => {
  const meta = useMemo(() => ProgramMetadata.from(METADATA), []);

  const send = useSendMessage(MINT_ID, meta, { isMaxGasLimit: true });
  const navigate = useNavigate();

  return useCallback(async () => {
    send({
      payload: {
        CreateCharacter: {
          code_id: codeId,
          attributes: {
            agility: stats.agility,
            stamina: stats.stamina,
            strength: stats.strength,
            vitality: stats.vitality,
          },
          name,
        },
      },
      gasLimit: MAX_GAS_LIMIT,
      onSuccess: () => {
        console.log("success");
        navigate("/arena");
      },
      onError: () => {
        console.log("error");
      },
    });
  }, [codeId, name, navigate, send, stats]);
};
