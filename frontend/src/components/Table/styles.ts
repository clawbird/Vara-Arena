import styled, { css } from "styled-components";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  box-sizing: border-box;
  border-left: 2px solid white;
  border-right: 2px solid white;
  border-bottom: 2px solid white;
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
`;

const Column = styled.div<{ position?: "left" | "right" | "center" }>`
  display: flex;
  align-items: center;
  height: 16px;
  gap: 4px;
  ${({ position }) => css`
    justify-content: ${position};
  `}
`;

const ColumnText = styled.p<{ active: boolean; sortable: boolean }>`
  color: white;
  font-size: 12px;
  font-weight: ${({ active }) => (active ? "bold" : "normal")};
`;

// const ColumnIcon = styled.div<{ active: boolean; sortType: SortType }>`
//   height: 16px;
//   width: 16px;
//   visibility: ${({ active }) => (active ? 'visible' : 'hidden')};
//   ${({ sortType }) => {
//     if (sortType === SortType.ascending) {
//       return css`
//         transform: rotate(180deg);
//       `;
//     }
//   }}
// `;

const Columns = styled.div`
  display: flex;
  align-items: center;
  background: rgba(0, 0, 0, 0.7);
  height: 68px;
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
`;

const Rows = styled.div`
  display: flex;
  flex-direction: column;
`;

const Row = styled.div`
  height: 72px;
  display: flex;
  align-items: center;
  font-size: 14px;
  color: white;
  background: rgba(0, 0, 0, 0.7);
  border-top: 1px solid white;

  &:last-child {
    border-bottom-left-radius: 12px;
    border-bottom-right-radius: 12px;
  }
`;

const Cell = styled.div<{
  position?: "center" | "left" | "right";
  ableClick?: boolean;
}>`
  display: flex;
  ${({ position }) => css`
    justify-content: ${position};
  `}

  cursor: ${({ ableClick }) => {
    return ableClick ? "pointer" : "default";
  }};
`;

export const Styled = {
  Container,
  Columns,
  Column,
  // ColumnIcon,
  ColumnText,
  Row,
  Rows,
  Cell,
};
