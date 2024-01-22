import { useMemo } from "react";
import "./styles.scss";
import { useMintState } from "app/api/mintState";
import { MINT_METADATA, MINT_PROGRAM_ID } from "consts";
import { Table, Text } from "@mantine/core";
import { getShortIdString } from "utils";
import { useMyAccountId } from "hooks/hooks";

export const Leaderboard = () => {
  const myAccountId = useMyAccountId();

  const { data: mintState } = useMintState({
    variables: {
      metadata: MINT_METADATA,
      programId: MINT_PROGRAM_ID
    }
  });

  const { characters } = mintState ?? { characters: {} };

  const entries = useMemo(() => {
    return Object.entries(characters).sort(([, c1], [, c2]) => {
      return (c1.attributes.tierRating - c2.attributes.tierRating) * -1;
    });
  }, [characters]);


  const inProgressRows = entries.map(([ownerId, c]) => {
    const isMyCharacter = ownerId === myAccountId;

    return {
      name: c.name,
      level: c.level,
      exp: c.experience,
      ownerId,
      rating: c.attributes.tierRating,
      isMyCharacter,
    };
  });

  return (
    <div className="leaderboard">
      <div className="content-wrapper">
        <div className="header">Leaderboard</div>

        <div className='modal_table'>
          <Table horizontalSpacing="md" verticalSpacing="md" >
            <Table.Thead>
              <Table.Tr>
                {[
                  'Rating',
                  'Name',
                  'Level',
                  'Owner ID',
                ].map((header, idx) => {
                  return (
                    <Table.Th
                      key={header}
                      w={CELL_WIDTH[idx]}
                      ta={TEXT_ALIGN[idx]}
                    >
                      {header}
                    </Table.Th>
                  );
                })}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{inProgressRows.map((row) => {
              return (
                <Table.Tr
                  // onClick={() => {
                  //   const [lobbyId, battleId] = row.battleId.split('-') as [string, string | undefined];
                  //   navigate(newRoutes.tournamentResult({ lobbyId, battleId }));
                  // }}
                  className={['table_row', row.isMyCharacter ? 'table_row_highlighted' : ''].join(' ')}
                >
                  {[
                    /* Rating */
                    <div className={'badge'}>{row.rating}</div>,
                    /* Name */
                    <Text size="md"> {row.name}</Text>,
                    /* Level */
                    <div className={'badge'}>{row.level}</div>,
                    /* Owner ID */
                    <div title={row.ownerId}>{getShortIdString(row.ownerId)}</div>,
                  ].map((cellContent, idx) => {
                    return (
                      <Table.Td
                        key={idx}
                        w={CELL_WIDTH[idx]}
                        ta={TEXT_ALIGN[idx]}
                      >
                        {cellContent}
                      </Table.Td>
                    );
                  })}

                </Table.Tr>);
            })}</Table.Tbody>
          </Table>
        </div>
      </div>
    </div>
  );
};

const CELL_WIDTH = {
  0: '10%',
  1: '30%',
  // 2: '100px',
  3: '40%'
};

const TEXT_ALIGN = {
  0: 'center',
  1: 'left',
  2: 'center',
};
