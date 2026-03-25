// ===================================================
// 遊戲核心邏輯
// ===================================================

const TIMER_TOTAL = 15;

// 角色狀態配置
const CHARACTER_STATES = {
  calm:         { emoji: "🐱",  text: "加油！" },
  excited:      { emoji: "😸",  text: "太棒了！" },
  superExcited: { emoji: "🥳",  text: "超厲害！！" },
  sad:          { emoji: "😿",  text: "沒關係..." },
  superSad:     { emoji: "😭",  text: "再加油..." },
};

// 連續答對加成
function getStreakBonus(streak) {
  if (streak <= 1) return 0;
  if (streak === 2) return 50;
  if (streak === 3) return 100;
  return 150;
}

// 遊戲狀態
let gameState = {
  playerName: "",
  playerBirthday: "",
  score: 0,
  currentQ: 0,       // 0-based
  streak: 0,
  consecutiveFail: 0,
  unlockedPrizes: [], // array of prize stage numbers
  currentPrize: null, // prize object
  pendingUnlock: null,// prize to show on unlock screen
  isAnswered: false,
  timerInterval: null,
  timerLeft: TIMER_TOTAL,
  startTime: null,
  answerLog: [],
  gameEnded: false,
  // 最後一題彩蛋：第一次答錯給第二次機會
  finalRetried: false,
};

// ===================================================
// 工具函式
// ===================================================

function $(id) { return document.getElementById(id); }

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function formatScore(n) { return n.toLocaleString(); }

// ===================================================
// 起始頁 — 初始化問題標籤 + 驗證答案
// ===================================================

// 把 START_QUESTIONS 的問題文字填入 label
$("label-q1").textContent = START_QUESTIONS[0].question;
$("label-q2").textContent = START_QUESTIONS[1].question;
$("input-q1").placeholder = START_QUESTIONS[0].placeholder;
$("input-q2").placeholder = START_QUESTIONS[1].placeholder;

$("form-start").addEventListener("submit", function(e) {
  e.preventDefault();
  const ans1 = $("input-q1").value.trim();
  const ans2 = $("input-q2").value.trim();
  let valid = true;

  $("error-q1").textContent = "";
  $("error-q2").textContent = "";

  if (ans1.toLowerCase() !== START_QUESTIONS[0].answer.toLowerCase()) {
    $("error-q1").textContent = START_QUESTIONS[0].errorMsg;
    valid = false;
  }
  if (ans2.toLowerCase() !== START_QUESTIONS[1].answer.toLowerCase()) {
    $("error-q2").textContent = START_QUESTIONS[1].errorMsg;
    valid = false;
  }

  if (valid) {
    gameState.playerName = ans1;
    showScreen("screen-intro");
  }
});

// ===================================================
// 說明頁
// ===================================================

$("btn-agree").addEventListener("click", function() {
  gameState.startTime = new Date();
  showScreen("screen-game");
  loadQuestion();
});

// ===================================================
// 遊戲頁 - 載入題目
// ===================================================

function loadQuestion() {
  const q = QUESTIONS[gameState.currentQ];
  gameState.isAnswered = false;

  // 更新側邊欄
  updateSidebar();

  // 最終挑戰題樣式
  const card = $("question-card");
  const badge = $("final-badge");
  if (q.isFinal) {
    card.classList.add("final-question");
    badge.style.display = "block";
  } else {
    card.classList.remove("final-question");
    badge.style.display = "none";
  }

  // 題目圖片
  const imgWrap = $("question-image-wrap");
  const img = $("question-image");
  if (q.image) {
    img.src = q.image;
    imgWrap.style.display = "block";
  } else {
    imgWrap.style.display = "none";
  }

  // 題目文字
  $("question-text").textContent = q.text;

  // 選項按鈕
  const optBtns = document.querySelectorAll(".option-btn");
  optBtns.forEach((btn, i) => {
    btn.textContent = q.options[i];
    btn.className = "option-btn";
    btn.disabled = false;
  });

  // 隱藏回饋區
  const fbArea = $("feedback-area");
  fbArea.style.display = "none";

  // 啟動計時器
  startTimer(q.isFinal);
}

// ===================================================
// 計時器
// ===================================================

