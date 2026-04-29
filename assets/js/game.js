// ===================================================
// 遊戲核心邏輯
// ===================================================

const TIMER_TOTAL = 15;
const AUDIO_SOURCES = {
  bgm: "assets/audio/bgm.mp3",
  correct: "assets/audio/sfx-correct.mp3",
  wrong: "assets/audio/sfx-wrong.mp3",
  unlock: "assets/audio/sfx-unlock.mp3",
};

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
    unlockQueue: [],
    retryMode: false,
    retryQuestionIndexes: [],
    retryCursor: 0,
    pendingGrandAccept: false,
  };
}

let gameState = makeInitialState();
const audioSystem = createAudioSystem();

// ===================================================
// 工具函式
// ===================================================

function $(id) { return document.getElementById(id); }

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function formatScore(n) { return n.toLocaleString(); }

function normalizeAnswer(input) {
  return (input || "").trim().toLowerCase();
}

function createAudioSystem() {
  const bgm = new Audio(AUDIO_SOURCES.bgm);
  bgm.loop = true;
  bgm.volume = 0.24;
  bgm.preload = "auto";

  const effects = {
    correct: new Audio(AUDIO_SOURCES.correct),
    wrong: new Audio(AUDIO_SOURCES.wrong),
    unlock: new Audio(AUDIO_SOURCES.unlock),
  };
  Object.values(effects).forEach((a) => {
    a.preload = "auto";
    a.volume = 0.5;
  });

  let enabled = true;
  let unlocked = false;
  let started = false;
  const toggleBtn = $("btn-audio-toggle");

  function renderToggle() {
    if (!toggleBtn) return;
    toggleBtn.textContent = enabled ? "🔊 音樂開啟" : "🔇 音樂關閉";
    toggleBtn.setAttribute("aria-pressed", enabled ? "true" : "false");
  }

  async function tryStartBgm() {
    if (!enabled || started || !unlocked) return;
    try {
      await bgm.play();
      started = true;
    } catch (_) {
      started = false;
    }
  }

  async function unlockAndMaybeStart() {
    unlocked = true;
    await tryStartBgm();
  }

  function playEffect(name) {
    if (!enabled) return;
    const src = effects[name];
    if (!src) return;
    try {
      const snd = src.cloneNode();
      snd.volume = src.volume;
      snd.play().catch(() => {});
    } catch (_) {}
  }

  async function setEnabled(next) {
    enabled = !!next;
    renderToggle();
    if (!enabled) {
      bgm.pause();
      started = false;
      return;
    }
    await unlockAndMaybeStart();
  }

  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      setEnabled(!enabled);
    });
  }

  renderToggle();
  return {
    unlockAndMaybeStart,
    playCorrect: () => playEffect("correct"),
    playWrong: () => playEffect("wrong"),
    playUnlock: () => playEffect("unlock"),
  };
}

function getGrandPrize() {
  return PRIZES[PRIZES.length - 1];
}

function getActiveQuestionIndex() {
  if (gameState.retryMode) {
    return gameState.retryQuestionIndexes[gameState.retryCursor];
  }
  return gameState.currentQ;
}

// 震動（手機觸覺回饋）
function vibrate(pattern) {
  if (navigator.vibrate) navigator.vibrate(pattern);
}

function ensureImageLoader() {
  const wrap = $("question-image-wrap");
  if (!wrap || $("question-image-loader")) return;
  const loader = document.createElement("div");
  loader.id = "question-image-loader";
  loader.className = "question-image-loader";
  loader.innerHTML = '<span class="question-image-spinner" aria-hidden="true"></span><span class="question-image-loader-text">Loading image...</span>';
  wrap.appendChild(loader);
}

function setOptionsDisabled(disabled) {
  document.querySelectorAll(".option-btn").forEach(btn => {
    btn.disabled = disabled;
  });
}

function setQuestionImageLoading(isLoading) {
  const wrap = $("question-image-wrap");
  if (!wrap) return;
  if (isLoading) wrap.classList.add("is-loading");
  else wrap.classList.remove("is-loading");
}

const imagePreloadCache = new Map();

