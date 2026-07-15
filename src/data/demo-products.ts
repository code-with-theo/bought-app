import type { ProductRecord } from "@/types/product";

const svgDataUrl = (svg: string): string => {
  const bytes = new TextEncoder().encode(svg);
  let binary = "";
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return `data:image/svg+xml;base64,${btoa(binary)}`;
};

const placeholder = (label: string, color: string) => ({
  dataUrl: svgDataUrl(`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800"><rect width="100%" height="100%" fill="${color}"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="white" font-family="sans-serif" font-size="68">${label}</text></svg>`),
  mimeType: "image/png" as const,
  width: 800,
  height: 800,
});

const date = "2026-07-15T08:00:00.000Z";

export const demoProducts: ProductRecord[] = [
  { id: "demo-yogurt", name: "桂花酒酿酸奶", brand: "简爱", image: placeholder("酸奶", "#D89B78"), category: "food", price: 8.9, purchaseDate: "2026-07-10", purchaseChannel: "盒马", usageStatus: "finished", rating: 5, repurchaseDecision: "repurchase", review: "桂花香很温柔，早上喝正合适。", tags: ["好喝", "会回购"], isDemo: true, createdAt: date, updatedAt: date },
  { id: "demo-snack", name: "海盐巴旦木", brand: "三只松鼠", image: placeholder("零食", "#B99263"), category: "food", price: 29.9, purchaseDate: "2026-07-08", purchaseChannel: "天猫", usageStatus: "using", rating: 4, repurchaseDecision: "repurchase", review: "脆是脆，就是一不小心吃太多。", tags: ["性价比高"], isDemo: true, createdAt: date, updatedAt: date },
  { id: "demo-cardigan", name: "燕麦色针织开衫", brand: "优衣库", image: placeholder("开衫", "#9B826C"), category: "clothing", price: 199, purchaseDate: "2026-06-29", purchaseChannel: "线下门店", usageStatus: "using", rating: 4, repurchaseDecision: "undecided", review: "版型显精神，洗后再看看。", tags: ["颜值高"], isDemo: true, createdAt: date, updatedAt: date },
  { id: "demo-serum", name: "玻尿酸修护精华", brand: "珂润", image: placeholder("精华", "#9CAC9C"), category: "beauty", price: 168, purchaseDate: "2026-06-18", purchaseChannel: "京东", usageStatus: "using", rating: 5, repurchaseDecision: "repurchase", review: "换季泛红时用着很安心。", tags: ["好用"], isDemo: true, createdAt: date, updatedAt: date },
  { id: "demo-shampoo", name: "茶籽净屑洗发水", brand: "阿道夫", image: placeholder("洗发", "#718477"), category: "beauty", price: 79, purchaseDate: "2026-06-11", purchaseChannel: "抖音商城", usageStatus: "using", rating: 2, repurchaseDecision: "avoid", review: "香味太浓，头皮也有点干。", tags: ["不舒服"], isDemo: true, createdAt: date, updatedAt: date },
  { id: "demo-cleaner", name: "柚子多用途清洁剂", brand: "花王", image: placeholder("清洁", "#83A9A0"), category: "household", price: 35.9, purchaseDate: "2026-06-04", purchaseChannel: "山姆", usageStatus: "finished", rating: 3, repurchaseDecision: "undecided", review: "去油够用，味道一般。", tags: [], isDemo: true, createdAt: date, updatedAt: date },
  { id: "demo-cable", name: "编织 Type-C 数据线", brand: "绿联", image: placeholder("数码", "#727D92"), category: "digital", price: 39.9, purchaseDate: "2026-05-26", purchaseChannel: "京东", usageStatus: "unused", rating: null, repurchaseDecision: "undecided", review: "", tags: [], isDemo: true, createdAt: date, updatedAt: date },
];