function startTimer(isFinal) {
  clearInterval(gameState.timerInterval);
  gameState.timerLeft = TIMER_TOTAL;
  updateTimerDisplay(TIMER_TOTAL, isFinal);

  gameState.timerInterval = setInterval(() => {
    gameState.timerLeft--;
    updateTimerDisplay(gameState.timerLeft, isFinal);

    if (gameState.timerLeft <= 0) {
      clearInterval(gameState.timerInterval);
      if (!gameState.isAnswered) {
        handleAnswer(-1); // -1 = timeout
      }
    }
  }, 1000);
}

function updateTimerDisplay(val, isFinal) {
  $("timer-text").textContent = val;

  // SVG 圓形進度
  const circle = $("timer-circle");
  const circumference = 2 * Math.PI * 15.9;
  const fraction = val / TIMER_TOTAL;
  circle.style.strokeDasharray = `${circumference * fraction} ${circumference}`;

  // 最後 3 秒：緊張效果
  const timerSvg = $("timer-svg");
  const timerText = $("timer-text");
  if (val <= 3) {
    timerSvg.classList.add("timer-urgent");
    timerText.classList.add("timer-urgent-text");
  } else {
    timerSvg.classList.remove("timer-urgent");
    timerText.classList.remove("timer-urgent-text");
  }

  // 最終挑戰題額外效果
  if (isFinal && val <= 5) {
    timerText.classList.add("timer-final-pulse");
  } else {
    timerText.classList.remove("timer-final-pulse");
  }
}

// ===================================================
// 選項點擊
// ===================================================

document.querySelectorAll(".option-btn").forEach(btn => {
  btn.addEventListener("click", function() {
    if (gameState.isAnswered) return;
    const idx = parseInt(this.dataset.index);
    clearInterval(gameState.timerInterval);
    handleAnswer(idx);
  });
});

// ===================================================
// 答題處理
// ===================================================

function handleAnswer(selectedIdx) {
  gameState.isAnswered = true;
  const q = QUESTIONS[gameState.currentQ];
  const isTimeout = selectedIdx === -1;
  const isCorrect = !isTimeout && selectedIdx === q.answer;

  // 最後一題彩蛋：第一次答錯/超時，給第二次機會
  if (q.isFinal && !isCorrect && !gameState.finalRetried) {
    gameState.finalRetried = true;
    showFinalRetryFeedback(isTimeout);
    return;
  }

  // 計算分數
  let baseScore = 0;
  let bonusScore = 0;

  if (isCorrect) {
    baseScore = q.isFinal ? 2000 : 100;
    if (gameState.streak >= 1) {
      bonusScore = getStreakBonus(gameState.streak + 1);
    }
    gameState.streak++;
    gameState.consecutiveFail = 0;
  } else {
    gameState.streak = 0;
    gameState.consecutiveFail++;
  }

  const totalGain = baseScore + bonusScore;
  gameState.score += totalGain;

  // 記錄作答
  gameState.answerLog.push({
    qId: q.id,
    qText: q.text,
    selected: selectedIdx,
    answer: q.answer,
    correct: isCorrect,
    timeout: isTimeout,
    baseScore,
    bonusScore,
    totalScore: gameState.score,
  });

  // 更新選項視覺
  updateOptionVisual(selectedIdx, q.answer, isTimeout);

  // 更新角色狀態
  updateCharacter();

  // 顯示回饋
  showFeedback(isCorrect, isTimeout, baseScore, bonusScore);

  // 更新側邊欄分數
  updateSidebar();

  // 檢查是否解鎖新獎品
  const newPrize = checkPrizeUnlock();

  // 延遲進入下一步
  setTimeout(() => {
    if (newPrize) {
      gameState.pendingUnlock = newPrize;
      showUnlockScreen(newPrize);
    } else {
      advanceGame();
    }
  }, 2200);
}

// 最後一題第二次機會提示
function showFinalRetryFeedback(isTimeout) {
  const fbArea = $("feedback-area");
  fbArea.style.display = "flex";
  $("feedback-icon").textContent = "💫";
  $("feedback-text").textContent = isTimeout
    ? "時間到啦！不過沒關係，再試一次！"
    : "差一點點！再給妳一次機會～";
  $("feedback-score").textContent = "";
  $("feedback-streak").textContent = "";

  // 重新開始計時器
  setTimeout(() => {
    fbArea.style.display = "none";
    const optBtns = document.querySelectorAll(".option-btn");
    optBtns.forEach(btn => {
      btn.className = "option-btn";
      btn.disabled = false;
    });
    gameState.isAnswered = false;
    startTimer(true);
  }, 1800);
}

