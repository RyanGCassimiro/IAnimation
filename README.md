# IAnimation — Controle por Voz

Projeto web que utiliza um modelo de áudio treinado no **Teachable Machine** para reconhecer comandos de voz em tempo real e executar ações no personagem.

A aplicação mostra o comando reconhecido, a confiança da predição e altera o estado do personagem de acordo com os comandos:

- `Esquerda`
- `Direita`
- `Pulo`
- `Magia`

O modelo é executado diretamente no navegador com TensorFlow.js.

## Arquivos do projeto

```text
IAnimation/
├── index.html
├── style.css
├── recognizer.js
├── henry.js
├── main.js
├── README.md
└── assets/
    └── sprites/
        └── henry/
            ├── idle-1.png
            ├── left-1.png
            ├── right-1.png
            ├── jump-1.png
            └── magic-1.png
```

### `index.html`

Estrutura principal da página. Contém o Canvas, o botão para ativar o microfone, o painel de reconhecimento e o carregamento das bibliotecas TensorFlow.js e Speech Commands.

### `style.css`

Define o estilo visual da página, do Canvas e do painel de reconhecimento.

### `recognizer.js`

Carrega o modelo do Teachable Machine, acessa o microfone, executa a classificação de áudio e mostra os níveis de confiança de cada classe.

A ação só é enviada quando a confiança é igual ou superior a **80%**.

### `henry.js`

Controla o estado e a renderização do Henry no Canvas.

Responsável pelos estados:

```text
IDLE
LEFT
RIGHT
JUMP
MAGIC
```

Também controla movimento, duração das ações e cooldown.

### `main.js`

Faz a integração entre o reconhecimento de voz e o personagem.

Quando um comando válido é detectado:

```text
recognizer.js → main.js → henry.js
```

## Requisitos

Para executar o projeto é necessário:

- navegador moderno;
- microfone;
- conexão com a internet;
- Python 3 instalado.

Não é necessário executar `npm install`.

## Executar no Linux

No terminal, entre na pasta do projeto:

```bash
cd IAnimation
```

Inicie um servidor local:

```bash
python3 -m http.server 8000
```

Abra no navegador:

```text
http://localhost:8000
```

Clique em **Ativar microfone** e permita o acesso ao dispositivo.

## Executar no Windows

Abra o Prompt de Comando ou PowerShell e entre na pasta do projeto:

```powershell
cd IAnimation
```

Execute:

```powershell
python -m http.server 8000
```

Caso o comando `python` não funcione:

```powershell
py -m http.server 8000
```

Abra no navegador:

```text
http://localhost:8000
```

Clique em **Ativar microfone** e permita o acesso ao dispositivo.

## Integrantes

- Ryan Cassimiro
- Wanessa Costa
