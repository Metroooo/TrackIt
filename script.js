// Получение элементов
const createRoomForm = document.getElementById("create-room-form");
const roomNameInput = document.getElementById("room-name");
const maxPointsInput = document.getElementById("max-points");
const roomsList = document.getElementById("rooms");
const roomDetailsSection = document.getElementById("room-details");
const roomTitle = document.getElementById("room-title");
const roomMaxPoints = document.getElementById("room-max-points");
const roomPlayersList = document.getElementById("room-players-list");
const addPlayerToRoomBtn = document.getElementById("add-player-to-room-btn");
const modalAddPlayer = document.getElementById("modal-add-player");
const playerNameInput = document.getElementById("player-name");
const addPlayerConfirm = document.getElementById("add-player-confirm");
const modalAddPoints = document.getElementById("modal-add-points");
const playerPointsInput = document.getElementById("player-points");
const addPointsConfirm = document.getElementById("add-points-confirm");
const resetScoresBtn = document.getElementById("reset-scores-btn");
const modalResetScores = document.getElementById("modal-reset-scores");
const resetScoresConfirm = document.getElementById("reset-scores-confirm");
const resetScoresCancel = document.getElementById("reset-scores-cancel");
const modalDeletePlayer = document.getElementById("modal-delete-player");
const deletePlayerConfirm = document.getElementById("delete-player-confirm");
const deletePlayerCancel = document.getElementById("delete-player-cancel");
const modalEndGame = document.getElementById("modal-end-game");
const endGameMessage = document.getElementById("end-game-message");
const restartGameBtn = document.getElementById("restart-game-btn");
const modalDeleteRoom = document.getElementById("modal-delete-room");
const deleteRoomConfirm = document.getElementById("delete-room-confirm");
const deleteRoomCancel = document.getElementById("delete-room-cancel");
const navButtons = document.querySelectorAll(".nav-btn");
const pages = document.querySelectorAll(".page");
const themeButtons = document.querySelectorAll(".theme-btn"); // Для смены темы
const clearCacheModal = document.getElementById("clear-cache-modal");
const confirmClearCache = document.getElementById("confirm-clear-cache");
const cancelClearCache = document.getElementById("cancel-clear-cache");

// Добавляем контейнер и функцию для вывода подсказок
const hintContainer = document.getElementById("hint-container");
function showHint(message) {
  // Выводим текст внутри контейнера и показываем его
  hintContainer.textContent = message;
  hintContainer.style.display = "block";

  // Скрываем через 3 секунды (можно настроить время)
  setTimeout(() => {
    hintContainer.style.display = "none";
  }, 3000);
}

// Данные
let rooms = JSON.parse(localStorage.getItem("rooms")) || [];
let currentRoomIndex = null;
let currentPlayerIndex = null;

// Сохранение данных
function saveToLocalStorage() {
  localStorage.setItem("rooms", JSON.stringify(rooms));
}

// Навигация между страницами
document.addEventListener("DOMContentLoaded", () => {
  // Найти активную секцию
  const activeSection = document.querySelector(".page.active");

  // Найти соответствующую кнопку
  const activeButton = document.querySelector(`.nav-btn[data-target="${activeSection.id}"]`);

  if (activeButton) {
    activeButton.classList.add("active");
  }
});

navButtons.forEach((button) => {
  button.addEventListener("click", () => {
    // Удаляем класс active со всех кнопок
    navButtons.forEach((btn) => btn.classList.remove("active"));

    // Добавляем класс active на текущую кнопку
    button.classList.add("active");

    // Переключение секций
    const target = button.getAttribute("data-target");
    pages.forEach((page) => page.classList.remove("active"));
    document.getElementById(target).classList.add("active");
  });
});

// Проверка имени при загрузке
document.addEventListener("DOMContentLoaded", () => {
  const playerName = localStorage.getItem("playerName");

  if (!playerName) {
    showNameModal();
  }
});

