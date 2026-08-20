// Responsabilidade: ouvir o microfone e avisar quem estiver interessado quando um comando de voz for reconhecido com confiança

const MODEL_URL = "https://teachablemachine.withgoogle.com/models/DIFOzA8Nk/"; // termina com "/"
const THRESHOLD = 0.80;

async function createRecognizer() {
  const checkpointURL = MODEL_URL + "model.json";
  const metadataURL = MODEL_URL + "metadata.json";

  const recognizer = speechCommands.create(
    "BROWSER_FFT",
    undefined,
    checkpointURL,
    metadataURL
  );

  await recognizer.ensureModelLoaded();
  return recognizer;
}

async function startListening(onCommand) {
  const recognizer = await createRecognizer();
  const classLabels = recognizer.wordLabels();

  await recognizer.listen(
    (result) => {
      const scores = classLabels.map((className, i) => ({
        className,
        score: result.scores[i],
      }));
      const top = scores.reduce((a, b) => (a.score > b.score ? a : b));

      updatePanel(top.className, top.score, scores);

      if (top.score >= THRESHOLD) {
        onCommand(top.className, top.score);
      }
    },
    {
      probabilityThreshold: 0.01, // baixo de propósito — quem decide é o THRESHOLD acima
      invokeCallbackOnNoiseAndUnknown: true,
      overlapFactor: 0.5,
    }
  );
}

function updatePanel(label, confidence, allScores) {
  document.getElementById("command").textContent = label;
  document.getElementById("confidence").textContent =
    (confidence * 100).toFixed(1) + "%";

  const list = document.getElementById("scores");
  list.innerHTML = "";
  allScores.forEach(({ className, score }) => {
    const li = document.createElement("li");
    li.textContent = `${className}: ${(score * 100).toFixed(1)}%`;
    list.appendChild(li);
  });
}

// abra o console (F12) e rode: startListening(console.log)
// cada comando reconhecido acima do THRESHOLD vai aparecer no console.
