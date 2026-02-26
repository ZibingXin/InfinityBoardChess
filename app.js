const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");
const statusEl = document.getElementById("status");
const coordsEl = document.getElementById("coords");
const presetSelect = document.getElementById("preset");
const loadPresetBtn = document.getElementById("loadPreset");
const clearBtn = document.getElementById("clearBoard");
const paletteEl = document.getElementById("palette");
const placeToggleBtn = document.getElementById("placeToggleBtn");
const langToggleBtn = document.getElementById("langToggle");
const panelToggleBtn = document.getElementById("panelToggle");
const appRoot = document.querySelector(".app");

const IMG_PATH = {
  wk: "img/wk.png",
  wq: "img/wq.png",
  wr: "img/wr.png",
  wb: "img/wb.png",
  wn: "img/wn.png",
  wp: "img/wp.png",
  bk: "img/bk.png",
};

const PIECE_TYPES = [
  { id: "wk", label: "白王", labelEn: "White King" },
  { id: "wq", label: "白后", labelEn: "White Queen" },
  { id: "wr", label: "白车", labelEn: "White Rook" },
  { id: "wb", label: "白象", labelEn: "White Bishop" },
  { id: "wn", label: "白马", labelEn: "White Knight" },
  { id: "wp", label: "白兵", labelEn: "White Pawn" },
  { id: "bk", label: "黑王", labelEn: "Black King" },
];

const PRESETS = [
  { name: "Two Queens", nameZh: "双后", pieces: { wq: 2 } },
  { name: "Queen + Rook", nameZh: "后 + 车", pieces: { wq: 1, wr: 1 } },
  { name: "Queen + Bishop", nameZh: "后 + 象", pieces: { wq: 1, wb: 1 } },
  { name: "Queen + Knight", nameZh: "后 + 马", pieces: { wq: 1, wn: 1 } },
  { name: "Two Rooks", nameZh: "双车", pieces: { wr: 2 } },
  {
    name: "Rook + Two Bishops (Opposite Colors)",
    nameZh: "车 + 双象（异色）",
    pieces: { wr: 1, wb: 2 },
    bishopParity: [0, 1],
  },
  {
    name: "Rook + Two Bishops (Same Color)",
    nameZh: "车 + 双象（同色）",
    pieces: { wr: 1, wb: 2 },
    bishopParity: [0, 0],
  },
  { name: "Rook + Knight + Bishop", nameZh: "车 + 马 + 象", pieces: { wr: 1, wn: 1, wb: 1 } },
  { name: "Rook + Two Knights", nameZh: "车 + 双马", pieces: { wr: 1, wn: 2 } },
  {
    name: "Two Bishops (One Color) + Two Bishops (Other Color)",
    nameZh: "同色双象 + 异色双象",
    pieces: { wb: 4 },
    bishopParity: [0, 0, 1, 1],
  },
  {
    name: "Two Bishops (One Color) + Bishop (Other Color) + Knight",
    nameZh: "同色双象 + 异色象 + 马",
    pieces: { wb: 3, wn: 1 },
    bishopParity: [0, 0, 1],
  },
  {
    name: "Bishop (Each Color) + Two Knights",
    nameZh: "异色双象 + 双马",
    pieces: { wb: 2, wn: 2 },
    bishopParity: [0, 1],
  },
];

