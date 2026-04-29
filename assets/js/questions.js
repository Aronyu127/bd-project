// ===================================================
// 起始頁問答題設定 — 答對才能進入遊戲
// ===================================================

const START_QUESTIONS = [
  {
    question: "🕰️ 過去｜我們第一次一起看煙火的地方？",
    answer: "秀朗追風河濱公園",          // 不分大小寫、允許前後空白
    placeholder: "????????",
    errorMsg: "答錯囉，再想想 可以參考google map 的名稱",
  },
  {
    question: "📍 現在｜4/30當天的住宿地點是?",
    answer: "凱撒趣淘漫旅-台南",           // 答案格式需與 placeholder 一致
    placeholder: "??????-??",
    errorMsg: "答錯囉，再想想 附近有個水庫喔",
  },
];

// ===================================================
// 題目資料 - 可在此自訂所有題目內容
// ===================================================

const TEST_IMAGE = "assets/images/questions/test-q40.jpg";

const QUESTIONS = [
  {
    id: 1,
    text: "在白馬一起買的貼紙除了chill out外 另一張寫了什麼?",
    image: "assets/images/questions/q01-q40.jpg",
    options: ["ㄧ刻入魂", "ㄧ魂入滑", "一生懸命", "ㄧ滑入魂"],
    answer: 3,
  },
  {
    id: 2,
    text: "最會做披薩的小高，食材也堆得小高的的餐廳是在?",
    image: "assets/images/questions/q02-q40.jpg",
    options: ["Hotel Green Plaza Hakuba", "Hotel Monterey Hakuba", "Hotel Choya", "Hotel Hoshino Resort Hakuba"],
    answer: 0,
  },
  {
    id: 3,
    text: "我們一起在巴厘島便利商店買的神秘飲料，喝起來的口感最像什麼？",
    image: "assets/images/questions/q03-q40.jpg",
    options: ["可樂", "紅茶", "綠茶", "奶茶"],
    answer: 1,
  },
  {
    id: 4,
    text: "跳島旅行拍了很多美照的一天，這天我們去的島叫什麼?",
    image: "assets/images/questions/q04-q40.jpg",
    options: ["巴釐島", "峇里島", "帕尼達島", "龍目島"],
    answer: 2,
  },
  {
    id: 5,
    text: "第一次帶珠寶一起看大型的喜劇演出，當時我們看的表演是？",
    image: 'assets/images/questions/q05-q40.jpg',
    options: ["炎上王世堅", "炎上炎亞倫", "炎上曾博恩", "炎上煉獄杏壽郎"],
    answer: 2,
  },
  {
    id: 6,
    text: "一起去玩魔鬼的計謀的那天，經過一輪激烈的競爭，最後贏的是？",
    image: "assets/images/questions/q06-q40.jpg",
    options: ["Aron", "Karen", "Aron他哥", "Aron他妹"],
    answer: 3,
  },
  {
    id: 7,
    text: "第一次跟珠寶一起玩雷射槍戰，那天的日期是？",
    image: "assets/images/questions/q07-q40.jpg",
    options: ["2025/12/25", "2025/12/26", "2025/12/27", "2025/12/28"],
    answer: 2,
  },
  {
    id: 8,
    text: "在飯店慶祝時巧遇喜劇大師，請問這間飯店是哪間?",
    image: "assets/images/questions/q08-q40.jpg",
    options: ["大倉久和飯店", "晶華酒店", "凱悅酒店", "喜來登酒店"],
    answer: 0,
  },
  {
    id: 9,
    text: "喜歡牛奶的人，這天吃喝得很開心，請問這天我們去哪裡玩?",
    image: "assets/images/questions/q09-q40.jpg",
    options: ["宮古島", "石垣島", "沖繩", "鹿兒島"],
    answer: 1,
  },
  {
    id: 10,
    text: "帶鹹蛋超人去吃海鮮大餐，這裡是哪裡？",
    image: 'assets/images/questions/q10-q40.jpg',
    options: ["基隆", "宜蘭", "釜山", "東京"],
    answer: 2,
  },
  {
    id: 11,
    text: "萬聖節一起扮成中文怪物，請問參賽者美食高左手拿的是什麼食物?",
    image: "assets/images/questions/q11-q40.jpg",
    options: ["蘋果", "包子", "蘿蔔糕", "柚子"],
    answer: 3,
  },
  {
    id: 12,
    text: "最支持我的寶貝來看我的表演，請問這天演出的檢察官名字是？",
    image: "assets/images/questions/q12-q40.jpg",
    options: ["肯德基", "山達基", "愛斯機", "艾斯基"],
    answer: 3,
  },
  {
    id: 13,
    text: "請問這間有紅色比基尼辣妹出沒的酒吧，叫什麼？",
    image: "assets/images/questions/q13-q40.jpg",
    options: ["Rock Bar", "FINS", "Atlas Beach Bar", "FINNS"],
    answer: 3,
  },
  {
    id: 14,
    text: "有吃有喝玩SUP還有人釣了很多魚的一天，請問我們身後的島是？",
    image: "assets/images/questions/q14-q40.jpg",
    options: ["蘭嶼", "龜山島", "基隆嶼", "綠島"],
    answer: 2,
  },
  {
    id: 15,
    text: "TBW來看知性高開場，這天是幾月幾號？",
    image: "assets/images/questions/q15-q40.jpg",
    options: ["2025/09/01", "2025/09/02", "2025/09/03", "2025/09/04"],
    answer: 3,
  },
  {
    id: 16,
    text: "收到花很開心的人，請問這張照片的拍攝地點是在台北哪區？",
    image: "assets/images/questions/q16-q40.jpg",
    options: ["新店", "大安", "內湖", "信義"],
    answer: 1,
  },
  {
    id: 17,
    text: "最喜歡跟你一起看煙火了，我們一起看了好多好多場，請問圖中的煙火是哪ㄧ場?",
    image: "assets/images/questions/q17-q40.jpg",
    options: ["大稻埕煙火", "白馬八方尾根煙火", "台北101煙火", "淡水漁人碼頭煙火"],
    answer: 3,
  },
  {
    id: 18,
    text: "排隊排了很久的樂事豐收日，當天我們兩個加起來共採收了幾顆馬鈴薯？",
    image: "assets/images/questions/q18-q40.jpg",
    options: ["0", "1", "2", "3"],
    answer: 1,
  },
  {
    id: 19,
    text: "去太平山莊遇到道路崩塌，為什麼我們這天在崩塌之前沒有來得及去走步道呢？",
    image: "assets/images/questions/q19-q40.jpg",
    options: ["下雨", "太累", "走了別的道", "本來就沒有規劃步道行程"],
    answer: 2,
  },
  {
    // 第 20 題：最終挑戰題
    id: 20,
    text: "生日快樂～ 請問去年你自己做的香水你幫他取名叫什麼？",
    image: "assets/images/questions/q20-q40.jpg",
    options: ["AROK.425", "AROK", "Blue spring mom mom", "AROK.428"],
    answer: 0,
    isFinal: true,
  },
];

