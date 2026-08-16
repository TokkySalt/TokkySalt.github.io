(() => {

  "use strict";


  /* ==========================================================
     DOM取得
  ========================================================== */

  const chat =
    document.getElementById("chat");


  const answerArea =
    document.getElementById("answerArea");


  const startArea =
    document.getElementById("startArea");


  const startButton =
    document.getElementById("startButton");


  const typingIndicator =
    document.getElementById("typingIndicator");


  const rewardArea =
    document.getElementById("rewardArea");


  const rewardTitle =
    document.getElementById("rewardTitle");


  const rewardMessage =
    document.getElementById("rewardMessage");


  const showRewardButton =
    document.getElementById("showRewardButton");


  const rewardCodeBox =
    document.getElementById("rewardCodeBox");


  const rewardCode =
    document.getElementById("rewardCode");


  const rewardAfterMessage =
    document.getElementById("rewardAfterMessage");


  const restartButton =
    document.getElementById("restartButton");


  const gameTitle =
    document.getElementById("gameTitle");


  const headerAvatar =
    document.getElementById("headerAvatar");


  const typingAvatar =
    document.getElementById("typingAvatar");


  const confetti =
    document.getElementById("confetti");


  /* ==========================================================
     ゲーム状態
  ========================================================== */

  let currentQuestionIndex = 0;

  let gameStarted = false;

  let waitingForAnswer = false;


  /* ==========================================================
     初期設定
  ========================================================== */

  gameTitle.textContent =
    GAME_CONFIG.title ||
    "しおの ときお, 田中 亨...(3)";


  headerAvatar.src =
    GAME_CONFIG.friendIcon ||
    "assets/talk-icon.jpg";


  typingAvatar.src =
    GAME_CONFIG.friendIcon ||
    "assets/nyuuryoku-chuu.jpg";


  /*
   * 背景画像を設定
   */
  if (GAME_CONFIG.backgroundImage) {

    document
      .querySelector(".app")
      .style
      .backgroundImage =
        `url("${GAME_CONFIG.backgroundImage}")`;

  }


  /* ==========================================================
     待機
  ========================================================== */

  function sleep(ms) {

    return new Promise(
      resolve => setTimeout(resolve, ms)
    );

  }


  /* ==========================================================
     テキスト正規化
  ========================================================== */

  function normalizeText(value) {

    return String(value ?? "")

      /*
       * 全角・半角などを統一
       */
      .normalize("NFKC")

      /*
       * 前後の空白を削除
       */
      .trim()

      /*
       * 大文字・小文字を統一
       */
      .toLowerCase()

      /*
       * 途中の空白も削除
       */
      .replace(/\s+/g, "");

  }


  /* ==========================================================
     チャットを一番下までスクロール
  ========================================================== */

  function scrollToBottom(
    smooth = true
  ) {

    requestAnimationFrame(() => {

      chat.scrollTo({

        top:
          chat.scrollHeight,

        behavior:
          smooth
            ? "smooth"
            : "auto"

      });

    });

  }


  /* ==========================================================
     アイコン取得
  ========================================================== */

function getIcon(message) {

  /*
   * 回答者
   */
  if (message.sender === "user") {

    return (
      message.icon ||
      GAME_CONFIG.userIcon ||
      "assets/user-avatar.svg"
    );

  }


  /*
   * 出題者
   *
   * friend1 / friend2 の設定を取得
   */
  if (
    message.sender &&
    GAME_CONFIG.questioners &&
    GAME_CONFIG.questioners[
      message.sender
    ]
  ) {

    return (
      message.icon ||
      GAME_CONFIG.questioners[
        message.sender
      ].icon
    );

  }


  /*
   * 念のためのフォールバック
   */
  return (
    message.icon ||
    "assets/friend-avatar.svg"
  );

}


  /* ==========================================================
     名前取得
  ========================================================== */

function getName(message) {

  /*
   * メッセージ個別に名前が指定されている場合
   */
  if (message.name) {

    return message.name;

  }


  /*
   * 回答者
   */
  if (message.sender === "user") {

    return GAME_CONFIG.userName;

  }


  /*
   * 出題者
   *
   * friend1 / friend2 を取得
   */
  if (
    message.sender &&
    GAME_CONFIG.questioners &&
    GAME_CONFIG.questioners[
      message.sender
    ]
  ) {

    return GAME_CONFIG.questioners[
      message.sender
    ].name;

  }


  /*
   * 念のためのフォールバック
   */
  return "出題者";

}


  /* ==========================================================
     現在時刻
  ========================================================== */

  function getTime() {

    return new Date().toLocaleTimeString(
      "ja-JP",
      {
        hour: "2-digit",
        minute: "2-digit"
      }
    );

  }


  /* ==========================================================
     メッセージ追加
  ========================================================== */

  function addMessage(
    message,
    animate = true
  ) {

    const row =
      document.createElement("div");


    row.className =
      `message-row ${
        message.sender === "user"
          ? "user"
          : "friend"
      }`;


    /* --------------------------------------------------------
       アイコン
    -------------------------------------------------------- */

    const avatar =
      document.createElement("div");


    avatar.className =
      "message-avatar";


    const avatarImg =
      document.createElement("img");


    avatarImg.src =
      getIcon(message);


    avatarImg.alt = "";


    /*
     * 画像が存在しない場合は
     * デフォルト画像を使用
     */
    avatarImg.onerror = () => {

      avatarImg.src =
        "assets/friend-avatar.svg";

    };


    avatar.appendChild(
      avatarImg
    );


    /* --------------------------------------------------------
       メッセージ本体
    -------------------------------------------------------- */

    const content =
      document.createElement("div");


    content.className =
      "message-content";


    /* --------------------------------------------------------
       名前
    -------------------------------------------------------- */

    const name =
      document.createElement("div");


    name.className =
      "sender-name";


    name.textContent =
      getName(message);


    /* --------------------------------------------------------
       吹き出し
    -------------------------------------------------------- */

    const bubble =
      document.createElement("div");


    bubble.className =
      "message-bubble";


    bubble.textContent =
      message.text ?? "";


    /* --------------------------------------------------------
       時刻
    -------------------------------------------------------- */

    const time =
      document.createElement("div");


    time.className =
      "message-time";


    time.textContent =
      getTime();


    /* --------------------------------------------------------
       DOM構築
    -------------------------------------------------------- */

    content.appendChild(name);

    content.appendChild(bubble);


    if (
      message.sender === "user"
    ) {

      row.appendChild(content);

      row.appendChild(time);

    } else {

      row.appendChild(avatar);

      row.appendChild(content);

      row.appendChild(time);

    }


    if (!animate) {

      row.style.animation =
        "none";

    }


    chat.appendChild(row);


    scrollToBottom();


    return row;

  }


  /* ==========================================================
     「入力中…」表示
  ========================================================== */

  async function showTyping(
    duration = 650
  ) {

    typingIndicator.hidden =
      false;


    scrollToBottom();


    await sleep(duration);


    typingIndicator.hidden =
      true;

  }


  /* ==========================================================
     友人メッセージ表示
  ========================================================== */

async function addFriendMessage(
  message,
  typingDelay = 700
) {

  /*
   * 入力中…
   */
  await showTyping(
    typingDelay
  );


  /*
   * sender が指定されていれば、
   * friend1 / friend2 としてそのまま使用する。
   *
   * 指定されていない場合は friend1 を使用。
   */
  const sender =
    message.sender ||
    "friend1";


  /*
   * メッセージを追加
   */
  return addMessage({

    sender: sender,

    name:
      message.name,

    icon:
      message.icon,

    text:
      message.text

  });

}


  /* ==========================================================
     ゲーム開始メッセージ
  ========================================================== */

  async function showStartMessages() {

    for (
      const message
      of GAME_CONFIG.startMessages || []
    ) {

      await addFriendMessage(

        message,

        message.typingDelay ?? 700

      );


      await sleep(180);

    }

  }
  /* ==========================================================
     ゲーム終了メッセージ
  ========================================================== */
  async function showEndMessages() {
    for (
      const message
      of GAME_CONFIG.endMessages | []
    ) {
      await addFriendMessage(
        message,
        message.typingdelay ?? 700
      );
      await sleep(180);
    }
  }


  /* ==========================================================
     問題表示
  ========================================================== */

  async function showQuestion(
    question
  ) {

    waitingForAnswer =
      true;


    /*
     * 問題をチャットに表示
     */
    await addFriendMessage(

      {

        sender:
          question.questioner ||
          "friend1",

        name:
          question.questionName,

        icon:
          question.questionIcon,

        text:
          question.question
      },

      question.typingDelay ??
      850

    );


    /*
     * 回答欄を作る
     */
    renderAnswerArea(
      question
    );

  }


  /* ==========================================================
     回答欄生成
  ========================================================== */

  function renderAnswerArea(
    question
  ) {

    answerArea.innerHTML =
      "";


    /* ========================================================
       はい / いいえ
    ======================================================== */

    if (
      question.type ===
      "yesno"
    ) {

      const buttons =
        document.createElement(
          "div"
        );


      buttons.className =
        "answer-buttons";


      /* ------------------------------------------------------
         はい
      ------------------------------------------------------ */

      const yes =
        document.createElement(
          "button"
        );


      yes.className =
        "answer-button";


      yes.textContent =
        "はい";


      yes.addEventListener(
        "click",
        () => {

          submitAnswer(
            "yes",
            "はい"
          );

        }
      );


      /* ------------------------------------------------------
         いいえ
      ------------------------------------------------------ */

      const no =
        document.createElement(
          "button"
        );


      no.className =
        "answer-button";


      no.textContent =
        "いいえ";


      no.addEventListener(
        "click",
        () => {

          submitAnswer(
            "no",
            "いいえ"
          );

        }
      );


      buttons.appendChild(
        yes
      );


      buttons.appendChild(
        no
      );


      answerArea.appendChild(
        buttons
      );


      return;

    }


    /* ========================================================
       テキスト入力
    ======================================================== */

    if (
      question.type ===
      "text"
    ) {

      const form =
        document.createElement(
          "form"
        );


      form.className =
        "text-answer";


      const input =
        document.createElement(
          "input"
        );


      input.type =
        "text";


      input.autocomplete =
        "off";


      input.enterKeyHint =
        "send";


      input.placeholder =
        "回答を入力してください";


      input.setAttribute(
        "aria-label",
        "回答"
      );


      const button =
        document.createElement(
          "button"
        );


      button.type =
        "submit";


      button.textContent =
        "送信";


      form.addEventListener(
        "submit",
        event => {

          event.preventDefault();


          const value =
            input.value.trim();


          /*
           * 空欄は送信しない
           */
          if (!value) {

            return;

          }


          submitAnswer(
            value,
            value
          );

        }
      );


      form.appendChild(
        input
      );


      form.appendChild(
        button
      );


      answerArea.appendChild(
        form
      );


      /*
       * スマートフォンでも
       * 入力しやすいようにフォーカス
       */
      setTimeout(
        () => input.focus(),
        100
      );

    }

  }


  /* ==========================================================
     回答送信
  ========================================================== */

  async function submitAnswer(
    rawAnswer,
    displayAnswer
  ) {

    /*
     * 回答受付中でなければ無視
     *
     * これにより連打による
     * 二重回答を防止
     */
    if (
      !gameStarted ||
      waitingForAnswer === false
    ) {

      return;

    }


    waitingForAnswer =
      false;


    /*
     * 回答欄を一旦消す
     */
    answerArea.innerHTML =
      "";


    /*
     * ユーザー側の回答をチャットに追加
     */
    addMessage({

      sender: "user",

      name:
        GAME_CONFIG.userName,

      icon:
        GAME_CONFIG.userIcon,

      text:
        displayAnswer

    });


    const question =
      questions[
        currentQuestionIndex
      ];


    /*
     * 正誤判定
     */
    const isCorrect =
      judgeAnswer(
        question,
        rawAnswer
      );


    await sleep(350);


    /* ========================================================
       正解
    ======================================================== */

    if (isCorrect) {

      const resultRow =
        await addFriendMessage(

          {

            sender:
              question.correctQuestioner ||
              question.questioner ||
              "friend1",

            name:
              question.correctName,

            icon:
              question.correctIcon,

            text:
              question.correctMessage ||
              "正解です！"

          },

          question.resultTypingDelay ??
          650

        );


      /*
       * 正解時アニメーション
       */
      resultRow.classList.add(
        "correct-pop"
      );


      await sleep(550);


      /*
       * 次の問題へ進む
       */
      currentQuestionIndex++;


      /*
       * 全問正解
       */
      if (
        currentQuestionIndex >=
        questions.length
      ) {
        showEndMessages();
        finishGame();

      } else {

        /*
         * 次の問題
         */
        await showQuestion(
          questions[
            currentQuestionIndex
          ]
        );

      }


      return;

    }


    /* ========================================================
       不正解
    ======================================================== */

    await addFriendMessage(

      {

        sender:
          question.incorrectQuestioner ||
          question.questioner ||
          "friend1",

        name:
          question.incorrectName,

        icon:
          question.incorrectIcon,

        text:
          question.incorrectMessage ||
          "もう一度考えてみてください。"

      },

      question.resultTypingDelay ??
      650

    );


    await sleep(450);


    /*
     * ========================================================
     * 重要:
     *
     * currentQuestionIndexを変更しない。
     *
     * そのため同じ問題を再出題する。
     * ========================================================
     */

    await showQuestion(
      question
    );

  }


  /* ==========================================================
     回答判定
  ========================================================== */

  function judgeAnswer(
    question,
    answer
  ) {

    /* --------------------------------------------------------
       はい / いいえ
    -------------------------------------------------------- */

    if (
      question.type ===
      "yesno"
    ) {

      return (

        String(answer)
          .toLowerCase()

        ===

        String(question.answer)
          .toLowerCase()

      );

    }


    /* --------------------------------------------------------
       テキスト
    -------------------------------------------------------- */

    if (
      question.type ===
      "text"
    ) {

      const acceptedAnswers =
        Array.isArray(
          question.answers
        )
          ? question.answers
          : [];


      const normalized =
        normalizeText(
          answer
        );


      /*
       * 複数の正答のうち、
       * どれか1つと一致すれば正解
       */

      return acceptedAnswers.some(
        accepted =>

          normalizeText(
            accepted
          ) === normalized
      );

    }


    /*
     * 未知の形式
     */
    return false;

  }


  /* ==========================================================
     ゲーム開始
  ========================================================== */

  async function startGame() {

    if (gameStarted) {

      return;

    }


    gameStarted =
      true;


    currentQuestionIndex =
      0;


    waitingForAnswer =
      false;


    /*
     * 開始ボタンを消す
     */
    startArea.hidden =
      true;


    answerArea.innerHTML =
      "";


    /*
     * 開始メッセージ
     */
    await showStartMessages();
   await showEndMessages();

    await sleep(400);


    /*
     * 問題が0問の場合
     */
    if (
      questions.length === 0
    ) {
      
      finishGame();

      return;

    }


    /*
     * 第1問
     */
    await showQuestion(
      questions[0]
    );

  }


  /* ==========================================================
     全問正解
  ========================================================== */

  function finishGame() {

    waitingForAnswer =
      false;


    answerArea.innerHTML =
      "";


    /*
     * プレゼント情報を設定
     */

    rewardTitle.textContent =
      GAME_CONFIG.reward?.title ||
      "プレゼント獲得！";


    rewardMessage.textContent =
      GAME_CONFIG.reward?.message ||
      "全問正解おめでとうございます！";


    showRewardButton.textContent =
      GAME_CONFIG.reward?.buttonText ||
      "プレゼントを見る";


    rewardCode.textContent =
      GAME_CONFIG.reward?.code ||
      "";


    rewardAfterMessage.textContent =
      GAME_CONFIG.reward?.afterMessage ||
      "";


    /*
     * コードは最初は非表示
     */
    rewardCodeBox.hidden =
      true;


    /*
     * ボタンは表示
     */
    showRewardButton.hidden =
      false;


    /*
     * プレゼント画面
     */
    rewardArea.hidden =
      false;


    /*
     * 紙吹雪
     */
    launchConfetti();

  }


  /* ==========================================================
     プレゼントコード表示
  ========================================================== */

  function showReward() {

    rewardCodeBox.hidden =
      false;


    showRewardButton.hidden =
      true;

  }


  /* ==========================================================
     リスタート
  ========================================================== */

  function restartGame() {

    gameStarted =
      false;


    currentQuestionIndex =
      0;


    waitingForAnswer =
      false;


    /*
     * チャットを初期化
     */
    chat.innerHTML =
      "";


    answerArea.innerHTML =
      "";


    /*
     * プレゼント画面を閉じる
     */
    rewardArea.hidden =
      true;


    rewardCodeBox.hidden =
      true;


    showRewardButton.hidden =
      false;


    /*
     * 開始ボタンを再表示
     */
    startArea.hidden =
      false;


    /*
     * 紙吹雪を削除
     */
    confetti.innerHTML =
      "";

  }


  /* ==========================================================
     紙吹雪
  ========================================================== */

  function launchConfetti() {

    confetti.innerHTML =
      "";


    const pieces =
      90;


    for (
      let i = 0;
      i < pieces;
      i++
    ) {

      const piece =
        document.createElement(
          "span"
        );


      piece.className =
        "confetti-piece";


      /*
       * 紙吹雪の色
       */
      const colors = [

        "#06c755",

        "#ffcc00",

        "#ff6688",

        "#5b9cff",

        "#9b59b6",

        "#ff8c42"

      ];


      piece.style.background =
        colors[
          i % colors.length
        ];


      /*
       * 横位置
       */
      piece.style.left =
        `${Math.random() * 100}%`;


      /*
       * 落下時の左右の揺れ
       */
      piece.style.setProperty(

        "--drift",

        `${-80 + Math.random() * 160}px`

      );


      /*
       * 落下開始タイミング
       */
      piece.style.animationDelay =
        `${Math.random() * 0.9}s`;


      /*
       * 初期角度
       */
      piece.style.transform =
        `rotate(${Math.random() * 360}deg)`;


      confetti.appendChild(
        piece
      );

    }


    /*
     * 一定時間後に削除
     */
    setTimeout(
      () => {

        confetti.innerHTML =
          "";

      },
      4500
    );

  }


  /* ==========================================================
     イベント登録
  ========================================================== */

  startButton.addEventListener(
    "click",
    startGame
  );


  showRewardButton.addEventListener(
    "click",
    showReward
  );


  restartButton.addEventListener(
    "click",
    restartGame
  );


})();