const I18N = {
  zh: {
    page_title: "无限棋盘将死验证",
    preset_label: "预设组合",
    load_preset: "加载组合",
    clear_board: "清空棋盘",
    bishop_hint: "注：象的颜色由落点格子决定，可自行摆成同色或异色",
    place_title: "放置棋子",
    place_hint: "提示：选中棋子后点击空白格放置；右键拖拽可画辅助箭头（放置关闭时）",
    status_title: "状态",
    ops_title: "操作",
    ops_hint1: "拖拽棋子移动；滚轮缩放；按住鼠标中键拖拽平移",
    ops_hint2: "左键点击清除全部箭头；坐标系中心为 (0,0)",
    github_link: "GitHub 项目页",
    status_missing_black: "缺少黑王",
    status_missing_white: "缺少白王",
    status_illegal_white: "非法局面（白王被将军）",
    status_illegal_adjacent: "非法局面（王相邻）",
    status_checkmate: "将死 ✅",
    status_check: "将军",
    status_none: "未将军",
    panel_hide: "隐藏菜单",
    panel_show: "显示菜单",
  },
  en: {
    page_title: "Infinity Board Checkmate",
    preset_label: "Presets",
    load_preset: "Load Preset",
    clear_board: "Clear Board",
    bishop_hint: "Note: bishop color depends on square color (place as same or opposite).",
    place_title: "Placement",
    place_hint: "Tip: select a piece then click an empty square to place; right-drag draws arrows (when placement is off).",
    status_title: "Status",
    ops_title: "Controls",
    ops_hint1: "Drag pieces; wheel to zoom; hold middle mouse to pan",
    ops_hint2: "Left click clears all arrows; center is (0,0)",
    github_link: "GitHub Repository",
    status_missing_black: "Missing black king",
    status_missing_white: "Missing white king",
    status_illegal_white: "Illegal (white king in check)",
    status_illegal_adjacent: "Illegal (kings adjacent)",
    status_checkmate: "Checkmate ✅",
    status_check: "Check",
    status_none: "No check",
    panel_hide: "Hide Menu",
    panel_show: "Show Menu",
  },
};

const PLACEMENT_ORDER = [
  { x: -4, y: 2 }, { x: -3, y: 2 }, { x: -2, y: 2 }, { x: -1, y: 2 }, { x: 0, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 }, { x: 3, y: 2 }, { x: 4, y: 2 },
  { x: -4, y: 1 }, { x: -3, y: 1 }, { x: -2, y: 1 }, { x: -1, y: 1 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }, { x: 4, y: 1 },
  { x: -4, y: 0 }, { x: -3, y: 0 }, { x: -2, y: 0 }, { x: -1, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 },
  { x: -4, y: -1 }, { x: -3, y: -1 }, { x: -2, y: -1 }, { x: -1, y: -1 }, { x: 0, y: -1 }, { x: 1, y: -1 }, { x: 2, y: -1 }, { x: 3, y: -1 }, { x: 4, y: -1 },
  { x: -4, y: -2 }, { x: -3, y: -2 }, { x: -2, y: -2 }, { x: -1, y: -2 }, { x: 0, y: -2 }, { x: 1, y: -2 }, { x: 2, y: -2 }, { x: 3, y: -2 }, { x: 4, y: -2 },
];

const images = {};
let selectedPiece = "wk";
let allowPlace = false;
let currentLang = "zh";
let panelVisible = true;

let view = {
  scale: 72,
  panX: 0,
  panY: 0,
};

let board = new Map();
let dragging = null;
let isPanning = false;
let lastMouse = { x: 0, y: 0 };
let arrowDrag = null;
const arrows = [];

function key(x, y) {
  return `${x},${y}`;
}

function setPiece(x, y, piece) {
  board.set(key(x, y), { ...piece, x, y });
}

function removePiece(x, y) {
  board.delete(key(x, y));
}

function getPiece(x, y) {
  return board.get(key(x, y));
}

function loadImages() {
  const entries = Object.entries(IMG_PATH);
  return Promise.all(
    entries.map(([id, src]) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          images[id] = img;
          resolve();
        };
        img.src = src;
      });
    })
  );
}

function resize() {
  canvas.width = canvas.clientWidth * devicePixelRatio;
  canvas.height = canvas.clientHeight * devicePixelRatio;
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  draw();
}

function worldToScreen(x, y) {
  return {
    x: x * view.scale + view.panX + canvas.clientWidth / 2,
    y: -y * view.scale + view.panY + canvas.clientHeight / 2,
  };
}

function screenToWorld(x, y) {
  return {
    x: (x - canvas.clientWidth / 2 - view.panX) / view.scale,
    y: -(y - canvas.clientHeight / 2 - view.panY) / view.scale,
  };
}

