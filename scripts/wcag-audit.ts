import { getContrastRatio, wcagGrade } from "../src/lib/utils/colorUtils";

const bg = "#1F0F08";
const cocoa = "#2A1810";
const pairs: [string, string, string][] = [
  ["Cream on deep", "#FFF4E3", bg],
  ["Cream on cocoa", "#FFF4E3", cocoa],
  ["Tan on deep", "#D0BEA5", bg],
  ["Tan/60 on deep", "#8A7D6D", bg],
  ["Gold on deep", "#C9A961", bg],
  ["Deep on tan pill", "#3B2114", "#D0BEA5"],
  ["Green badge", "#A8C896", bg],
  ["Red helper", "#E89178", bg],
  ["Cream/65 on deep", "#9D9689", bg],
];

for (const [label, fg, b] of pairs) {
  const r = getContrastRatio(fg, b);
  const g = wcagGrade(r);
  console.log(label.padEnd(26), r.toString().padStart(6), g);
}