// Модальное окно "Как вас зовут?"
function showNameModal() {
  const modal = document.getElementById("modal-player-name");
  modal.classList.add("show");

  const confirmButton = document.getElementById("confirm-name");
  confirmButton.addEventListener("click", () => {
    const inputName = document.getElementById("player-name-input").value.trim();
    if (inputName) {
      localStorage.setItem("playerName", inputName);
      modal.classList.remove("show");
    }
  });
}

// Логика аватарки
function getRandomAvatar() {
  return `assets/ava/${Math.floor(Math.random() * 5) + 1}.jpg`;
}

// Присвоение аватарки игроку
function assignAvatar(player) {
  player.avatar = getRandomAvatar();
}

// Обновление аватарок при очистке
resetScoresConfirm.addEventListener("click", () => {
  const room = rooms[currentRoomIndex];
  room.players = room.players.map((player) => ({
    ...player,
    avatar: getRandomAvatar(),
    score: 0,
    history: [],
  }));
  saveToLocalStorage();
  renderRoomPlayers();
});

// Отключаем правый клик
document.querySelectorAll('.banner a').forEach((link) => {
  link.addEventListener('mousedown', (event) => {
    if (event.button === 2) {
      event.preventDefault(); // Отключает правый клик
    }
  });
});

document.addEventListener('contextmenu', (event) => {
  event.preventDefault(); // Отключает контекстное меню
});

// На весь блок открывать room-info
document.querySelectorAll('.room-item').forEach((item) => {
  item.addEventListener('click', (event) => {
    if (!event.target.classList.contains('delete-room-btn')) {
      const roomIndex = item.getAttribute('data-room-index');
      openRoom(roomIndex); // Открытие комнаты
    }
  });
});

// Отображение списка комнат
function renderRooms() {
  roomsList.innerHTML = rooms
    .map(
      (room, index) => `
      <li>
        <div class="room-info" onclick="openRoom(${index})">
          <h3>${room.name}</h3>
          <p>Макс. очков: ${room.maxPoints}</p>
        </div>
        <button onclick="openDeleteRoomModal(${index})">
          <span class="material-icons">delete</span>
        </button>
      </li>
    `
    )
    .join("");
}

// Создание комнаты
createRoomForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const roomName = roomNameInput.value.trim();
  const maxPoints = parseInt(maxPointsInput.value.trim(), 10);

  if (roomName && maxPoints > 0) {
    const newRoom = { name: roomName, maxPoints: maxPoints, players: [] };
    rooms.push(newRoom);
    saveToLocalStorage();
    renderRooms();
    roomNameInput.value = "";
    maxPointsInput.value = "";

    // Переход на страницу списка комнат
    document.querySelector(".page.active").classList.remove("active");
    document.getElementById("room-list").classList.add("active");

    // Обновляем активную кнопку в навбаре
    navButtons.forEach((btn) => btn.classList.remove("active"));
    document.querySelector(`.nav-btn[data-target="room-list"]`).classList.add("active");
  } else {
    showHint("Введите корректные данные.");
  }
});


// Открытие комнаты
function openRoom(index) {
  currentRoomIndex = index;
  const room = rooms[index];
  roomTitle.textContent = room.name;
  roomMaxPoints.textContent = room.maxPoints;
  renderRoomPlayers();
  document.querySelector(".page.active").classList.remove("active");
  roomDetailsSection.classList.add("active");
}

let isSortingEnabled = true; // Сортировка включена по умолчанию

// Переключатель сортировки
const sortToggle = document.getElementById("sort-toggle");
sortToggle.addEventListener("change", (event) => {
  isSortingEnabled = event.target.checked; // Обновляем состояние сортировки
  renderRoomPlayers(); // Перерисовываем игроков
});