function draw() {
  ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

  const topLeft = screenToWorld(0, 0);
  const bottomRight = screenToWorld(canvas.clientWidth, canvas.clientHeight);

  const minX = Math.floor(topLeft.x) - 1;
  const maxX = Math.ceil(bottomRight.x) + 1;
  const minY = Math.floor(bottomRight.y) - 1;
  const maxY = Math.ceil(topLeft.y) + 1;

  for (let x = minX; x <= maxX; x++) {
    for (let y = minY; y <= maxY; y++) {
      const screen = worldToScreen(x, y);
      const light = (x + y) % 2 === 0;
      ctx.fillStyle = light ? "#f7ead8" : "#d9b48a";
      ctx.fillRect(
        screen.x - view.scale / 2,
        screen.y - view.scale / 2,
        view.scale,
        view.scale
      );

      if (x === minX || y === maxY) {
        ctx.fillStyle = "#6b5c4f";
        ctx.font = "10px serif";
        if (y === maxY) {
          ctx.fillText(`${x}`, screen.x - view.scale / 2 + 4, screen.y - view.scale / 2 + 12);
        }
        if (x === minX) {
          ctx.fillText(`${y}`, screen.x - view.scale / 2 + 4, screen.y - view.scale / 2 + 12);
        }
      }
    }
  }

  board.forEach((piece) => {
    if (dragging && dragging.piece === piece) return;
    drawPiece(piece.x, piece.y, piece.id);
  });

  if (dragging) {
    drawPieceAtScreen(dragging.screenX, dragging.screenY, dragging.piece.id, 0.9);
  }

  drawArrows();
}

function drawPiece(x, y, id) {
  const screen = worldToScreen(x, y);
  drawPieceAtScreen(screen.x, screen.y, id, 1);
}

function drawPieceAtScreen(cx, cy, id, alpha) {
  const img = images[id];
  if (!img) return;
  const size = view.scale * 0.86;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.drawImage(img, cx - size / 2, cy - size / 2, size, size);
  ctx.restore();
}

function drawArrows() {
  const all = arrowDrag ? [...arrows, arrowDrag] : arrows;
  if (all.length === 0) return;

  ctx.save();
  ctx.lineWidth = Math.max(2, view.scale * 0.08);
  ctx.strokeStyle = "rgba(196, 44, 44, 0.85)";
  ctx.fillStyle = "rgba(196, 44, 44, 0.85)";
  ctx.lineCap = "round";

  all.forEach((arrow) => {
    const from = worldToScreen(arrow.from.x, arrow.from.y);
    const to = worldToScreen(arrow.to.x, arrow.to.y);

    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();

    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    const headLen = view.scale * 0.35;
    ctx.beginPath();
    ctx.moveTo(to.x, to.y);
    ctx.lineTo(
      to.x - headLen * Math.cos(angle - Math.PI / 6),
      to.y - headLen * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
      to.x - headLen * Math.cos(angle + Math.PI / 6),
      to.y - headLen * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fill();
  });

  ctx.restore();
}

function updateStatus() {
  const code = evaluateCheckmate();
  statusEl.textContent = I18N[currentLang][code] ?? code;
}

function pieceAtMouse(x, y) {
  const w = screenToWorld(x, y);
  const gx = Math.round(w.x);
  const gy = Math.round(w.y);
  const piece = getPiece(gx, gy);
  return { piece, gx, gy };
}

function setPresetOptions() {
  presetSelect.innerHTML = "";
  PRESETS.forEach((preset, index) => {
    const opt = document.createElement("option");
    opt.value = index;
    opt.textContent = currentLang === "zh" ? preset.nameZh : preset.name;
    presetSelect.appendChild(opt);
  });
}

function loadPreset(index) {
  board.clear();
  const preset = PRESETS[index];
  const pieces = { ...preset.pieces };

  setPiece(0, 0, { id: "wk", color: "w", type: "k" });
  setPiece(4, 4, { id: "bk", color: "b", type: "k" });

  const occupied = new Set([...board.keys()]);
  const order = ["wq", "wr", "wb", "wn", "wp"];

  const takeSpot = (parity) => {
    for (const spot of PLACEMENT_ORDER) {
      const k = key(spot.x, spot.y);
      if (occupied.has(k)) continue;
      if (parity !== undefined) {
        const isEven = (spot.x + spot.y) % 2 === 0;
        if ((parity === 0 && !isEven) || (parity === 1 && isEven)) continue;
      }
      occupied.add(k);
      return spot;
    }
    return null;
  };

  const place = (id, count) => {
    for (let i = 0; i < count; i++) {
      const spot = takeSpot();
      if (!spot) return;
      setPiece(spot.x, spot.y, { id, color: "w", type: id[1] });
    }
  };

  if (preset.bishopParity && pieces.wb) {
    const needed = preset.bishopParity.length;
    const count = Math.min(needed, pieces.wb);
    for (let i = 0; i < count; i++) {
      const spot = takeSpot(preset.bishopParity[i]);
      if (!spot) break;
      setPiece(spot.x, spot.y, { id: "wb", color: "w", type: "b" });
      pieces.wb -= 1;
    }
  }

  order.forEach((id) => {
    const count = pieces[id] ?? 0;
    if (count > 0) place(id, count);
  });

  updateStatus();
  draw();
}

function clearBoard() {
  board.clear();
  updateStatus();
  draw();
}

function buildPalette() {
  paletteEl.innerHTML = "";
  PIECE_TYPES.forEach((piece) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "piece-btn";
    btn.title = currentLang === "zh" ? piece.label : piece.labelEn;
    btn.dataset.id = piece.id;
    if (piece.id === selectedPiece) btn.classList.add("active");
    const img = document.createElement("img");
    img.src = IMG_PATH[piece.id];
    img.alt = currentLang === "zh" ? piece.label : piece.labelEn;
    btn.appendChild(img);
    btn.addEventListener("click", () => {
      selectedPiece = piece.id;
      document
        .querySelectorAll(".piece-btn")
        .forEach((el) => el.classList.remove("active"));
      btn.classList.add("active");
    });
    paletteEl.appendChild(btn);
  });
}