function updateOptionVisual(selectedIdx, correctIdx, isTimeout) {
  const optBtns = document.querySelectorAll(".option-btn");
  optBtns.forEach((btn, i) => {
    btn.disabled = true;
    if (i === correctIdx) {
      btn.classList.add("correct");
    } else if (i === selectedIdx && !isTimeout) {
      btn.classList.add("wrong");
    }
  });
}

function showFeedback(isCorrect, isTimeout, base, bonus) {
  const fbArea = $("feedback-area");
  fbArea.style.display = "flex";

  if (isTimeout) {
    $("feedback-icon").textContent = "⌛";
    $("feedback-text").textContent = "時間到了！沒關係，繼續加油！";
    $("feedback-score").textContent = "+0 分";
    $("feedback-streak").textContent = "";
  } else if (isCorrect) {
    $("feedback-icon").textContent = "✨";
    $("feedback-text").textContent = "答對了！好厲害！";
    $("feedback-score").textContent = `+${base} 分`;
    $("feedback-streak").textContent = bonus > 0 ? `連擊加成 +${bonus}！` : "";
  } else {
    $("feedback-icon").textContent = "💔";
    $("feedback-text").textContent = "答錯了... 沒關係！";
    $("feedback-score").textContent = "+0 分";
    $("feedback-streak").textContent = "";
  }
}

// ===================================================
// 角色狀態更新
// ===================================================

function updateCharacter() {
  let state;
  if (gameState.streak >= 2) {
    state = CHARACTER_STATES.superExcited;
  } else if (gameState.streak === 1) {
    state = CHARACTER_STATES.excited;
  } else if (gameState.consecutiveFail >= 2) {
    state = CHARACTER_STATES.superSad;
  } else if (gameState.consecutiveFail === 1) {
    state = CHARACTER_STATES.sad;
  } else {
    state = CHARACTER_STATES.calm;
  }
  $("character-emoji").textContent = state.emoji;
  // character-status 已整合到 topbar，以 title 顯示
  $("character-emoji").title = state.text;
}

// ===================================================
// 側邊欄更新
// ===================================================

function updateSidebar() {
  $("display-score").textContent = formatScore(gameState.score);
  $("display-q-num").textContent = gameState.currentQ + 1;
  $("display-streak").textContent = gameState.streak;

  // 當前可兌換獎品
  if (gameState.currentPrize) {
    $("display-current-prize").textContent = `${gameState.currentPrize.icon} ${gameState.currentPrize.name}`;
  } else {
    $("display-current-prize").textContent = "尚未解鎖";
  }

  // 下一個獎品
  const nextPrize = PRIZES.find(p => !gameState.unlockedPrizes.includes(p.stage));
  if (nextPrize) {
    $("display-next-prize").textContent = `${nextPrize.icon} ${nextPrize.name}`;
    $("display-threshold").textContent = `${formatScore(nextPrize.threshold)} 分`;
    // 進度條
    const prevThreshold = gameState.currentPrize ? gameState.currentPrize.threshold : 0;
    const range = nextPrize.threshold - prevThreshold;
    const progress = Math.min(1, (gameState.score - prevThreshold) / range);
    $("progress-bar").style.width = `${Math.max(0, progress * 100)}%`;
  } else {
    $("display-next-prize").textContent = "全部解鎖！🎉";
    $("display-threshold").textContent = "";
    $("progress-bar").style.width = "100%";
  }
}

// ===================================================
// 獎品解鎖檢查
// ===================================================

function checkPrizeUnlock() {
  for (const prize of PRIZES) {
    if (!gameState.unlockedPrizes.includes(prize.stage) && gameState.score >= prize.threshold) {
      gameState.unlockedPrizes.push(prize.stage);
      gameState.currentPrize = prize;
      return prize;
    }
  }
  return null;
}

// ===================================================
// 恭喜解鎖頁
// ===================================================

function showUnlockScreen(prize) {
  const unlockImg = $("unlock-prize-img");
  if (prize.image) {
    unlockImg.src = prize.image;
    unlockImg.style.display = "block";
  } else {
    unlockImg.style.display = "none";
  }
  $("unlock-prize-icon").textContent = prize.icon;
  $("unlock-prize-name").textContent = prize.name;
  $("unlock-score").textContent = formatScore(gameState.score) + " 分";
  $("unlock-message").textContent = prize.message;

  const isMax = gameState.unlockedPrizes.includes(PRIZES[PRIZES.length - 1].stage);
  const continueBtn = $("btn-continue");
  if (isMax) {
    continueBtn.textContent = "前往結算 🎊";
  } else {
    continueBtn.textContent = "繼續挑戰 🎮";
  }

  showScreen("screen-unlock");
  launchConfetti("confetti-container");
}

