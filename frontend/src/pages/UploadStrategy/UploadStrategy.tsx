import { useAccount, useApi } from "@gear-js/react-hooks";
import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { Input } from "../../components";
import { Button } from "../../components/Button";
import UploadIcon from "../../assets/svg/upload_icon.svg";

import "./styles.scss";
import { web3FromSource } from "@polkadot/extension-dapp";
import { useNavigate } from "react-router-dom";
import { Table } from "@mantine/core";

export const UploadStrategy = () => {
  const [programName, setProgramName] = useState("");
  const inputFileRef = useRef<
    HTMLInputElement | null
  >(null);
  const navigate = useNavigate();

  const onChangeInputProgramName = useCallback(
    ({ target }: ChangeEvent<HTMLInputElement>) => {
      setProgramName(target.value);
    },
    []
  );

  const [fileContent, setFileContent] = useState<
    undefined | ArrayBuffer | string | null
  >(undefined);
  const { api } = useApi();
  const { account } = useAccount();

  const uploadFile = async (event) => {
    const fileReader = new FileReader();
    fileReader.readAsText(event.target.files[0]);

    fileReader.onload = async (e) => {
      console.log("fileReader.result", fileReader.result);
      setFileContent(fileReader.result);
    };
  };

  const handleOnUpload = () => {
    if (inputFileRef) {
      //@ts-ignore
      inputFileRef.current.click();
    }
  };

  useEffect(() => {
    const foo = async () => {
      if (fileContent) {
        if (!account) {
          throw new Error("No account");
        }

        const [{ signer }] = await Promise.all([
          web3FromSource(account.meta.source),
        ]);

        api?.code.signAndSend(account.address, { signer }, ({ events }) => {
          navigate("/arena");

          events.forEach(({ event: { method, data } }) => {
            if (method === "ExtrinsicFailed") {
              console.log("data.toString()", data.toHuman());

              throw new Error(data.toString());
            } else if (method === "CodeChanged") {
              console.log("success:___", data.toHuman());
            }
          });
        });
      }
    };

    foo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileContent]);

  return (
    <div className="upload">
      <Table className={"table_container"}>
        <div className={"table_header"}>Upload program (2/2)</div>
        <div className={"modal"}>
          <div className={"top_wrapper"}>
            <div className={"upload_text"}>Upload your Arena strategy</div>
            <div className={"char_info"}>Program name</div>
            <Input
              className={"input_container"}
              onChange={onChangeInputProgramName}
              value={programName}
              placeholder="My strategy"
            />
          </div>
        </div>
        <div className={"input_file_container"}>
          <div className={"input_file_content"}>
            <img src={UploadIcon} className={"upload_icon"} alt="upload icon" />
            <input
              type="file"
              onChange={uploadFile}
              className={"input_file"}
              ref={inputFileRef}
            />
            <div className={"text"}> or drag and drop</div>
            <div className={"comment"}> example.opt.wasm file</div>
          </div>
        </div>

        <div className={"buttonWrapper"}>
          <Button className={"cancelButton"} onClick={() => { }}>
            Cancel
          </Button>
          <Button className={"uploadButton"} onClick={handleOnUpload}>
            Upload program
          </Button>
        </div>
      </Table>
    </div>
  );
};