function placePieceAt(x, y) {
  const id = selectedPiece;
  const color = id[0];
  const type = id[1];
  setPiece(x, y, { id, color, type });
  updateStatus();
  draw();
}

canvas.addEventListener("mousedown", (e) => {
  if (e.button === 2) {
    if (!allowPlace) {
      const w = screenToWorld(e.offsetX, e.offsetY);
      arrowDrag = {
        from: { x: Math.round(w.x), y: Math.round(w.y) },
        to: { x: Math.round(w.x), y: Math.round(w.y) },
      };
      draw();
    }
    return;
  }

  if (e.button === 1) {
    isPanning = true;
    lastMouse = { x: e.offsetX, y: e.offsetY };
    return;
  }

  if (e.button === 0 && arrows.length > 0) {
    arrows.length = 0;
    draw();
  }

  if (isPanning) {
    lastMouse = { x: e.offsetX, y: e.offsetY };
    return;
  }

  const { piece, gx, gy } = pieceAtMouse(e.offsetX, e.offsetY);
  if (piece) {
    dragging = {
      piece,
      fromX: gx,
      fromY: gy,
      screenX: e.offsetX,
      screenY: e.offsetY,
    };
    removePiece(gx, gy);
  } else {
    if (allowPlace) placePieceAt(gx, gy);
  }
});

canvas.addEventListener("mousemove", (e) => {
  coordsEl.textContent = (() => {
    const w = screenToWorld(e.offsetX, e.offsetY);
    return `x: ${Math.round(w.x)}, y: ${Math.round(w.y)}`;
  })();

  if (isPanning) {
    const dx = e.offsetX - lastMouse.x;
    const dy = e.offsetY - lastMouse.y;
    view.panX += dx;
    view.panY += dy;
    lastMouse = { x: e.offsetX, y: e.offsetY };
    draw();
    return;
  }

  if (arrowDrag) {
    const w = screenToWorld(e.offsetX, e.offsetY);
    arrowDrag.to = { x: Math.round(w.x), y: Math.round(w.y) };
    draw();
    return;
  }

  if (dragging) {
    dragging.screenX = e.offsetX;
    dragging.screenY = e.offsetY;
    draw();
  }
});

