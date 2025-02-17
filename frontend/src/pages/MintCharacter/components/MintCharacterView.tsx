import { Input } from "components";
import { Button } from "components/Button";
import { ButtonGroup } from "components/ButtonGroup";
import { StatBar } from "components/StatBar";
import { FC, memo } from "react";
import LockSvg from "../../../assets/svg/lock.svg";
import CharSvg from "../../../assets/svg/char.svg";
import "./styles.scss";
import React from "react";
import { StrategyInput } from "./StrategyInput";
import { Table } from "@mantine/core";

type MintCharacterViewProps = {
  stats: {
    strength: number;
    agility: number;
    vitality: number;
    stamina: number;
    points: number;
  };
  decrease: (stat) => void;
  increase: (stat) => void;
  disabled: boolean;
  onSubmit: VoidFunction;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  onUploadCodeChange: (codeId: string) => void;
  name: string;
  codeId: string;
  setCodeId: (codeId: string) => void;
};

export const MintCharacterView: FC<MintCharacterViewProps> = memo(
  ({
    stats,
    decrease,
    increase,
    disabled,
    onSubmit,
    onChange,
    onUploadCodeChange,
    name,
    codeId,
    setCodeId,
  }) => {
    return (
      <div className="mint_char">
        <Table className={"table_container"}>
          <div className={"table_header"}>Mint character to proceed</div>
          <div className={"modal"}>
            <div className={"top_wrapper"}>
              <div className={"char_info"}>
                Character info
                <a href="https://impulse-dao.gitbook.io/impulse-dao/games-for-developers/arena">
                  [?]
                </a>
              </div>
              <Input
                className={"input_container"}
                onChange={onChange}
                value={name}
                placeholder="Enter character name"
                name="name"
              />
              <StrategyInput
                codeId={codeId}
                setCodeId={setCodeId}
                onUploadCodeChange={onUploadCodeChange}
              />
            </div>
            <ButtonGroup
              leftText={"Strength"}
              firstButton={"-"}
              secondButton={stats.strength}
              thirdButton={"+"}
              onClickSecondButton={() => {}}
              onClickFirstButton={() => decrease("strength")}
              onClickThirdButton={() => increase("strength")}
            />
            <ButtonGroup
              leftText={"Agility"}
              firstButton={"-"}
              secondButton={stats.agility}
              thirdButton={"+"}
              onClickSecondButton={() => {}}
              onClickFirstButton={() => decrease("agility")}
              onClickThirdButton={() => increase("agility")}
            />
            <ButtonGroup
              leftText={"Vitality"}
              firstButton={"-"}
              secondButton={stats.vitality}
              thirdButton={"+"}
              onClickSecondButton={() => {}}
              onClickFirstButton={() => decrease("vitality")}
              onClickThirdButton={() => increase("vitality")}
            />
            <ButtonGroup
              leftText={"Stamina"}
              firstButton={"-"}
              secondButton={stats.stamina}
              thirdButton={"+"}
              onClickSecondButton={() => {}}
              onClickFirstButton={() => decrease("stamina")}
              onClickThirdButton={() => increase("stamina")}
            />
            <div className={"points"}>
              Points left:<span>{stats.points}</span>{" "}
            </div>
          </div>
          <div className={"modal_right"}>
            <StatBar
              health={stats.vitality * 30 + 10}
              energy={
                [0, 110, 120, 130, 140, 150, 160, 170, 180, 190][stats.stamina]
              }
            />
            <div className={"imgWrapper"}>
              {Array.from({ length: 9 }, (_, i) => (
                <img className={`lock_img${i}`} src={LockSvg} alt="LockSvg" />
              ))}
              <img className={"char_svg"} src={CharSvg} alt="CharSvg" />
            </div>
          </div>
          <div className={"buttonWrapper"}>
            <Button className={"cancelButton"} onClick={() => {}}>
              Cancel
            </Button>
            <Button
              className={"mintButton"}
              onClick={onSubmit}
              disabled={disabled}
            >
              Mint character
            </Button>
          </div>
        </Table>
      </div>
    );
  }
);
