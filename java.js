window.addEventListener("load", function () {
  const loader = document.getElementById("loading-wrapper");
  const bar = document.getElementById("progress-bar");
  const text = document.getElementById("progress-text");

  let progress = 0;

  const interval = setInterval(function () {
    progress += 1;
    bar.style.width = progress + "%";
    text.textContent = progress + "%";

    if (progress >= 100) {
      clearInterval(interval);

      setTimeout(function () {
        loader.classList.add("loader-hidden");
      }, 300);
    }
  }, 20);
});

window.addEventListener("scroll", function () {
  const header = document.getElementById("heading");
  if (window.scrollY > 300) {
    header.classList.add("shrink");
  } else {
    header.classList.remove("shrink");
  }
});


function filterasistens(type) {
  const asisten = document.querySelectorAll(".asisten");
  const buttons = document.querySelectorAll(".filter-btn");

  buttons.forEach(btn => btn.classList.remove("active"));
  event.target.classList.add("active");

  asisten.forEach(asisten => {
    if (type === "all") {
      asisten.style.display = "block";
    } else if (asisten.classList.contains(type)) {
      asisten.style.display = "block";
    } else {
      asisten.style.display = "none";
    }
  });
}


const canvas = document.getElementById("simCanvas");
const ctx = canvas.getContext("2d");
const fiberSelect = document.getElementById("fiber");
const jarakSlider = document.getElementById("jarak");
const info = document.getElementById("info");


function thetaByFiber(f) {
  if (f === "smf") return 3;
  if (f === "mm50") return 7;
  if (f === "mm62") return 10;
}

function gambarAlat(d) {
  ctx.clearRect(0, 0, 750, 350);

  // Meja lab
  ctx.fillStyle = "#e6e6e6";
  ctx.fillRect(0, 280, 750, 70);

  // He-Ne Laser
  ctx.fillStyle = "#222";
  ctx.fillRect(30, 200, 120, 40);
  ctx.fillStyle = "white";
  ctx.fillText("He-Ne LASER", 45, 225);

  // Patchcord (garis spiral sederhana)
  ctx.strokeStyle = "#444";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(150, 220);
  ctx.lineTo(400, 220);
  ctx.stroke();

  // Fiber holder
  ctx.fillStyle = "#999";
  ctx.fillRect(390, 190, 30, 60);
  ctx.fillStyle = "black";
  ctx.fillText("Fiber Holder", 350, 180);

  // Screen stand
  ctx.fillStyle = "#ddd";
  const xFiber = 390;      // posisi fiber holder di canvas
  const xScreen = xFiber + d * 3;   // layar SELALU di kanan fiber
  // konversi cm → piksel visual
  ctx.fillStyle = "#ddd";
  ctx.fillRect(xScreen, 100, 80, 200);
  ctx.fillStyle = "black";
  ctx.fillText("Screen", xScreen + 20, 90);

  return xScreen;

}

function gambarSimulasi() {
  const d = parseInt(jarakSlider.value);
  const fiber = fiberSelect.value;
  const theta = thetaByFiber(fiber);

  const rad = theta * Math.PI / 180;
  const D = 2 * d * Math.tan(rad);     // diameter spot (cm)
  const NA = Math.sin(rad);        // estimasi NA

  const xScreen = gambarAlat(d);


  // Gambar spot laser
  const scale = 2;
  const visualD = D * scale;

  ctx.beginPath();
  ctx.arc(xScreen + 40, 200, visualD / 2, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,0,0,0.4)";
  ctx.fill();

  info.innerHTML = `
  <b>Hasil Simulasi:</b><br>
  Serat: ${fiber}<br>
  Jarak: ${d} cm<br>
  Sudut θ ≈ ${theta}°<br>
  Diameter spot ≈ ${D.toFixed(2)} cm<br>
  Estimasi NA ≈ ${NA.toFixed(3)}
  `;

}

// event
fiberSelect.onchange = () => { chart.data.labels = []; chart.data.datasets[0].data = []; gambarSimulasi(); };
jarakSlider.oninput = gambarSimulasi;


// jalankan awal
gambarSimulasi();


function openTab(tabName) {
  const contents = document.querySelectorAll(".tab-content");
  const buttons = document.querySelectorAll(".tab-btn");

  contents.forEach(content => {
    content.classList.remove("active");
  });

  buttons.forEach(btn => {
    btn.classList.remove("active");
  });

  document.getElementById(tabName).classList.add("active");
  event.target.classList.add("active");
}



function ubahMode() {
  let m = mode.value;

  budgetBox.classList.add("hidden");
  splitBox.classList.add("hidden");

  if (m === "budget") budgetBox.classList.remove("hidden");
  if (m === "splitter") splitBox.classList.remove("hidden");
}

function totalLoss() {
  let L = parseFloat(panjang.value);
  let a = parseFloat(lossKm.value);
  let c = parseInt(conn.value);
  let s = parseInt(splice.value);

  let loss = (L * a) + (c * 0.5) + (s * 0.1);
  return loss;
}

function hitung() {
  let m = mode.value;
  let loss = totalLoss();
  let text = "";

  if (m === "loss") {
    text = "Total Loss Link = " + loss.toFixed(2) + " dB";
  }

  else if (m === "budget") {
    let tx = parseFloat(document.getElementById("tx").value);
    let rx = parseFloat(document.getElementById("rx").value);
    let margin = tx - rx - loss;

    text = "Margin = " + margin.toFixed(2) + " dB<br>";
    text += (margin > 3) ? "✅ Link LAYAK" : "❌ Link TIDAK LAYAK";
  }

  else if (m === "jarak") {
    let tx = 0;      // asumsi default
    let rx = -25;    // asumsi default
    let margin = 3;

    let dmax = (tx - rx - margin) / parseFloat(lossKm.value);
    text = "Jarak Maksimum ≈ " + dmax.toFixed(1) + " km";
  }

  else if (m === "splitter") {
    let sp = parseFloat(document.getElementById("split").value);
    let total = loss + sp;
    text = "Total Loss + Splitter = " + total.toFixed(2) + " dB";
  }

  else if (m === "otdr") {
    text = "Estimasi Event OTDR:<br>";
    text += "- Loss jalur: " + loss.toFixed(2) + " dB<br>";
    text += "- Est. event splice: " + splice.value + " titik<br>";
    text += "- Est. event konektor: " + conn.value + " titik";
  }

  hasil.innerHTML = text;
}

