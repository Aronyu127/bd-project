// ===================================================
// 起始頁問答題設定 — 答對才能進入遊戲
// ===================================================

const START_QUESTIONS = [
  {
    question: "妳叫什麼名字？",
    answer: "高靖婷",          // 不分大小寫、允許前後空白
    placeholder: "請輸入答案",
    errorMsg: "答錯囉，再想想 💕",
  },
  {
    question: "妳的生日是幾月幾號？（格式：MM/DD）",
    answer: "04/30",           // 答案格式需與 placeholder 一致
    placeholder: "例如 04/30",
    errorMsg: "答錯囉，再想想 🎂",
  },
];

// ===================================================
// 題目資料 - 可在此自訂所有題目內容
// ===================================================

const TEST_IMAGE = "https://lh3.googleusercontent.com/pw/AP1GczM5aJ6UdCCb44bJLi565uQQkS_RpaOPPnNaBhmn1JzdupYXBS9rCFD6oCyKUD9ISj1B8Ay2tPn2CWlX-ubV4FCGpW9WaIBc7h0hqsNDa8Ogej8zs8s3-z_9poS_pRICqnjJuIX0LCvToOAQAyUj8Kcj=w830-h1476-s-no-gm?authuser=0";

const QUESTIONS = [
  {
    id: 1,
    text: "我們一起在白馬買的貼紙上面寫什麼？",
    image: "https://i.ibb.co/RpfmFW8T/IMG-4429.jpg",
    options: ["ㄧ刻入魂", "ㄧ魂入滑", "一生懸命", "ㄧ滑入魂"],
    answer: 3,
  },
  {
    id: 2,
    text: "這天吃自助披薩的餐廳地點在?",
    image: "https://i.ibb.co/spxjxXKS/IMG-4406.jpg",
    options: ["Hotel Green Plaza Hakuba", "Hotel Monterey Hakuba", "Hotel Choya", "Hotel Hoshino Resort Hakuba"],
    answer: 0,
  },
  {
    id: 3,
    text: "圖中的飲料我喝完後覺得最像以下哪種飲料?",
    image: "https://i.ibb.co/23px8HPm/IMG-2047.jpg",
    options: ["可樂", "紅茶", "綠茶", "奶茶"],
    answer: 1,
  },
  {
    id: 4,
    text: "我們這天去的島嶼名稱為?",
    image: "https://i.ibb.co/23c43sW8/IMG-4404.jpg",
    options: ["巴釐島", "峇里島", "帕尼達島", "龍目島"],
    answer: 2,
  },
  {
    id: 5,
    text: "跟小楊他們這天看的演出名稱為？",
    image: 'https://i.ibb.co/4RMmMJ58/IMG-9493.jpg',
    options: ["炎上王世堅", "炎上炎亞倫", "炎上曾博恩", "炎上煉獄杏壽郎"],
    answer: 2,
  },
  {
    id: 6,
    text: "這天玩遊戲獲得冠軍的人是？",
    image: "https://i.ibb.co/fzbgkK46/IMG-3733.jpg",
    options: ["Aron 他哥", "Aron 他妹", "Aron 他爸", "Aron 他媽"],
    answer: 1,
  },
  {
    id: 7,
    text: "玩雷射槍戰的那天日期是？",
    image: "https://i.ibb.co/S4RhMMwr/IMG-8056.jpg",
    options: ["2025/12/25", "2025/12/26", "2025/12/27", "2025/12/28"],
    answer: 2,
  },
  {
    id: 8,
    text: "跟王世堅一起拍照的飯店名稱為?",
    image: "https://i.ibb.co/cSCS2cqL/4-F63-AA91-7-D18-484-A-879-F-8-E1-CA0964-CB1.jpg",
    options: ["大倉久和飯店", "晶華酒店", "凱悅酒店", "喜來登酒店"],
    answer: 0,
  },
  {
    id: 9,
    text: "這張照片的拍攝地點為？",
    image: "https://i.ibb.co/8n1VXfFV/IMG-7116.jpg",
    options: ["宮古島", "石垣島", "沖繩", "鹿兒島"],
    answer: 1,
  },
  {
    id: 10,
    text: "這張照片的拍攝地點為？",
    image: 'https://i.ibb.co/3m5kF7zg/IMG-2787.jpg',
    options: ["基隆", "宜蘭", "釜山", "東京"],
    answer: 2,
  },
  {
    id: 11,
    text: "中文怪物凱倫左手拿的是什麼?",
    image: "https://i.ibb.co/DP18Y9rd/IMG-2583.jpg",
    options: ["蘋果", "包子", "蘿蔔糕", "柚子"],
    answer: 3,
  },
  {
    id: 12,
    text: "請問檢察官的角色名稱為?",
    image: "https://i.ibb.co/cSQ5wVhD/86340655-3-C27-4-E36-BE8-D-3-EE704-F76-F09.jpg",
    options: ["肯德基", "山達基", "愛斯機", "艾斯基"],
    answer: 3,
  },
  {
    id: 13,
    text: "圖片中的酒吧名稱為",
    image: "https://i.ibb.co/gLdk5pMX/IMG-2033.jpg",
    options: ["Rock Bar", "FINS", "Atlas Beach Bar", "FINNS"],
    answer: 3,
  },
  {
    id: 14,
    text: "圖中背景的島嶼名稱為?",
    image: "https://i.ibb.co/Fq5F3Lz0/fxn-2025-07-09-132019-936.jpg",
    options: ["蘭嶼", "龜山島", "基隆嶼", "綠島"],
    answer: 2,
  },
  {
    id: 15,
    text: "第二次TBW終於有趕上來看凱倫開場了，這天是哪一天？",
    image: "https://i.ibb.co/qYmb43Pw/IMG-1911.jpg",
    options: ["2025/09/01", "2025/09/02", "2025/09/03", "2025/09/04"],
    answer: 3,
  },
  {
    id: 16,
    text: "照片的拍攝地點為?",
    image: "https://i.ibb.co/XZ6B3Z6L/IMG-1828.jpg",
    options: ["新店", "大安", "內湖", "信義"],
    answer: 1,
  },
  {
    id: 17,
    text: "圖中的煙火為哪ㄧ場?",
    image: "https://i.ibb.co/RkSwt971/IMG-1761.jpg",
    options: ["大稻埕煙火", "白馬八方尾根煙火", "台北101煙火", "淡水漁人碼頭煙火"],
    answer: 3,
  },
  {
    id: 18,
    text: "我們當天實際跳起來採收的樂事有幾箱？",
    image: "https://i.ibb.co/ycdkq36R/IMG-1832.jpg",
    options: ["6", "5", "4", "3"],
    answer: 2,
  },
  {
    id: 19,
    text: "為什麼我們這天沒有來得及在崩塌之前去走步道？",
    image: "https://i.ibb.co/W49DfR7F/IMG-6273.jpg",
    options: ["下雨", "太累", "😳", "本來就沒有規劃步道行程"],
    answer: 2,
  },
  {
    // 第 20 題：最終挑戰題
    id: 20,
    text: "你那天做的香水叫什麼名字？",
    image: "https://i.ibb.co/5W0XRv4Z/IMG-0889.jpg",
    options: ["AROK.425", "AROK", "Blue spring mom mom", "AROK.428"],
    answer: 0,
    isFinal: true,
  },
];