// ===================================================
// 獎品資料 - 可在此自訂獎品名稱與門檻
// ===================================================

const PRIZE_PLACEHOLDER = "assets/images/questions/prize-placeholder-q40.jpg";
const PRIZE_IMAGE_1 = "assets/images/gift/gift-1-q40.jpg";
const PRIZE_IMAGE_2 = "assets/images/gift/gift-2-q40.jpg";
const PRIZE_IMAGE_3 = "assets/images/gift/gift-3-q40.jpg";
const PRIZE_IMAGE_4 = "assets/images/gift/gift-4-q40.jpg";
const PRIZE_IMAGE_5 = "assets/images/gift/gift-5-q40.jpg";

const PRIZES = [
  { stage: 1, threshold: 400, name: "參加獎：滑雪版套乙組", icon: "🎿", image: PRIZE_IMAGE_1, message: "恭喜你獲得 “預料之中的參加獎”，獎品好像似曾相似，畢竟是預料中的嘛😉" },
  { stage: 2, threshold: 1000, name: "銅賞：台南之旅延長一天", icon: "🧳", image: PRIZE_IMAGE_3, message: "唉呦 還可以嘛，幫你加碼台南之旅升級多一天" },
  { stage: 3, threshold: 1800, name: "銀賞：情侶慢跑鞋乙雙", icon: "👟", image: PRIZE_IMAGE_2, message: "什麼？ 我承認你有點超出預料，運動甜心之後穿上這雙鞋一起去跑步吧" },
  { stage: 4, threshold: 2800, name: "金賞：台東九天八夜之旅機加酒", icon: "✈️", image: PRIZE_IMAGE_4, message: "哇 太猛了吧！！ 看來我們的回憶你都有記得 獎品就是一起再創造更多回憶吧💕" },
  { stage: 5, threshold: 4000, name: "大獎：同居邀請函", icon: "💌", image: "", message: "恭喜你獲得最終大獎，不知道重試了幾次，但妳還是堅持了下來，謝謝妳的堅持，未來也不要忘記妳填的答案喔" },
];

const RETRY_CONDITIONS = [
  "回答真心誠意的答案後，可以重試本輪答錯的題目。",
];

const RETRY_GATE_QUESTIONS = [
  {
    question: "在未來的日子裡，你願意跟我一起為不吵架而努力，並且在吵架時願意先停一下，深呼吸三口氣後一起好好溝通嗎？",
    answer: "我願意",
    placeholder: "我願意",
    errorMsg: "😢",
  },
  {
    question: "當吵架發生時，如果有一方已經願意道歉並且提出解決方式，另ㄧ方也要提出自己可以做更好的地方，讓我們一起努力更好，好嗎？",
    answer: "好",
    placeholder: "好",
    errorMsg: "😢",
  },
];

const GRAND_PRIZE_LETTER = {
  image: PRIZE_IMAGE_5,
  title: "給妳的同居邀請函",
  subtitle: "To Karen, with all my love",
  content: `嗨，這封信是我想親手交給妳的邀請。

謝謝妳陪我走過每一段日常、每一次旅行，也謝謝妳一直都在。
如果妳願意，我想邀請妳和我一起，把未來的平凡日子變成我們的小冒險。

妳願意收下這份邀請，跟我一起開始一起生活嗎？`,
  sign: "Aron",
};