function preloadImage(src, timeoutMs) {
  if (!src) return Promise.resolve(false);
  if (imagePreloadCache.has(src)) return imagePreloadCache.get(src);

  const task = new Promise((resolve) => {
    let settled = false;
    const preloader = new Image();
    preloader.decoding = "async";
    const cleanup = () => {
      preloader.removeEventListener("load", onLoad);
      preloader.removeEventListener("error", onError);
    };
    const finalize = (loaded) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(loaded);
    };
    const onLoad = () => finalize(true);
    const onError = () => finalize(false);

    preloader.addEventListener("load", onLoad);
    preloader.addEventListener("error", onError);
    preloader.src = src;

    if (preloader.complete) {
      const loaded = preloader.naturalWidth > 0;
      finalize(loaded);
      return;
    }

    setTimeout(() => finalize(false), timeoutMs);
  });

  imagePreloadCache.set(src, task);
  return task;
}

function prefetchUpcomingQuestionImages(startIndex, count) {
  const begin = Math.max(0, startIndex);
  const end = Math.min(QUESTIONS.length, begin + count);
  for (let i = begin; i < end; i++) {
    const src = QUESTIONS[i] && QUESTIONS[i].image;
    if (!src) continue;
    preloadImage(src, 12000);
  }
}

function setQuestionImageAttributes(img) {
  if (!img) return;
  img.loading = "eager";
  img.decoding = "async";
  img.fetchPriority = "high";
}

function setResultImageAttributes(img) {
  if (!img) return;
  img.loading = "lazy";
  img.decoding = "async";
  img.fetchPriority = "low";
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
  audioSystem.unlockAndMaybeStart();
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
    gameState.playerName = "Karen";
    showScreen("screen-intro");
  }
});

// ===================================================
// 說明頁
// ===================================================

$("btn-agree").addEventListener("click", function() {
  audioSystem.unlockAndMaybeStart();
  gameState.startTime = new Date();
  showScreen("screen-game");
  loadQuestion();
});

// ===================================================
// 遊戲頁 - 載入題目
// ===================================================

function loadQuestion() {
  const qIdx = getActiveQuestionIndex();
  const q = QUESTIONS[qIdx];
  gameState.isAnswered = false;
  clearInterval(gameState.timerInterval);

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
  setQuestionImageAttributes(img);
  gameState.questionRenderToken = (gameState.questionRenderToken || 0) + 1;
  const renderToken = gameState.questionRenderToken;
  img.style.visibility = "hidden";
  img.removeAttribute("src");
  if (q.image) {
    imgWrap.style.display = "block";
    setQuestionImageLoading(true);
    setOptionsDisabled(true);
    preloadImage(q.image, 12000).then((loaded) => {
      if (renderToken !== gameState.questionRenderToken) return;
      setQuestionImageLoading(false);
      if (!loaded) {
        imgWrap.style.display = "none";
      } else {
        img.src = q.image;
        img.style.visibility = "visible";
      }
      setOptionsDisabled(false);
      startTimer(q.isFinal);
      prefetchUpcomingQuestionImages(qIdx + 1, 3);
    });
  } else {
    imgWrap.style.display = "none";
    setQuestionImageLoading(false);
    setOptionsDisabled(false);
    startTimer(q.isFinal);
    prefetchUpcomingQuestionImages(qIdx + 1, 3);
  }

  $("question-text").textContent = q.text;

  const optBtns = document.querySelectorAll(".option-btn");
  optBtns.forEach((btn, i) => {
    btn.textContent = q.options[i];
    btn.className = "option-btn";
    btn.disabled = !q.image ? false : true;
    // 選項依序入場，加微小 delay
    btn.style.animationDelay = `${0.05 + i * 0.06}s`;
    btn.classList.add("option-enter");
  });

  $("feedback-area").style.display = "none";
}

// ===================================================
// 題目進度條
// ===================================================

