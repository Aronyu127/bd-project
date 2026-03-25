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
    answer: "04/22",           // 答案格式需與 placeholder 一致
    placeholder: "例如 04/22",
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
    text: "我們第一次見面是在哪裡？",
    image: TEST_IMAGE,
    options: ["咖啡廳", "圖書館", "朋友聚會", "網路上"],
    answer: 0,
  },
  {
    id: 2,
    text: "我最喜歡吃的食物是？",
    image: TEST_IMAGE,
    options: ["壽司", "拉麵", "義大利麵", "牛排"],
    answer: 0,
  },
  {
    id: 3,
    text: "我最常掛在嘴邊的口頭禪是？",
    image: TEST_IMAGE,
    options: ["沒有啦", "好啦好啦", "隨便你", "就是說嘛"],
    answer: 0,
  },
  {
    id: 4,
    text: "我的星座是？",
    image: TEST_IMAGE,
    options: ["天蠍座", "射手座", "摩羯座", "水瓶座"],
    answer: 0,
  },
  {
    id: 5,
    text: "我最喜歡的飲料是？",
    image: TEST_IMAGE,
    options: ["黑糖珍奶", "四季春", "柳橙汁", "可樂"],
    answer: 0,
  },
  {
    id: 6,
    text: "我最討厭的事情是？",
    image: TEST_IMAGE,
    options: ["等人", "吵架", "睡不著", "堵車"],
    answer: 0,
  },
  {
    id: 7,
    text: "我最喜歡的季節是？",
    image: TEST_IMAGE,
    options: ["春天", "夏天", "秋天", "冬天"],
    answer: 0,
  },
  {
    id: 8,
    text: "如果可以出國旅遊，我最想去哪裡？",
    image: TEST_IMAGE,
    options: ["日本", "韓國", "歐洲", "東南亞"],
    answer: 0,
  },
  {
    id: 9,
    text: "我最喜歡的電影類型是？",
    image: TEST_IMAGE,
    options: ["愛情片", "恐怖片", "動作片", "動畫片"],
    answer: 0,
  },
  {
    id: 10,
    text: "我通常幾點睡覺？",
    image: TEST_IMAGE,
    options: ["10 點前", "11 點左右", "12 點左右", "凌晨 1 點以後"],
    answer: 0,
  },
  {
    id: 11,
    text: "我最常滑的社群媒體是？",
    image: TEST_IMAGE,
    options: ["Instagram", "Facebook", "TikTok", "Twitter"],
    answer: 0,
  },
  {
    id: 12,
    text: "我的生日是哪個月份？",
    image: TEST_IMAGE,
    options: ["3 月", "4 月", "5 月", "6 月"],
    answer: 0,
  },
  {
    id: 13,
    text: "我最喜歡的甜點是？",
    image: TEST_IMAGE,
    options: ["提拉米蘇", "草莓蛋糕", "布丁", "馬卡龍"],
    answer: 0,
  },
  {
    id: 14,
    text: "我最喜歡的運動是？",
    image: TEST_IMAGE,
    options: ["游泳", "瑜珈", "慢跑", "不喜歡運動"],
    answer: 0,
  },
  {
    id: 15,
    text: "我心情不好的時候最想做什麼？",
    image: TEST_IMAGE,
    options: ["獨處", "找人說話", "吃東西", "睡覺"],
    answer: 0,
  },
  {
    id: 16,
    text: "我最喜歡的花是？",
    image: TEST_IMAGE,
    options: ["玫瑰", "向日葵", "薰衣草", "鬱金香"],
    answer: 0,
  },
  {
    id: 17,
    text: "我覺得約會最重要的是？",
    image: TEST_IMAGE,
    options: ["去哪裡", "吃什麼", "在一起的感覺", "拍好看的照片"],
    answer: 0,
  },
  {
    id: 18,
    text: "我最喜歡的顏色是？",
    image: TEST_IMAGE,
    options: ["粉色", "白色", "紫色", "米色"],
    answer: 0,
  },
  {
    id: 19,
    text: "描述我的個性，哪個最準？",
    image: TEST_IMAGE,
    options: ["外向開朗", "溫柔體貼", "獨立自主", "天真可愛"],
    answer: 0,
  },
  {
    // 第 20 題：最終挑戰題
    id: 20,
    text: "我最愛妳的什麼？",
    image: TEST_IMAGE,
    options: ["妳的笑容", "妳的溫柔", "妳的全部", "妳的眼睛"],
    answer: 0,
    isFinal: true,
  },
];

// ===================================================
// 獎品資料 - 可在此自訂獎品名稱與門檻
// ===================================================

const PRIZE_PLACEHOLDER = "https://placehold.co/80x80/ffb6c1/ffffff?text=🎁";

const PRIZES = [
  { stage: 1, threshold: 300,  name: "愛心早餐",          icon: "🍳", image: PRIZE_PLACEHOLDER, message: "太棒了！妳贏到了第一份獎品，我會親手幫妳做一頓愛心早餐！" },
  { stage: 2, threshold: 700,  name: "電影之夜",           icon: "🎬", image: PRIZE_PLACEHOLDER, message: "厲害！下一份獎品解鎖了，一起窩在沙發上看電影吧！" },
  { stage: 3, threshold: 1200, name: "甜點下午茶",         icon: "🍰", image: PRIZE_PLACEHOLDER, message: "太強了！讓我帶妳去吃最喜歡的甜點吧！" },
  { stage: 4, threshold: 1800, name: "驚喜約會日",         icon: "💝", image: PRIZE_PLACEHOLDER, message: "哇！妳解鎖了一個我精心安排的驚喜約會！" },
  { stage: 5, threshold: 2500, name: "購物基金 500",       icon: "🛍️", image: PRIZE_PLACEHOLDER, message: "超厲害！500 元購物基金隨妳花，妳決定！" },
  { stage: 6, threshold: 3500, name: "生日大獎：旅行計畫", icon: "✈️", image: PRIZE_PLACEHOLDER, message: "恭喜妳拿下最終大獎！讓我們一起去旅行！目的地由妳來選！" },
];