canvas.addEventListener("mouseup", (e) => {
  if (e.button === 1) {
    isPanning = false;
    return;
  }

  if (e.button === 2 && arrowDrag) {
    arrows.push(arrowDrag);
    arrowDrag = null;
    draw();
    return;
  }

  if (dragging) {
    const w = screenToWorld(e.offsetX, e.offsetY);
    const gx = Math.round(w.x);
    const gy = Math.round(w.y);
    setPiece(gx, gy, dragging.piece);
    dragging = null;
    updateStatus();
    draw();
  }
});

canvas.addEventListener("mouseleave", () => {
  if (dragging) {
    setPiece(dragging.fromX, dragging.fromY, dragging.piece);
    dragging = null;
    updateStatus();
    draw();
  }
  if (arrowDrag) {
    arrowDrag = null;
    draw();
  }
});

canvas.addEventListener("contextmenu", (e) => {
  e.preventDefault();
  if (!allowPlace) return;
  const { piece, gx, gy } = pieceAtMouse(e.offsetX, e.offsetY);
  if (piece) {
    removePiece(gx, gy);
    updateStatus();
    draw();
  }
});

canvas.addEventListener("wheel", (e) => {
  e.preventDefault();
  const scaleDelta = e.deltaY > 0 ? 0.9 : 1.1;
  const world = screenToWorld(e.offsetX, e.offsetY);
  view.scale = Math.min(140, Math.max(32, view.scale * scaleDelta));
  view.panX = e.offsetX - canvas.clientWidth / 2 - world.x * view.scale;
  view.panY = e.offsetY - canvas.clientHeight / 2 + world.y * view.scale;
  draw();
});

window.addEventListener("keydown", (e) => {
  if (e.code === "Space") isPanning = true;
});

window.addEventListener("keyup", (e) => {
  if (e.code === "Space") isPanning = false;
});

function evaluateCheckmate() {
  const blackKing = [...board.values()].find((p) => p.id === "bk");
  const whiteKing = [...board.values()].find((p) => p.id === "wk");
  if (!blackKing) return "status_missing_black";
  if (!whiteKing) return "status_missing_white";

  if (isSquareAttacked(whiteKing.x, whiteKing.y, "b")) {
    return "status_illegal_white";
  }

  if (
    Math.abs(blackKing.x - whiteKing.x) <= 1 &&
    Math.abs(blackKing.y - whiteKing.y) <= 1
  ) {
    return "status_illegal_adjacent";
  }

  const inCheck = isSquareAttacked(blackKing.x, blackKing.y, "w");
  const legalMoves = kingMoves(blackKing.x, blackKing.y).filter((move) => {
    const occupant = getPiece(move.x, move.y);
    if (occupant && occupant.color === "b") return false;
    if (occupant && occupant.id === "wk") return false;

    const ignorePieces = new Set();
    if (occupant && occupant.color === "w") ignorePieces.add(occupant);

    const ignoreSquares = new Set([key(blackKing.x, blackKing.y)]);

    if (
      isSquareAttacked(move.x, move.y, "w", {
        ignorePieces,
        ignoreSquares,
      })
    ) {
      return false;
    }
    return true;
  });

  if (inCheck && legalMoves.length === 0) return "status_checkmate";
  if (inCheck) return "status_check";
  return "status_none";
}

function isSquareAttacked(x, y, attackerColor, options) {
  const ignorePieces = options?.ignorePieces ?? new Set();
  const ignoreSquares = options?.ignoreSquares ?? new Set();
  const pieces = [...board.values()];
  for (const piece of pieces) {
    if (ignorePieces.has(piece)) continue;
    if (piece.color !== attackerColor) continue;
    if (attacksSquare(piece, x, y, ignoreSquares, ignorePieces)) return true;
  }
  return false;
}

