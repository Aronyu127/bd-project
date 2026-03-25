// ===================================================
// 遊戲核心邏輯
// ===================================================

const TIMER_TOTAL = 15;

const CHARACTER_STATES = {
  calm:         { emoji: "🐱",  text: "加油！" },
  excited:      { emoji: "😸",  text: "太棒了！" },
  superExcited: { emoji: "🥳",  text: "超厲害！！" },
  sad:          { emoji: "😿",  text: "沒關係..." },
  superSad:     { emoji: "😭",  text: "再加油..." },
};

function getStreakBonus(streak) {
  if (streak <= 1) return 0;
  if (streak === 2) return 50;
  if (streak === 3) return 100;
  return 150;
}

function makeInitialState() {
  return {
    playerName: "",
    score: 0,
    currentQ: 0,
    streak: 0,
    consecutiveFail: 0,
    unlockedPrizes: [],
    currentPrize: null,
    isAnswered: false,
    timerInterval: null,
    timerLeft: TIMER_TOTAL,
    startTime: null,
    answerLog: [],
    gameEnded: false,
    finalRetried: false,
    unlockQueue: [],
  };
}

let gameState = makeInitialState();

// ===================================================
// 工具函式
// ===================================================

function $(id) { return document.getElementById(id); }

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function formatScore(n) { return n.toLocaleString(); }

// 震動（手機觸覺回饋）
function vibrate(pattern) {
  if (navigator.vibrate) navigator.vibrate(pattern);
}

// ===================================================
// 起始頁
// ===================================================

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
    $("input-q1").classList.add("input-shake");
    setTimeout(() => $("input-q1").classList.remove("input-shake"), 500);
    valid = false;
  }
  if (ans2.toLowerCase() !== START_QUESTIONS[1].answer.toLowerCase()) {
    $("error-q2").textContent = START_QUESTIONS[1].errorMsg;
    $("input-q2").classList.add("input-shake");
    setTimeout(() => $("input-q2").classList.remove("input-shake"), 500);
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

  updateSidebar();
  updateQuestionProgressBar();

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

  // 題目入場動畫：先隱藏再 slide-in
  card.classList.remove("question-enter");
  void card.offsetWidth; // reflow 觸發重播
  card.classList.add("question-enter");

  // 題目圖片
  const imgWrap = $("question-image-wrap");
  const img = $("question-image");
  if (q.image) {
    img.src = q.image;
    imgWrap.style.display = "block";
  } else {
    imgWrap.style.display = "none";
  }

  $("question-text").textContent = q.text;

  const optBtns = document.querySelectorAll(".option-btn");
  optBtns.forEach((btn, i) => {
    btn.textContent = q.options[i];
    btn.className = "option-btn";
    btn.disabled = false;
    // 選項依序入場，加微小 delay
    btn.style.animationDelay = `${0.05 + i * 0.06}s`;
    btn.classList.add("option-enter");
  });

  $("feedback-area").style.display = "none";

  startTimer(q.isFinal);
}

// ===================================================
// 題目進度條
// ===================================================

function updateQuestionProgressBar() {
  const pct = ((gameState.currentQ) / QUESTIONS.length) * 100;
  $("question-progress-bar").style.width = pct + "%";
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

    // 最後 3 秒震動提示
    if (gameState.timerLeft === 3) vibrate([80]);
    if (gameState.timerLeft === 2) vibrate([80]);
    if (gameState.timerLeft === 1) vibrate([120]);

    if (gameState.timerLeft <= 0) {
      clearInterval(gameState.timerInterval);
      if (!gameState.isAnswered) handleAnswer(-1);
    }
  }, 1000);
}

