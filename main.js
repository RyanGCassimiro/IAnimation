const startButton = document.getElementById("start-btn");

startButton.addEventListener("click", async () => {
  startButton.disabled = true;
  startButton.textContent = "Carregando...";

  try {
    await startListening((label, confidence) => {
      executarAcao(label);
    });

    startButton.textContent = "Microfone ativo";
  } catch (err) {
    console.error(err);
    startButton.disabled = false;
    startButton.textContent = "Tentar novamente";
    alert("Não foi possível carregar o modelo ou acessar o microfone. Veja o console.");
  }
});