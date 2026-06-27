import type { EquipmentCategory } from "./types";

export const EQUIPMENT_CATEGORIES: EquipmentCategory[] = [
  {
    id: "freeweight",
    title: "프리웨이트",
    description: "바벨, 덤벨 등 자유 중량 기구를 선택해 주세요.",
    items: [
      { id: "바벨", name: "바벨" },
      { id: "덤벨", name: "덤벨" },
      { id: "케틀벨", name: "케틀벨" },
    ],
  },
  {
    id: "machine",
    title: "머신 / 케이블",
    description: "헬스장 머신 및 케이블 기구를 선택해 주세요.",
    items: [
      { id: "레그프레스", name: "레그프레스" },
      { id: "레그컬", name: "레그컬" },
      { id: "레그익스텐션", name: "레그 익스텐션" },
      { id: "체스트프레스", name: "체스트프레스" },
      { id: "랫풀다운", name: "랫풀다운" },
      { id: "케이블크로스오버", name: "케이블 크로스오버" },
      { id: "스미스머신", name: "스미스머신" },
      { id: "시티드로우", name: "시티드 로우" },
      { id: "펙덱플라이", name: "펙덱 플라이" },
    ],
  },
  {
    id: "bodyweight",
    title: "맨몸 / 기타",
    description: "맨몸 운동 및 기타 장비를 선택해 주세요.",
    items: [
      { id: "풀업바", name: "풀업바" },
      { id: "벤치", name: "벤치" },
      { id: "요가매트", name: "요가매트" },
      { id: "밴드", name: "밴드" },
    ],
  },
];

export const ALL_EQUIPMENT_IDS = EQUIPMENT_CATEGORIES.flatMap((category) =>
  category.items.map((item) => item.id),
);