// Функция для отображения игроков в комнате
function renderRoomPlayers() {
  const room = rooms[currentRoomIndex];
  let players = [...room.players];

  if (isSortingEnabled) {
    players.sort((a, b) => b.score - a.score);
  }

  roomPlayersList.innerHTML = players
    .map(
      (player, playerIndex) => `
      <div class="card">
        <div class="card-info">
          <h3>${player.name}</h3>
          <p>Очки: <strong>${player.score}</strong></p>
        </div>
        <div class="controls">
          <button onclick="openDeletePlayerModal(${playerIndex})" class="delete-btn">
            <span class="material-icons">delete</span>
          </button>
          <button onclick="openAddPointsModal(${playerIndex})" class="add-btn">
            <span class="material-icons">add</span>
          </button>
        </div>
      </div>
    `
    )
    .join("");
}



// Добавление игрока с уникальным ID
function addPlayer(name) {
  return {
    id: Date.now(), // Уникальный идентификатор
    name,
    score: 0,
  };
}

// Добавление игрока
addPlayerToRoomBtn.addEventListener("click", () => {
  openModal(modalAddPlayer, playerNameInput);
});

// Добавление игрока
addPlayerConfirm.addEventListener("click", () => {
  const playerName = playerNameInput.value.trim();
  
  // Проверяем, существует ли уже игрок с таким именем в текущей комнате
  const room = rooms[currentRoomIndex];
  const isDuplicateName = room.players.some(
    (player) => player.name.toLowerCase() === playerName.toLowerCase()
  );

  if (isDuplicateName) {
    showHint("Игрок с таким именем уже существует в этой комнате. Пожалуйста, выберите другое имя.");
    return; // Прерываем добавление игрока
  }

  if (playerName) {
    room.players.push({ name: playerName, score: 0, history: [] });
    saveToLocalStorage();
    renderRoomPlayers();
    playerNameInput.value = "";
    closeModal(modalAddPlayer);
  } else {
    showHint("Введите имя игрока.");
  }
});


// Открытие модального окна для добавления очков
function openAddPointsModal(playerIndex) {
  currentPlayerIndex = playerIndex;
  const room = rooms[currentRoomIndex];
  const player = room.players[playerIndex];

  if (!player) {
    showHint("Игрок не найден!");
    return;
  }

  playerPointsInput.value = "";
  renderPlayerHistory(playerIndex);
  openModal(modalAddPoints, playerPointsInput);

  // Обновляем отображение истории, если она есть
  const historyContainer = document.getElementById("player-history");
  if (historyContainer) {
    historyContainer.innerHTML = player.history
      .map(
        (entry) =>
          `<p>Добавлено ${entry.points} очков - ${new Date(
            entry.date
          ).toLocaleString()}</p>`
      )
      .join("");
  }

}

function renderPlayerHistory(playerIndex) {
  const room = rooms[currentRoomIndex];
  const player = room.players[playerIndex];
  const historyList = document.getElementById("player-history-list");

  if (player.history && player.history.length > 0) {
    historyList.innerHTML = player.history
      .map((entry, index) => `<li>Добавлено: <strong>${entry}</strong> очков</li>`)
      .join("");
  } else {
    historyList.innerHTML = "<li>История отсутствует</li>";
  }
}


// Добавление очков игроку
addPointsConfirm.addEventListener("click", () => {
  const points = parseInt(playerPointsInput.value.trim(), 10);
  if (!isNaN(points)) {
    const room = rooms[currentRoomIndex];
    const displayedPlayers = isSortingEnabled
      ? [...room.players].sort((a, b) => b.score - a.score)
      : room.players;

    const player = displayedPlayers[currentPlayerIndex];
    const originalPlayerIndex = room.players.findIndex(p => p.name === player.name);

    if (originalPlayerIndex !== -1) {
      const originalPlayer = room.players[originalPlayerIndex];

      // Обновляем очки и историю
      if (!originalPlayer.history) {
        originalPlayer.history = [];
      }
      originalPlayer.score += points;
      originalPlayer.history.push(points);

      // Проверяем условия конца игры
      if (originalPlayer.score > room.maxPoints) {
        endGameMessage.textContent = `Проиграл ${originalPlayer.name} с ${originalPlayer.score} очками`;
        modalEndGame.style.display = "flex";
      } else if (originalPlayer.score === room.maxPoints) {
        originalPlayer.score = 0; // Сброс очков
      }

      saveToLocalStorage(); // Сохраняем изменения
      renderRoomPlayers(); // Обновляем интерфейс
      closeModal(modalAddPoints); // Закрываем модальное окно
    } else {
      console.error("Игрок не найден в оригинальном списке.");
    }
  } else {
    showHint("Введите корректное число.");
  }
});



