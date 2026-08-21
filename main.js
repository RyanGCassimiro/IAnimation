// main.js — feito em conjunto (Ryan + Wanessa)
// Único arquivo que conhece os dois lados: liga a saída do
// recognizer.js (startListening) na entrada do henry.js (executarAcao).
//
// Importante: o reconhecimento só começa quando o botão é clicado,
// nunca automaticamente ao carregar a página — o navegador exige uma
// ação do usuário pra liberar o microfone, e isso também deixa a
// demonstração mais controlada na apresentação
// (abre o site → clica → concede permissão → demonstra).

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