function updateTimerDisplay(val, isFinal) {
  $("timer-text").textContent = val;

  const circle = $("timer-circle");
  const circumference = 2 * Math.PI * 15.9;
  circle.style.strokeDasharray = `${circumference * (val / TIMER_TOTAL)} ${circumference}`;

  const timerSvg = $("timer-svg");
  const timerText = $("timer-text");

  if (val <= 3) {
    timerSvg.classList.add("timer-urgent");
    timerText.classList.add("timer-urgent-text");
  } else {
    timerSvg.classList.remove("timer-urgent");
    timerText.classList.remove("timer-urgent-text");
  }

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
    clearInterval(gameState.timerInterval);
    handleAnswer(parseInt(this.dataset.index));
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

  let baseScore = 0;
  let bonusScore = 0;

  if (isCorrect) {
    baseScore = q.isFinal ? 2000 : 100;
    if (gameState.streak >= 1) bonusScore = getStreakBonus(gameState.streak + 1);
    gameState.streak++;
    gameState.consecutiveFail = 0;
    vibrate([40, 30, 60]); // 答對震動
  } else {
    gameState.streak = 0;
    gameState.consecutiveFail++;
    vibrate([200]); // 答錯震動
  }

  const totalGain = baseScore + bonusScore;
  gameState.score += totalGain;

  gameState.answerLog.push({
    qId: q.id, qText: q.text, selected: selectedIdx, answer: q.answer,
    correct: isCorrect, timeout: isTimeout, baseScore, bonusScore,
    totalScore: gameState.score,
  });

  updateOptionVisual(selectedIdx, q.answer, isTimeout);
  updateCharacter();
  showFeedback(isCorrect, isTimeout, baseScore, bonusScore);
  updateSidebar();

  // 答對時全畫面閃光
  if (isCorrect) flashScreen("correct");

  const newPrizes = checkPrizeUnlock();

  setTimeout(() => {
    if (newPrizes.length > 0) {
      // 把獎品放進 queue，逐一顯示
      gameState.unlockQueue = newPrizes;
      showNextUnlock();
    } else {
      advanceGame();
    }
  }, isCorrect ? 2600 : 2200);
}

// 最後一題第二次機會
function showFinalRetryFeedback(isTimeout) {
  const fbArea = $("feedback-area");
  fbArea.style.display = "flex";
  $("feedback-icon").textContent = "💫";
  $("feedback-text").textContent = isTimeout ? "時間到啦！不過沒關係，再試一次！" : "差一點點！再給妳一次機會～";
  $("feedback-score").textContent = "";
  $("feedback-streak").textContent = "";

  setTimeout(() => {
    fbArea.style.display = "none";
    document.querySelectorAll(".option-btn").forEach(btn => {
      btn.className = "option-btn";
      btn.disabled = false;
    });
    gameState.isAnswered = false;
    startTimer(true);
  }, 1800);
}

