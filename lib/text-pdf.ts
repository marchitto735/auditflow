function toPdfText(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/—/g, "-")
    .replace(/–/g, "-")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[^\x20-\x7E]/g, " ");
}

function wrapLine(line: string, width: number) {
  if (line.length === 0) return [""];
  const rows: string[] = [];
  let rest = line;
  while (rest.length > width) {
    let cut = rest.lastIndexOf(" ", width);
    if (cut < 24) cut = width;
    rows.push(rest.slice(0, cut).trimEnd());
    rest = rest.slice(cut).trimStart();
  }
  rows.push(rest);
  return rows;
}

/** Single-font PDF that keeps every source line, in order, across pages. */
export function textToPdfBlob(source: string) {
  const wrapped = source.split("\n").flatMap((line) => wrapLine(line, 88));
  const linesPerPage = 46;
  const pages: string[][] = [];
  for (let index = 0; index < wrapped.length; index += linesPerPage) {
    pages.push(wrapped.slice(index, index + linesPerPage));
  }
  if (pages.length === 0) pages.push([""]);

  const objects: string[] = [];
  objects.push("<< /Type /Catalog /Pages 2 0 R >>");

  const pageObjectIds: number[] = [];
  const fontId = 3;
  objects.push("");
  objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");

  pages.forEach((pageLines, pageIndex) => {
    const contentId = 4 + pageIndex * 2;
    const pageId = contentId + 1;
    pageObjectIds.push(pageId);
    const commands = ["BT", "/F1 10 Tf", "54 750 Td", "14 TL"];
    pageLines.forEach((line, lineIndex) => {
      if (lineIndex > 0) commands.push("T*");
      commands.push(`(${toPdfText(line)}) Tj`);
    });
    commands.push("ET");
    const stream = commands.join("\n");
    objects.push(
      `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    );
    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents ${contentId} 0 R /Resources << /Font << /F1 ${fontId} 0 R >> >> >>`,
    );
  });

  objects[1] = `<< /Type /Pages /Count ${pages.length} /Kids [${pageObjectIds
    .map((id) => `${id} 0 R`)
    .join(" ")}] >>`;

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (let index = 1; index < offsets.length; index += 1) {
    pdf += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;

  return new Blob([pdf], { type: "application/pdf" });
}
