import { Variables, gray, orderedCells } from "./logic";
type Props = {
  count: Variables;
  orientation: "wide" | "tall";
  values: (0 | 1 | null)[];
  answer?: number[];
  status?: "idle" | "checked";
  selected?: number[];
  groups?: number[][];
  onCell?: (n: number) => void;
  showMinterms?: boolean;
};
export default function KMap({
  count,
  orientation,
  values,
  answer,
  status = "idle",
  selected = [],
  groups = [],
  onCell,
  showMinterms,
}: Props) {
  const cells = orderedCells(count, orientation);
  const wide = count === 3 && orientation === "wide";
  const colLabels =
    count === 2 ? ["0", "1"] : count === 3 ? (wide ? gray : ["0", "1"]) : gray;
  const rowLabels =
    count === 2 ? ["0", "1"] : count === 3 ? (wide ? ["0", "1"] : gray) : gray;
  const colTitle = count === 2 ? "B" : count === 3 ? (wide ? "AB" : "A") : "CD";
  const rowTitle = count === 2 ? "A" : count === 3 ? (wide ? "C" : "BC") : "AB";
  return (
    <div className="map-wrap">
      <div className="axis-title">
        columns: {colTitle} · rows: {rowTitle}
      </div>
      <div
        className="kmap"
        style={{
          gridTemplateColumns: `54px repeat(${colLabels.length}, minmax(58px,82px))`,
        }}
      >
        <div className="corner">
          {rowTitle}╲{colTitle}
        </div>
        {colLabels.map((x) => (
          <div className="label" key={x}>
            {x}
          </div>
        ))}
        {cells.flatMap((row, r) => [
          <div className="label" key={"r" + r}>
            {rowLabels[r]}
          </div>,
          ...row.map((n) => {
            const correct = answer?.includes(n) ? 1 : 0;
            const cls =
              status === "checked"
                ? values[n] === correct
                  ? " correct"
                  : " wrong"
                : "";
            const marks = groups
              .map((g, i) => (g.includes(n) ? i : -1))
              .filter((i) => i >= 0);
            return (
              <button
                aria-label={`minterm ${n}, value ${values[n] ?? "blank"}`}
                className={
                  "cell" +
                  cls +
                  (selected.includes(n) ? " selected" : "") +
                  (marks.length ? " grouped" : "")
                }
                key={n}
                onClick={() => onCell?.(n)}
              >
                <span>{values[n] ?? "·"}</span>
                {marks.length > 0 && (
                  <span
                    className="group-markers"
                    aria-label={`In group ${marks.map((i) => i + 1).join(", ")}`}
                  >
                    {marks.map((i) => (
                      <i className={`group-marker group-${i % 4}`} key={i}>
                        {i + 1}
                      </i>
                    ))}
                  </span>
                )}
                {showMinterms && <small>m{n}</small>}
              </button>
            );
          }),
        ])}
      </div>
    </div>
  );
}