function attacksSquare(piece, x, y, ignoreSquares, ignorePieces) {
  const dx = x - piece.x;
  const dy = y - piece.y;
  const adx = Math.abs(dx);
  const ady = Math.abs(dy);

  if (piece.type === "k") {
    return adx <= 1 && ady <= 1 && (adx + ady > 0);
  }
  if (piece.type === "q") {
    if (dx === 0 || dy === 0 || adx === ady) {
      return clearPath(piece.x, piece.y, x, y, ignoreSquares, ignorePieces);
    }
  }
  if (piece.type === "r") {
    if (dx === 0 || dy === 0) {
      return clearPath(piece.x, piece.y, x, y, ignoreSquares, ignorePieces);
    }
  }
  if (piece.type === "b") {
    if (adx === ady) {
      return clearPath(piece.x, piece.y, x, y, ignoreSquares, ignorePieces);
    }
  }
  if (piece.type === "n") {
    return (adx === 1 && ady === 2) || (adx === 2 && ady === 1);
  }
  if (piece.type === "p") {
    const dir = piece.color === "w" ? 1 : -1;
    return dy === dir && adx === 1;
  }
  return false;
}

function clearPath(x1, y1, x2, y2, ignoreSquares, ignorePieces) {
  const dx = Math.sign(x2 - x1);
  const dy = Math.sign(y2 - y1);
  let cx = x1 + dx;
  let cy = y1 + dy;
  while (cx !== x2 || cy !== y2) {
    const k = key(cx, cy);
    if (ignoreSquares?.has(k)) {
      cx += dx;
      cy += dy;
      continue;
    }
    const piece = getPiece(cx, cy);
    if (piece && !ignorePieces?.has(piece)) return false;
    cx += dx;
    cy += dy;
  }
  return true;
}

function kingMoves(x, y) {
  const moves = [];
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      if (dx === 0 && dy === 0) continue;
      moves.push({ x: x + dx, y: y + dy });
    }
  }
  return moves;
}

loadPresetBtn.addEventListener("click", () => {
  loadPreset(parseInt(presetSelect.value, 10));
});

clearBtn.addEventListener("click", clearBoard);
placeToggleBtn.addEventListener("click", () => {
  allowPlace = !allowPlace;
  updatePlaceButton();
});

langToggleBtn.addEventListener("click", () => {
  currentLang = currentLang === "zh" ? "en" : "zh";
  applyLanguage();
});

panelToggleBtn.addEventListener("click", () => {
  panelVisible = !panelVisible;
  appRoot.classList.toggle("panel-hidden", !panelVisible);
  updatePanelButton();
  resize();
});

function init() {
  setPresetOptions();
  buildPalette();
  updatePlaceButton();
  applyLanguage();
  resize();
  loadPreset(0);

  const observer = new ResizeObserver(() => {
    resize();
  });
  observer.observe(document.querySelector(".board-wrap"));

  const portraitQuery = window.matchMedia("(orientation: portrait)");
  const applyOrientation = () => {
    appRoot.classList.toggle("panel-overlay", portraitQuery.matches);
    if (portraitQuery.matches) {
      panelVisible = false;
      appRoot.classList.add("panel-hidden");
    }
    updatePanelButton();
    resize();
  };
  applyOrientation();
  portraitQuery.addEventListener("change", applyOrientation);
}

function updatePlaceButton() {
  if (currentLang === "zh") {
    placeToggleBtn.textContent = `点击空格放置：${allowPlace ? "开" : "关"}`;
  } else {
    placeToggleBtn.textContent = `Place on empty: ${allowPlace ? "On" : "Off"}`;
  }
  placeToggleBtn.classList.toggle("active", allowPlace);
}

function updatePanelButton() {
  const dict = I18N[currentLang];
  panelToggleBtn.textContent = panelVisible ? "◀" : "▶";
  panelToggleBtn.title = panelVisible ? dict.panel_hide : dict.panel_show;
}

function applyLanguage() {
  const dict = I18N[currentLang];
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    if (dict[key]) el.textContent = dict[key];
  });

  document.title = dict.page_title ?? document.title;
  langToggleBtn.textContent = currentLang === "zh" ? "中文 / EN" : "EN / 中文";
  setPresetOptions();
  buildPalette();
  updatePlaceButton();
  updatePanelButton();
  updateStatus();
}

window.addEventListener("resize", resize);

loadImages().then(init);