// ===================================================
// 獎品資料 - 可在此自訂獎品名稱與門檻
// ===================================================

const PRIZE_PLACEHOLDER = "https://placehold.co/80x80/ffb6c1/ffffff?text=🎁";

const PRIZES = [
  { stage: 1, threshold: 500, name: "參加獎：滑雪版套乙組", icon: "🎿", image: PRIZE_PLACEHOLDER, message: "太棒了！參加獎解鎖，滑雪版套乙組送給妳！" },
  { stage: 2, threshold: 1200, name: "銅賞：知名品牌慢跑鞋乙雙", icon: "👟", image: PRIZE_PLACEHOLDER, message: "太強了！銅賞到手，知名品牌慢跑鞋乙雙是妳的了！" },
  { stage: 3, threshold: 1800, name: "銀賞：台南之旅加碼一天一夜", icon: "🧳", image: PRIZE_PLACEHOLDER, message: "太棒了！銀賞解鎖，台南之旅加碼一天一夜，我們多待一晚吧！" },
  { stage: 4, threshold: 2500, name: "金賞：台東九天八夜之旅機加酒", icon: "✈️", image: PRIZE_PLACEHOLDER, message: "厲害！金賞是台東九天八夜機加酒，行程交給我來排！" },
  { stage: 5, threshold: 4000, name: "大獎：同居邀請函", icon: "💌", image: PRIZE_PLACEHOLDER, message: "恭喜妳拿下最終大獎！這封同居邀請函，是給妳最認真的下一步。" },
];

const RETRY_CONDITIONS = [
  "重新作答會清空本回合積分、連擊與答題紀錄，並從第 1 題重新開始。",
  "重新作答不會清除壽星姓名；若需改姓名請使用下方「再挑戰一次」回到登入頁。",
  "最終大獎門檻等於「題題答對且連擊加成」的滿分積分；未達滿分時大獎維持鎖定。",
  "獎品實際兌換需配合主辦人安排，遊戲結果僅為慶祝互動用途。",
];
