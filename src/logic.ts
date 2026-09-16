export type Variables = 2 | 3 | 4;
export const gray = ["00", "01", "11", "10"];
export const bits = (n: number, count: number) =>
  n.toString(2).padStart(count, "0");
export const makeProblem = (count: Variables, type: "truth" | "minterms") => {
  const total = 2 ** count;
  let mins: number[] = [];
  while (mins.length < 2 || mins.length > total - 2)
    mins = Array.from({ length: total }, (_, i) => i).filter(
      () => Math.random() > 0.48,
    );
  return { id: Date.now(), count, type, minterms: mins };
};
export const coords = (
  n: number,
  orientation: "wide" | "tall",
  count: Variables,
): [number, number] => {
  const b = bits(n, count);
  if (count === 2) return [Number(b[0]), Number(b[1])];
  if (count === 3 && orientation === "wide")
    return [Number(b[2]), gray.indexOf(b.slice(0, 2))];
  if (count === 3) return [gray.indexOf(b.slice(1)), Number(b[0])];
  return [gray.indexOf(b.slice(0, 2)), gray.indexOf(b.slice(2))];
};
export const dimensions = (count: Variables, orientation: "wide" | "tall") =>
  count === 2
    ? [2, 2]
    : count === 3
      ? orientation === "wide"
        ? [2, 4]
        : [4, 2]
      : [4, 4];
export const orderedCells = (
  count: Variables,
  orientation: "wide" | "tall",
) => {
  const [rows, cols] = dimensions(count, orientation);
  const out: number[][] = Array.from({ length: rows }, () =>
    Array(cols).fill(0),
  );
  for (let n = 0; n < 2 ** count; n++) {
    const [r, c] = coords(n, orientation, count);
    out[r][c] = n;
  }
  return out;
};
const power2 = (n: number) => n > 0 && (n & (n - 1)) === 0;
export function validateGroup(
  selection: number[],
  count: Variables,
  mins: number[],
  orientation: "wide" | "tall",
): { ok: boolean; message: string; term?: string } {
  if (!selection.length)
    return { ok: false, message: "Select one or more 1-cells first." };
  if (!power2(selection.length))
    return {
      ok: false,
      message: `A group of ${selection.length} is not allowed. Groups must contain 1, 2, 4, 8… cells.`,
    };
  if (selection.some((n) => !mins.includes(n)))
    return {
      ok: false,
      message:
        "This group includes a 0-cell. For SOP practice, every selected cell must be 1.",
    };
  const [rows, cols] = dimensions(count, orientation);
  const ps = selection.map((n) => coords(n, orientation, count));
  const rs = [...new Set(ps.map((p) => p[0]))],
    cs = [...new Set(ps.map((p) => p[1]))];
  const circular = (vals: number[], size: number) => {
    if (vals.length === size) return true;
    const s = new Set(vals);
    for (let start = 0; start < size; start++) {
      let ok = true;
      for (let k = 0; k < vals.length; k++)
        if (!s.has((start + k) % size)) ok = false;
      if (ok) return true;
    }
    return false;
  };
  if (
    rs.length * cs.length !== selection.length ||
    !circular(rs, rows) ||
    !circular(cs, cols)
  )
    return {
      ok: false,
      message:
        "Groups must form a rectangle. Edges may wrap around, but diagonal cells are not adjacent.",
    };
  const names = "ABCD";
  const bs = selection.map((n) => bits(n, count));
  let term = "";
  for (let i = 0; i < count; i++)
    if (bs.every((b) => b[i] === bs[0][i]))
      term += names[i] + (bs[0][i] === "0" ? "'" : "");
  return {
    ok: true,
    message: `Valid group. Variables that change disappear; the term is ${term || "1"}.`,
    term: term || "1",
  };
}
export const pretty = (s: string) => s.replace(/([A-D])'/g, "$1\u0305");
export function expressionGroups(
  expression: string,
  minterms: number[],
  count: Variables,
) {
  const names = "ABCD".slice(0, count);
  return expression
    .split("+")
    .map((raw) => raw.trim())
    .filter(Boolean)
    .map((term) => {
      const cells = minterms.filter((n) => {
        const value = bits(n, count);
        if (term === "1") return true;
        const literals = term.match(/[A-D]'?/g) || [];
        return literals.every((literal) => {
          const index = names.indexOf(literal[0]);
          return (
            index >= 0 && value[index] === (literal.endsWith("'") ? "0" : "1")
          );
        });
      });
      return { cells, term };
    });
}
export const normalizeExpression = (s: string) =>
  s
    .toUpperCase()
    .replace(/([A-D])\u0305/g, "$1'")
    .replace(/!([A-D])/g, "$1'")
    .replace(/[′’]/g, "'")
    .replace(/\s/g, "")
    .split("+")
    .filter(Boolean)
    .map((t) => {
      const m = t.match(/[A-D]'?/g) || [];
      return m.sort((a, b) => a[0].localeCompare(b[0])).join("");
    })
    .sort()
    .join("+");
export function simplify(minterms: number[], count: Variables): string {
  if (!minterms.length) return "0";
  const max = 2 ** count;
  if (minterms.length === max) return "1";
  type Imp = { pat: string; covers: number[] };
  let current: Imp[] = minterms.map((n) => ({
      pat: bits(n, count),
      covers: [n],
    })),
    primes: Imp[] = [];
  while (current.length) {
    const used = new Set<number>(),
      next: Imp[] = [];
    for (let i = 0; i < current.length; i++)
      for (let j = i + 1; j < current.length; j++) {
        let d = 0,
          p = "";
        for (let k = 0; k < count; k++) {
          if (current[i].pat[k] !== current[j].pat[k]) {
            d++;
            p += "-";
          } else p += current[i].pat[k];
        }
        if (d === 1) {
          used.add(i);
          used.add(j);
          const covers = [
            ...new Set([...current[i].covers, ...current[j].covers]),
          ];
          if (!next.some((x) => x.pat === p)) next.push({ pat: p, covers });
        }
      }
    current.forEach((x, i) => {
      if (!used.has(i) && !primes.some((p) => p.pat === x.pat)) primes.push(x);
    });
    current = next;
  }
  let uncovered = new Set(minterms),
    chosen: Imp[] = [];
  while (uncovered.size) {
    let best = primes
      .filter((p) => p.covers.some((n) => uncovered.has(n)))
      .sort(
        (a, b) =>
          b.covers.filter((n) => uncovered.has(n)).length -
            a.covers.filter((n) => uncovered.has(n)).length ||
          a.pat.replace(/-/g, "").length - b.pat.replace(/-/g, "").length,
      )[0];
    chosen.push(best);
    best.covers.forEach((n) => uncovered.delete(n));
  }
  const names = "ABCD";
  return chosen
    .map((x) =>
      [...x.pat]
        .map((v, i) => (v === "-" ? "" : names[i] + (v === "0" ? "'" : "")))
        .join(""),
    )
    .join(" + ");
}