function updateQuestionProgressBar() {
  let pct = 0;
  if (gameState.retryMode) {
    const total = Math.max(1, gameState.retryQuestionIndexes.length);
    pct = (gameState.retryCursor / total) * 100;
  } else {
    pct = (gameState.currentQ / QUESTIONS.length) * 100;
  }
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
    audioSystem.unlockAndMaybeStart();
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
  const qIdx = getActiveQuestionIndex();
  const q = QUESTIONS[qIdx];
  const isTimeout = selectedIdx === -1;
  const isCorrect = !isTimeout && selectedIdx === q.answer;

  if (gameState.retryMode) {
    if (isCorrect) {
      audioSystem.playCorrect();
      vibrate([40, 30, 60]);
      flashScreen("correct");
    } else {
      audioSystem.playWrong();
      vibrate([200]);
    }

    updateOptionVisual(selectedIdx, q.answer, isTimeout);
    showFeedback(
      isCorrect,
      isTimeout,
      0,
      0,
      isCorrect ? "補答正確！" : "這題補答失敗，請再重新驗證一次。"
    );

    setTimeout(() => {
      if (!isCorrect) {
        gameState.retryMode = false;
        gameState.retryQuestionIndexes = [];
        gameState.retryCursor = 0;
        endGame();
        return;
      }
      gameState.retryCursor++;
      if (gameState.retryCursor < gameState.retryQuestionIndexes.length) {
        showScreen("screen-game");
        loadQuestion();
        return;
      }
      finishRetryAndUnlockGrand();
    }, isCorrect ? 1600 : 1800);
    return;
  }

  let baseScore = 0;
  let bonusScore = 0;

  if (isCorrect) {
    audioSystem.playCorrect();
    baseScore = 100;
    if (gameState.streak >= 1) bonusScore = getStreakBonus(gameState.streak + 1);
    gameState.streak++;
    gameState.consecutiveFail = 0;
    vibrate([40, 30, 60]); // 答對震動
  } else {
    audioSystem.playWrong();
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

function updateOptionVisual(selectedIdx, correctIdx, isTimeout) {
  document.querySelectorAll(".option-btn").forEach((btn, i) => {
    btn.disabled = true;
    if (i === correctIdx) btn.classList.add("correct");
    else if (i === selectedIdx && !isTimeout) btn.classList.add("wrong");
  });
}

function showFeedback(isCorrect, isTimeout, base, bonus, customText) {
  const fbArea = $("feedback-area");
  fbArea.style.display = "flex";

  if (customText) {
    $("feedback-icon").textContent = isCorrect ? "✅" : "⚠️";
    $("feedback-text").textContent = customText;
    $("feedback-score").textContent = "";
    $("feedback-streak").textContent = "";
    return;
  }

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

  if (gameState.retryMode) {
    const activeIdx = getActiveQuestionIndex();
    $("display-q-num").textContent = `${activeIdx + 1}*`;
  } else {
    $("display-q-num").textContent = gameState.currentQ + 1;
  }

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

  // 排除已解鎖 + 在 queue 排隊中的獎品，才能找到真正的「下一個」
  const queuedStages = (gameState.unlockQueue || []).map(p => p.stage);
  const nextPrize = PRIZES.find(p =>
    !gameState.unlockedPrizes.includes(p.stage) && !queuedStages.includes(p.stage)
  );
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
  audioSystem.playUnlock();
  // 重置翻轉狀態
  const flipInner = $("gift-flip-inner");
  const revealContent = $("unlock-reveal-content");
  flipInner.classList.remove("flipped");
  revealContent.style.display = "none";

  // 準備背面內容（先填入，翻轉後才顯示）
  const unlockImg = $("unlock-prize-img");
  const closedEnvelope = $("unlock-envelope-closed");
  const futureNote = $("unlock-future-note");
  const giftBack = document.querySelector(".gift-back");
  const isGrandPrizeCard = prize.stage === 5;
  if (futureNote) {
    futureNote.style.display = isGrandPrizeCard ? "inline-block" : "none";
  }
  if (giftBack) {
    giftBack.classList.toggle("grand-envelope-mode", isGrandPrizeCard);
  }
  if (prize.image) {
    unlockImg.src = prize.image;
    unlockImg.style.display = isGrandPrizeCard ? "none" : "block";
  } else {
    unlockImg.style.display = "none";
  }
  if (closedEnvelope) {
    closedEnvelope.style.display = isGrandPrizeCard ? "block" : "none";
  }
  $("unlock-prize-icon").textContent = prize.icon;
  $("unlock-prize-name").textContent = prize.name;
  $("unlock-score").textContent = formatScore(gameState.score) + " 分";
  $("unlock-message").textContent = prize.message;

  const grandStage = getGrandPrize().stage;
  const isMax = gameState.unlockedPrizes.includes(grandStage);
  const hasMoreUnlocks = gameState.unlockQueue.length > 0;
  const onLastQuestion = gameState.currentQ >= QUESTIONS.length - 1;
  gameState.pendingGrandAccept = isGrandPrizeCard;

  if (isGrandPrizeCard) {
    $("btn-continue").textContent = "打開同居邀請函 💌";
  } else if (isMax || (onLastQuestion && !hasMoreUnlocks)) {
    $("btn-continue").textContent = "前往結算 🎊";
  } else {
    $("btn-continue").textContent = "繼續挑戰 🎮";
  }

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

$("btn-continue").addEventListener("click", function() {
  if (gameState.pendingGrandAccept) {
    openGrandLetterScreen(true);
    return;
  }
  showNextUnlock();
});

// ===================================================
// 進入下一題 / 結束遊戲
// ===================================================

function advanceGame() {
  const isMax = gameState.unlockedPrizes.includes(getGrandPrize().stage);
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
  const hasGrand = gameState.unlockedPrizes.includes(getGrandPrize().stage);

  $("result-player-name").textContent = `🎂 ${gameState.playerName}，妳最棒了！`;

  const resultImg = $("result-final-prize-img");
  setResultImageAttributes(resultImg);
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
    item.innerHTML = `<span class="unlocked-item-icon">${unlocked ? p.icon : "🔒"}</span><span>${unlocked ? p.name : "未知獎品"}</span>`;
    list.appendChild(item);
  });

  $("result-message").innerHTML = buildResultMessage();

  const retryPanel = $("result-retry-panel");
  const retryContent = $("result-retry-content");
  const retryToggleBtn = $("btn-retry-toggle");
  if (retryPanel) {
    if (!hasGrand) {
      retryPanel.style.display = "block";
      retryPanel.classList.remove("expanded");
      renderRetryGateQuestions();
      const ul = $("result-retry-conditions");
      if (ul && typeof RETRY_CONDITIONS !== "undefined") {
        ul.innerHTML = "";
        RETRY_CONDITIONS.forEach((text) => {
          const li = document.createElement("li");
          li.textContent = text;
          ul.appendChild(li);
        });
      }
      if (retryToggleBtn) {
        retryToggleBtn.textContent = "哭了 我好想要剩下的獎品";
      }
    } else {
      retryPanel.style.display = "none";
    }
  }

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
  const grandStage = getGrandPrize().stage;
  const hasGrand = gameState.unlockedPrizes.includes(grandStage);
  const stage = gameState.unlockedPrizes.length;
  if (hasGrand) {
    return `🎉 妳達成滿分積分，拿下包含大獎在內的完整獎勵！生日快樂，${name}！💕`;
  }
  if (stage >= 4) return `✨ 哇，妳真的很厲害！這是妳今天親手贏到的生日獎品，好好享受吧！生日快樂，${name}！🎂`;
  if (stage >= 2) return `🌸 妳今天的表現很棒！這是妳贏來的生日獎品，希望妳喜歡！生日快樂，${name}！🎈`;
  return `💕 謝謝妳認真玩完這場遊戲，光是這樣就讓我很感動了。生日快樂，${name}！每一天都要開心喔！`;
}

// ===================================================
// 重新挑戰
// ===================================================

function collectWrongQuestionIndexes() {
  const wrong = new Set();
  gameState.answerLog.forEach((entry) => {
    if (entry.correct) return;
    const idx = QUESTIONS.findIndex((q) => q.id === entry.qId);
    if (idx >= 0) wrong.add(idx);
  });
  return Array.from(wrong);
}

function startRetryForWrongQuestions() {
  const wrongIndexes = collectWrongQuestionIndexes();
  if (wrongIndexes.length === 0) {
    finishRetryAndUnlockGrand();
    return;
  }
  gameState.retryMode = true;
  gameState.retryQuestionIndexes = wrongIndexes;
  gameState.retryCursor = 0;
  gameState.isAnswered = false;
  const retryPanel = $("result-retry-panel");
  if (retryPanel) retryPanel.style.display = "none";
  showScreen("screen-game");
  loadQuestion();
}

function finishRetryAndUnlockGrand() {
  const grand = getGrandPrize();
  gameState.retryMode = false;
  gameState.retryQuestionIndexes = [];
  gameState.retryCursor = 0;

  // 補答全對後，保證可達成最終門檻並補齊所有達標獎項
  gameState.score = Math.max(gameState.score, grand.threshold);
  const unlockedBefore = new Set(gameState.unlockedPrizes);
  const newlyUnlocked = [];

  for (const prize of PRIZES) {
    if (gameState.score < prize.threshold) continue;
    if (!gameState.unlockedPrizes.includes(prize.stage)) {
      gameState.unlockedPrizes.push(prize.stage);
    }
    if (!unlockedBefore.has(prize.stage)) {
      newlyUnlocked.push(prize);
    }
  }

  gameState.unlockedPrizes = Array.from(new Set(gameState.unlockedPrizes)).sort((a, b) => a - b);
  gameState.currentPrize = PRIZES
    .filter((p) => gameState.unlockedPrizes.includes(p.stage))
    .sort((a, b) => b.threshold - a.threshold)[0] || null;
  gameState.unlockQueue = newlyUnlocked.sort((a, b) => a.stage - b.stage);

  updateSidebar();
  if (gameState.unlockQueue.length > 0) {
    showNextUnlock();
    return;
  }
  endGame();
}

function renderRetryGateQuestions() {
  const wrap = $("retry-gate-fields");
  if (!wrap) return;
  wrap.innerHTML = "";
  (RETRY_GATE_QUESTIONS || []).forEach((item, idx) => {
    const row = document.createElement("div");
    row.className = "retry-gate-item";
    row.innerHTML = `
      <label class="retry-gate-label" for="retry-gate-input-${idx}">${idx + 1}. ${item.question}</label>
      <input id="retry-gate-input-${idx}" class="retry-gate-input" type="text" autocomplete="off" placeholder="${item.placeholder || ""}">
      <div id="retry-gate-error-${idx}" class="retry-gate-error"></div>
    `;
    wrap.appendChild(row);
  });
}

const retryGateForm = $("retry-gate-form");
if (retryGateForm) {
  retryGateForm.addEventListener("submit", function(e) {
    e.preventDefault();
    const items = RETRY_GATE_QUESTIONS || [];
    let allCorrect = true;
    items.forEach((item, idx) => {
      const input = $(`retry-gate-input-${idx}`);
      const error = $(`retry-gate-error-${idx}`);
      if (!input || !error) return;
      if (normalizeAnswer(input.value) !== normalizeAnswer(item.answer)) {
        error.textContent = item.errorMsg || "答案錯誤";
        allCorrect = false;
      } else {
        error.textContent = "";
      }
    });
    if (!allCorrect) return;
    startRetryForWrongQuestions();
  });
}

const retryToggleBtn = $("btn-retry-toggle");
if (retryToggleBtn) {
  retryToggleBtn.addEventListener("click", function() {
    const panel = $("result-retry-panel");
    const content = $("result-retry-content");
    if (!panel) return;
    const expanded = panel.classList.toggle("expanded");
    this.textContent = expanded ? "好像也沒那麼想要了" : "哭了 我好想要剩下的獎品";
    if (expanded && content) {
      setTimeout(() => {
        content.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 220);
    }
  });
}

function openGrandLetterScreen(fromUnlock) {
  const letter = typeof GRAND_PRIZE_LETTER === "object" ? GRAND_PRIZE_LETTER : {};
  const grandPrize = getGrandPrize();
  const letterPrizeImage = $("letter-prize-image");
  const letterPaperPrizeImage = $("letter-paper-prize-image");
  const imageSrc = (letter && letter.image) || (grandPrize && grandPrize.image) || "";
  if (letterPrizeImage) {
    if (imageSrc) {
      letterPrizeImage.src = imageSrc;
      letterPrizeImage.style.display = "block";
    } else {
      letterPrizeImage.style.display = "none";
    }
  }
  if (letterPaperPrizeImage) {
    letterPaperPrizeImage.style.display = "none";
  }
  $("letter-title").textContent = letter.title || "";
  $("letter-subtitle").textContent = letter.subtitle || "";
  $("letter-body").textContent = letter.content || "";
  $("letter-sign").textContent = letter.sign ? `— ${letter.sign}` : "";
  const backBtn = $("btn-letter-back");
  if (backBtn) {
    backBtn.textContent = fromUnlock ? "接受邀請並前往結算 💍" : "返回結算頁";
    backBtn.dataset.fromUnlock = fromUnlock ? "1" : "0";
  }
  showScreen("screen-grand-letter");
}

const letterBackBtn = $("btn-letter-back");
if (letterBackBtn) {
  letterBackBtn.addEventListener("click", function() {
    if (this.dataset.fromUnlock === "1") {
      gameState.pendingGrandAccept = false;
      endGame();
      return;
    }
    showScreen("screen-result");
  });
}

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
ensureImageLoader();