function updateOptionVisual(selectedIdx, correctIdx, isTimeout) {
  document.querySelectorAll(".option-btn").forEach((btn, i) => {
    btn.disabled = true;
    if (i === correctIdx) btn.classList.add("correct");
    else if (i === selectedIdx && !isTimeout) btn.classList.add("wrong");
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
    $("feedback-streak").textContent = bonus > 0 ? `🔥 連擊加成 +${bonus}！` : "";
  } else {
    $("feedback-icon").textContent = "💔";
    $("feedback-text").textContent = "答錯了... 沒關係！";
    $("feedback-score").textContent = "+0 分";
    $("feedback-streak").textContent = "";
  }
}

// ===================================================
// 全畫面閃光特效
// ===================================================

function flashScreen(type) {
  const flash = document.createElement("div");
  flash.className = `screen-flash flash-${type}`;
  document.body.appendChild(flash);
  setTimeout(() => flash.remove(), 600);
}

// ===================================================
// 連擊數字跳動
// ===================================================

function bumpStreak() {
  const el = $("display-streak");
  el.classList.remove("streak-bump");
  void el.offsetWidth;
  el.classList.add("streak-bump");
}

// ===================================================
// 角色狀態更新
// ===================================================

function updateCharacter() {
  let state;
  if (gameState.streak >= 2)        state = CHARACTER_STATES.superExcited;
  else if (gameState.streak === 1)  state = CHARACTER_STATES.excited;
  else if (gameState.consecutiveFail >= 2) state = CHARACTER_STATES.superSad;
  else if (gameState.consecutiveFail === 1) state = CHARACTER_STATES.sad;
  else                              state = CHARACTER_STATES.calm;

  const el = $("character-emoji");
  el.textContent = state.emoji;
  el.title = state.text;
  el.classList.remove("character-bounce");
  void el.offsetWidth;
  el.classList.add("character-bounce");
}

// ===================================================
// 側邊欄更新（含分數跳動）
// ===================================================

function updateSidebar() {
  // 分數跳動
  const scoreEl = $("display-score");
  const oldScore = parseInt(scoreEl.dataset.score || "0");
  if (gameState.score !== oldScore) {
    scoreEl.classList.remove("bump");
    void scoreEl.offsetWidth;
    scoreEl.classList.add("bump");
    scoreEl.dataset.score = gameState.score;
  }
  scoreEl.textContent = formatScore(gameState.score);

  $("display-q-num").textContent = gameState.currentQ + 1;

  // 連擊跳動
  const streakEl = $("display-streak");
  const oldStreak = parseInt(streakEl.dataset.streak || "0");
  if (gameState.streak > oldStreak) bumpStreak();
  streakEl.dataset.streak = gameState.streak;
  streakEl.textContent = gameState.streak;

  if (gameState.currentPrize) {
    $("display-current-prize").textContent = `${gameState.currentPrize.icon} ${gameState.currentPrize.name}`;
  } else {
    $("display-current-prize").textContent = "尚未解鎖";
  }

  const nextPrize = PRIZES.find(p => !gameState.unlockedPrizes.includes(p.stage));
  if (nextPrize) {
    const remaining = Math.max(0, nextPrize.threshold - gameState.score);
    $("display-threshold").textContent = remaining > 0 ? `還差 ${formatScore(remaining)} 分` : "快到了！";
    const prev = gameState.currentPrize ? gameState.currentPrize.threshold : 0;
    const progress = Math.min(1, (gameState.score - prev) / (nextPrize.threshold - prev));
    $("progress-bar").style.width = `${Math.max(0, progress * 100)}%`;
  } else {
    $("display-threshold").textContent = "🎉";
    $("progress-bar").style.width = "100%";
  }
}

// ===================================================
// 獎品解鎖檢查
// ===================================================

// 一次收集所有新達標的獎品，回傳 array
function checkPrizeUnlock() {
  const newlyUnlocked = [];
  for (const prize of PRIZES) {
    if (!gameState.unlockedPrizes.includes(prize.stage) && gameState.score >= prize.threshold) {
      gameState.unlockedPrizes.push(prize.stage);
      gameState.currentPrize = prize;
      newlyUnlocked.push(prize);
    }
  }
  return newlyUnlocked;
}

// ===================================================
// 恭喜解鎖頁：拆禮物機制
// ===================================================

// 從 queue 取出下一個獎品顯示，queue 空了才 advanceGame
function showNextUnlock() {
  const prize = gameState.unlockQueue.shift();
  if (prize) {
    showUnlockScreen(prize);
  } else {
    advanceGame();
  }
}

function showUnlockScreen(prize) {
  // 重置翻轉狀態
  const flipInner = $("gift-flip-inner");
  const revealContent = $("unlock-reveal-content");
  flipInner.classList.remove("flipped");
  revealContent.style.display = "none";

  // 準備背面內容（先填入，翻轉後才顯示）
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
  $("btn-continue").textContent = isMax ? "前往結算 🎊" : "繼續挑戰 🎮";

  showScreen("screen-unlock");
  launchConfetti("confetti-container");
  vibrate([100, 50, 100, 50, 200]);
}

// 點擊禮物盒翻轉
$("gift-flip-wrap").addEventListener("click", function() {
  const inner = $("gift-flip-inner");
  if (inner.classList.contains("flipped")) return;
  inner.classList.add("flipped");
  vibrate([60, 40, 100]);

  // 翻轉完成後顯示分數與按鈕
  setTimeout(() => {
    $("unlock-reveal-content").style.display = "block";
    $("unlock-reveal-content").classList.add("reveal-fade-in");
    launchConfetti("confetti-container"); // 第二波彩帶
  }, 500);
});

$("btn-continue").addEventListener("click", showNextUnlock);

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
// 結算頁（含分數滾動計數動畫）
// ===================================================

function endGame() {
  gameState.gameEnded = true;
  clearInterval(gameState.timerInterval);

  $("result-player-name").textContent = `🎂 ${gameState.playerName}，妳最棒了！`;

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

  const list = $("result-unlocked-list");
  list.innerHTML = "";
  PRIZES.forEach(p => {
    const unlocked = gameState.unlockedPrizes.includes(p.stage);
    const item = document.createElement("div");
    item.className = `unlocked-item ${unlocked ? "" : "locked"}`;
    item.innerHTML = `<span class="unlocked-item-icon">${unlocked ? p.icon : "🔒"}</span><span>${p.name}</span>`;
    list.appendChild(item);
  });

  $("result-message").innerHTML = buildResultMessage();

  showScreen("screen-result");
  launchConfetti("confetti-container-result");

  // 分數滾動計數動畫
  animateScore($("result-score"), gameState.score, 1800);
}

// 分數從 0 滾動到目標值
function animateScore(el, target, duration) {
  el.textContent = "0";
  const start = performance.now();
  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // easeOutExpo 緩動：快速增加後緩緩收尾
    const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
    el.textContent = formatScore(Math.round(ease * target));
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function buildResultMessage() {
  const name = gameState.playerName;
  const stage = gameState.unlockedPrizes.length;
  if (stage >= 6) return `🎉 恭喜妳完成今天的生日挑戰！妳拿下了所有獎品，這是妳今天親手贏到的生日大禮！希望妳喜歡這份專屬於妳的小遊戲，生日快樂，${name}！💕`;
  if (stage >= 4) return `✨ 哇，妳真的很厲害！這是妳今天親手贏到的生日獎品，好好享受吧！生日快樂，${name}！🎂`;
  if (stage >= 2) return `🌸 妳今天的表現很棒！這是妳贏來的生日獎品，希望妳喜歡！生日快樂，${name}！🎈`;
  return `💕 謝謝妳認真玩完這場遊戲，光是這樣就讓我很感動了。生日快樂，${name}！每一天都要開心喔！`;
}

// ===================================================
// 重新挑戰
// ===================================================

$("btn-restart").addEventListener("click", function() {
  gameState = makeInitialState();
  // 重置起始頁輸入
  $("input-q1").value = "";
  $("input-q2").value = "";
  $("error-q1").textContent = "";
  $("error-q2").textContent = "";
  showScreen("screen-start");
});

// ===================================================
// 彩帶特效
// ===================================================

function launchConfetti(containerId) {
  const container = $(containerId);
  container.innerHTML = "";
  const colors = ["#ff9de2", "#ffb6c1", "#d4b8ff", "#ffd700", "#fff", "#ff6b8a", "#a8edea"];
  for (let i = 0; i < 70; i++) {
    const piece = document.createElement("div");
    piece.className = "confetti-piece";
    piece.style.left = Math.random() * 100 + "%";
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDuration = (Math.random() * 2 + 1.5) + "s";
    piece.style.animationDelay = (Math.random() * 1.2) + "s";
    piece.style.width = (Math.random() * 8 + 5) + "px";
    piece.style.height = (Math.random() * 8 + 5) + "px";
    piece.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px";
    container.appendChild(piece);
  }
}

// ===================================================
// 初始化
// ===================================================

updateCharacter();