// Обработка конца игры
restartGameBtn.addEventListener("click", () => {
  const room = rooms[currentRoomIndex];
  saveGameHistory();
  room.players = room.players.map((player) => ({ ...player, score: 0 }));
  saveToLocalStorage();
  renderRoomPlayers();
  
  modalEndGame.style.display = "none";
});

// Сброс очков игроков
resetScoresBtn.addEventListener("click", () => {
  openModal(modalResetScores);
});

resetScoresConfirm.addEventListener("click", () => {
  rooms[currentRoomIndex].players = rooms[currentRoomIndex].players.map((player) => ({
    ...player,
    score: 0,
  }));
  saveToLocalStorage();
  renderRoomPlayers();
  closeModal(modalResetScores);
});

// Удаление игрока
function openDeletePlayerModal(playerIndex) {
  currentPlayerIndex = playerIndex; // Сохраняем оригинальный индекс игрока
  modalDeletePlayer.style.display = "flex";
}


deletePlayerConfirm.addEventListener("click", () => {
  const room = rooms[currentRoomIndex];
  if (room && currentPlayerIndex !== null) {
    room.players.splice(currentPlayerIndex, 1); // Удаляем только одного игрока
    saveToLocalStorage();
    renderRoomPlayers();
    modalDeletePlayer.style.display = "none";
  } else {
    showHint("Ошибка при удалении игрока!");
  }
});


deletePlayerCancel.addEventListener("click", () => {
  modalDeletePlayer.style.display = "none";
});

// Функция миграции данных
function migrateData() {
  // Получаем существующие комнаты
  let rooms = JSON.parse(localStorage.getItem("rooms")) || [];

// Обновление структуры игроков при загрузке данных
  rooms.forEach(room => {
    room.players.forEach(player => {
      if (!player.history) {
        player.history = [];
      }
    });
  });
  saveToLocalStorage(); // Сохраняем обновлённые данные


  // Сохраняем обновленные данные обратно в localStorage
  localStorage.setItem("rooms", JSON.stringify(rooms));
}