$("btn-continue").addEventListener("click", function() {
  advanceGame();
});

// ===================================================
// 進入下一題 / 結束遊戲
// ===================================================

function advanceGame() {
  const isMax = gameState.unlockedPrizes.includes(PRIZES[PRIZES.length - 1].stage);
  const isLastQ = gameState.currentQ >= QUESTIONS.length - 1;

  if (isMax || isLastQ) {
    endGame();
    return;
  }

  gameState.currentQ++;
  showScreen("screen-game");
  loadQuestion();
}

// ===================================================
// 結算頁
// ===================================================

function endGame() {
  gameState.gameEnded = true;
  clearInterval(gameState.timerInterval);

  $("result-player-name").textContent = `🎂 ${gameState.playerName}，妳最棒了！`;
  $("result-score").textContent = formatScore(gameState.score);

  // 最終獎品
  const resultImg = $("result-final-prize-img");
  if (gameState.currentPrize) {
    if (gameState.currentPrize.image) {
      resultImg.src = gameState.currentPrize.image;
      resultImg.style.display = "block";
    } else {
      resultImg.style.display = "none";
    }
    $("result-final-prize-icon").textContent = gameState.currentPrize.icon;
    $("result-final-prize-name").textContent = gameState.currentPrize.name;
  } else {
    resultImg.style.display = "none";
    $("result-final-prize-icon").textContent = "💔";
    $("result-final-prize-name").textContent = "這次差一點點，下次一定行！";
  }

  // 已解鎖獎品列表
  const list = $("result-unlocked-list");
  list.innerHTML = "";
  PRIZES.forEach(p => {
    const unlocked = gameState.unlockedPrizes.includes(p.stage);
    const item = document.createElement("div");
    item.className = `unlocked-item ${unlocked ? "" : "locked"}`;
    item.innerHTML = `<span class="unlocked-item-icon">${unlocked ? p.icon : "🔒"}</span><span>${p.name}</span>`;
    list.appendChild(item);
  });

  // 結算文案
  const msg = buildResultMessage();
  $("result-message").innerHTML = msg;

  showScreen("screen-result");
  launchConfetti("confetti-container-result");
}

function buildResultMessage() {
  const name = gameState.playerName;
  const stage = gameState.unlockedPrizes.length;
  if (stage >= 6) {
    return `🎉 恭喜妳完成今天的生日挑戰！妳拿下了所有獎品，這是妳今天親手贏到的生日大禮！希望妳喜歡這份專屬於妳的小遊戲，生日快樂，${name}！💕`;
  } else if (stage >= 4) {
    return `✨ 哇，妳真的很厲害！這是妳今天親手贏到的生日獎品，好好享受吧！生日快樂，${name}！🎂`;
  } else if (stage >= 2) {
    return `🌸 妳今天的表現很棒！這是妳贏來的生日獎品，希望妳喜歡！生日快樂，${name}！🎈`;
  } else {
    return `💕 謝謝妳認真玩完這場遊戲，光是這樣就讓我很感動了。生日快樂，${name}！每一天都要開心喔！`;
  }
}

// ===================================================
// 彩帶特效
// ===================================================

function launchConfetti(containerId) {
  const container = $(containerId);
  container.innerHTML = "";
  const colors = ["#ff9de2", "#ffb6c1", "#d4b8ff", "#ffd700", "#fff", "#ff6b8a", "#a8edea"];
  for (let i = 0; i < 60; i++) {
    const piece = document.createElement("div");
    piece.className = "confetti-piece";
    piece.style.left = Math.random() * 100 + "%";
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDuration = (Math.random() * 2 + 1.5) + "s";
    piece.style.animationDelay = (Math.random() * 1) + "s";
    piece.style.width = (Math.random() * 8 + 6) + "px";
    piece.style.height = (Math.random() * 8 + 6) + "px";
    piece.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px";
    container.appendChild(piece);
  }
}

// ===================================================
// 初始化
// ===================================================

// 初始角色狀態
updateCharacter();