// Генерация уникального ID
function generateUniqueId() {
  return `player-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

// Выполняем миграцию при загрузке приложения
document.addEventListener("DOMContentLoaded", () => {
  migrateData();
});


let gameHistory = JSON.parse(localStorage.getItem("gameHistory")) || [];
// Получаем общий номер игры из localStorage или устанавливаем его на 0
let globalGameNumber = JSON.parse(localStorage.getItem("globalGameNumber")) || 0;

// Функция для сохранения истории
function saveGameHistory() {
  const room = rooms[currentRoomIndex];
  const sortedPlayers = [...room.players].sort((a, b) => b.score - a.score);

  // Увеличиваем глобальный номер игры
  globalGameNumber += 1;

  const historyEntry = {
    globalGameNumber, // Используем глобальный номер игры
    roomName: room.name,
    players: sortedPlayers.map((player, index, array) => ({
      name: player.name,
      score: player.score,
      emoji:
        index === 0
          ? "💀" // Проигравший (с наименьшим числом очков)
          : index === array.length - 1
          ? "🏆" // Победитель (с наибольшим числом очков)
          : index === array.length - 2
          ? "🥶" // Второй с конца
          : "🎯", // Промежуточные игроки
    })),
  };

  // Сохраняем запись в истории
  gameHistory.push(historyEntry);

  // Обновляем localStorage
  localStorage.setItem("gameHistory", JSON.stringify(gameHistory));
  localStorage.setItem("globalGameNumber", JSON.stringify(globalGameNumber));
}


function renderGameHistory() {
  const historyContainer = document.getElementById("history-container");

  if (!gameHistory || gameHistory.length === 0) {
    historyContainer.innerHTML = "<p>История игр отсутствует.</p>";
    return;
  }

  // Сортируем историю по глобальному номеру игры
  const sortedHistory = gameHistory.sort((a, b) => b.globalGameNumber - a.globalGameNumber);

  historyContainer.innerHTML = sortedHistory
    .map(
      (entry) => `
      <div class="history-card">
        <h2>#${entry.globalGameNumber} ${entry.roomName}</h2>
        <ul>
          ${entry.players
            .map(
              (player) => `
              <li>
                ${player.emoji} <strong>${player.name}</strong> — ${player.score} очков
              </li>
            `
            )
            .join("")}
        </ul>
      </div>
    `
    )
    .join("");
}






document.getElementById("history-btn").addEventListener("click", () => {
  console.log("Кнопка История нажата");
  // document.querySelector(".page.active").classList.remove("active");
  document.getElementById("history-page").classList.add("active");
  renderGameHistory(); // Рендерим историю
});





// Удаление комнаты
function openDeleteRoomModal(index) {
  currentRoomIndex = index;
  modalDeleteRoom.style.display = "flex";
}

deleteRoomConfirm.addEventListener("click", () => {
  rooms.splice(currentRoomIndex, 1);
  saveToLocalStorage();
  renderRooms();
  modalDeleteRoom.style.display = "none";
  document.querySelector(".page.active").classList.remove("active");
  document.getElementById("room-list").classList.add("active");
});

deleteRoomCancel.addEventListener("click", () => {
  modalDeleteRoom.style.display = "none";
});

// Открытие и закрытие модальных окон
function openModal(modal, inputField = null) {
  modal.style.display = "flex";
  if (inputField) {
    setTimeout(() => {
      inputField.focus();
    }, 50);
  }
}

function closeModal(modal) {
  modal.style.display = "none";
}

// Функция для проверки введённых данных
function validateInput(input) {
  const maxLength = 15;
  const regex = /^[\p{L}\p{N}\s\p{Emoji_Presentation}]*$/u; // Разрешены буквы, цифры, пробелы и эмодзи

  // Ограничиваем длину
  if (input.value.length > maxLength) {
    input.value = input.value.substring(0, maxLength);
    showHint(`Максимум ${maxLength} символов.`);
    input.style.border = "2px solid red";
    return;
  }

  // Проверяем на недопустимые символы
  if (!regex.test(input.value)) {
    input.value = input.value.replace(/[^\p{L}\p{N}\s\p{Emoji_Presentation}]/gu, "");
    showHint("Спецсимволы запрещены, кроме эмодзи.");
    input.style.border = "2px solid red";
  } else {
    // Убираем красный бордер, если всё корректно
    input.style.border = "";
  }
}

// Добавляем обработчики событий для всех инпутов
document.addEventListener("DOMContentLoaded", () => {
  const inputs = document.querySelectorAll("input[type='text'], input[type='number']");

  inputs.forEach((input) => {
    // Проверка при вводе
    input.addEventListener("input", () => {
      validateInput(input);
    });

    // Проверка при потере фокуса
    input.addEventListener("blur", () => {
      validateInput(input);
    });
  });
});

// Функция для показа всплывающего сообщения
function showHint(message) {
  const hintContainer = document.getElementById("hint-container");
  hintContainer.textContent = message;
  hintContainer.style.display = "block";

  setTimeout(() => {
    hintContainer.style.display = "none";
  }, 3000);
}


// Смена темы
function initializeTheme() {
  const savedTheme = localStorage.getItem("theme") || "default";
  applyTheme(savedTheme);
}

function applyTheme(theme) {
  document.documentElement.className = theme;
  localStorage.setItem("theme", theme);
}

// Обработка изменения темы через селектор
document.getElementById("theme-selector").addEventListener("change", (event) => {
  applyTheme(event.target.value);
});

initializeTheme();

themeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const selectedTheme = button.dataset.theme;
    applyTheme(selectedTheme);
    localStorage.setItem("theme", selectedTheme);
  });
});

const customSelect = document.querySelector(".custom-select");
const customSelectTrigger = customSelect.querySelector(".custom-select-trigger");
const customOptions = customSelect.querySelector(".custom-options");
const hiddenSelect = document.getElementById("theme-selector");
const options = customOptions.querySelectorAll(".custom-option");

/**
 * Функция ставит .active на опцию с нужным data-value
 * и обновляет текст в триггере.
 */
function setActiveOption(value) {
  // Убираем .active со всех опций
  options.forEach((opt) => opt.classList.remove("active"));

  // Ищем опцию, которая соответствует value
  const matchedOption = [...options].find(
    (opt) => opt.getAttribute("data-value") === value
  );

  if (matchedOption) {
    // Ставим .active
    matchedOption.classList.add("active");
    // Обновляем текст триггера
    customSelectTrigger.querySelector("span").textContent =
      matchedOption.textContent;
    // Синхронизируем скрытый <select>
    hiddenSelect.value = value;
  }
}

/**
 * При клике на .custom-select-trigger — переключаем класс .open
 * чтобы показать/скрыть список
 */
customSelectTrigger.addEventListener("click", () => {
  customSelect.classList.toggle("open");

  // Если открываем список, подсвечиваем актуальную опцию
  if (customSelect.classList.contains("open")) {
    setActiveOption(hiddenSelect.value);
  }
});

/**
 * При клике вне селектора — скрываем список
 */
document.addEventListener("click", (e) => {
  if (!customSelect.contains(e.target)) {
    customSelect.classList.remove("open");
  }
});

/**
 * При клике на конкретный вариант
 */
options.forEach((option) => {
  option.addEventListener("click", () => {
    // Считываем значение
    const newValue = option.getAttribute("data-value");

    // Устанавливаем .active и синхронизируем <select>
    setActiveOption(newValue);

    // Закрываем список
    customSelect.classList.remove("open");

    // Вызываем смену темы (внутри можно также сохранять в localStorage)
    applyTheme(newValue);
  });
});

/* 
Если нужно, чтобы при загрузке страницы 
сразу была активирована тема из localStorage:
(предположим, она хранится как "theme" в localStorage)
*/
document.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme") || "default";
  
  // Применение темы только если функция applyTheme определена
  if (typeof applyTheme === "function") {
    applyTheme(savedTheme);
  }
  
  
  // Инициализация других элементов с проверками
  const themeSelector = document.getElementById("theme-selector");
  if (themeSelector) {
    themeSelector.value = savedTheme;
    themeSelector.addEventListener("change", (event) => {
      applyTheme(event.target.value);
    });
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const themeSelector = document.getElementById("theme-selector");
  const customOptions = document.querySelectorAll(".custom-option.new");

  // При смене темы через стандартный селектор
  if (themeSelector) {
    themeSelector.addEventListener("change", (event) => {
      const selectedOption = themeSelector.options[themeSelector.selectedIndex];
      if (selectedOption.classList.contains("new")) {
        selectedOption.classList.remove("new"); // Убираем класс new
      }
    });
  }

  // При выборе темы в кастомном меню
  customOptions.forEach((option) => {
    option.addEventListener("click", () => {
      if (option.classList.contains("new")) {
        option.classList.remove("new"); // Убираем класс new
        const indicator = option.querySelector(".indicator");
        if (indicator) {
          indicator.remove(); // Убираем индикатор
        }
      }
    });
  });
});




// Закрытие модальных окон для всех кнопок "Отмена" или "Нет"
resetScoresCancel.addEventListener("click", () => {
  closeModal(modalResetScores);
});

deletePlayerCancel.addEventListener("click", () => {
  closeModal(modalDeletePlayer);
});

deleteRoomCancel.addEventListener("click", () => {
  closeModal(modalDeleteRoom);
});

document.querySelectorAll("#modal-cancel").forEach((button) => {
  button.addEventListener("click", () => {
    closeModal(modalAddPlayer);
    closeModal(modalAddPoints);
  });
});

// Автопрокрутка карусели
const carousel = document.querySelector('.carousel');
let scrollAmount = 0;
setInterval(() => {
  
  scrollAmount += carousel.offsetWidth - 33;
  if (scrollAmount >= carousel.scrollWidth) {
    scrollAmount = 0;
  }
  carousel.scrollTo({
    left: scrollAmount,
    behavior: 'smooth',
  });
}, 7000);


const carousel1 = document.querySelector('.carousel1');
let scrollAmount1 = 0;
setInterval(() => {
  scrollAmount1 += carousel1.offsetWidth - 33;
  if (scrollAmount1 >= carousel1.scrollWidth) {
    scrollAmount1 = 0;
  }
  carousel1.scrollTo({
    left: scrollAmount1,
    behavior: 'smooth',
  });
}, 7000);

// Инициализация приложения
renderRooms();
hideLoader()

document.addEventListener('DOMContentLoaded', function () {
  const loader = document.getElementById('loader');

  // Показать лоадер
  function showLoader() {
    loader.style.display = 'flex';
  }

  // Скрыть лоадер
  function hideLoader() {
    loader.style.display = 'none';
  }

  // Показать лоадер перед обновлением страницы
  window.addEventListener('beforeunload', showLoader);

  // Показать лоадер при переходе по ссылкам
  document.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      const target = link.getAttribute('target');

      // Исключаем якорные ссылки и ссылки, открывающиеся в новой вкладке
      if (href && !href.startsWith('#') && target !== '_blank') {
        e.preventDefault();
        showLoader();

        // Синхронизация с длительностью анимации
        setTimeout(() => {
          window.location.href = href;
        }, 2000); // Время задержки соответствует CSS-анимации (2s)
      }
    });
  });

  // Скрыть лоадер после загрузки страницы
  window.addEventListener('load', hideLoader);
});

function navigateTo(pageId) {
  document.querySelector(".page.active").classList.remove("active");
  document.getElementById(pageId).classList.add("active");
}



// Открыть модальное окно
document.getElementById("clear-cache-btn").addEventListener("click", () => {
  clearCacheModal.style.display = "block";
});

// Закрыть модальное окно
cancelClearCache.addEventListener("click", () => {
  clearCacheModal.style.display = "none";
});

// Подтверждение очистки
confirmClearCache.addEventListener("click", () => {
  // Очистка localStorage, sessionStorage и других кэшей
  localStorage.clear();
  sessionStorage.clear();
  caches.keys().then((names) => {
    for (let name of names) caches.delete(name);
  });

  // Показ уведомления через showHint
  showHint("Кэш успешно очищен. Перезагрузка...");

  // Задержка перед перезагрузкой
  setTimeout(() => {
    location.reload();
  }, 2000);

  // Закрыть модальное окно
  clearCacheModal.style.display = "none";
});


window.addEventListener('resize', () => {
  const inputField = document.activeElement;

  // Если клавиатура открылась
  if (inputField.tagName === 'INPUT' || inputField.tagName === 'TEXTAREA') {
      inputField.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
});



document.getElementById("theme-selector").addEventListener("change", (event) => {
  applyTheme(event.target.value);
});

initializeTheme();
