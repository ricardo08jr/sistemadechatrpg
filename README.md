# sistemadechatrpg
# Simple Broadcast Chat (Socket.IO)

Um sistema simples de chat/broadcast em tempo real construído com **Node.js**, **Express** e **Socket.IO**.
O servidor pode rodar localmente na sua máquina e permitir que amigos se conectem através de diferentes métodos de rede.

---

# Funcionalidades

* Comunicação em tempo real usando WebSockets
* Envio de mensagens para todos os usuários conectados (broadcast)
* Opção para os usuários desativarem o recebimento de broadcast
* Estrutura simples e leve
* Pode ser hospedado na sua própria máquina

---

# Como Funciona

Este projeto usa **Socket.IO** para criar uma conexão em tempo real entre o servidor e os clientes.

Diferente de requisições HTTP tradicionais, ele mantém uma conexão persistente aberta para que mensagens sejam enviadas instantaneamente.

Fluxo básico:

1. O usuário abre a página no navegador
2. O navegador conecta ao servidor usando Socket.IO
3. O servidor registra a conexão do usuário
4. Quando alguém envia uma mensagem:

   * o servidor envia para todos os usuários conectados
5. Se um usuário desativou o broadcast, o servidor não envia mensagens para ele.

---

# Tecnologias Utilizadas

* Node.js
* Express
* Socket.IO
* LocalTunnel (opcional)
* ngrok (opcional)
* Hamachi (opcional)
* Radmin VPN (opcional)

---

# Instalação

Clone o repositório:

```bash
git clone https://github.com/SEU-USUARIO/NOME-DO-REPOSITORIO.git
cd NOME-DO-REPOSITORIO
```

Instale as dependências:

```bash
npm install
```

---

# Executando o Servidor

Inicie o servidor com:

```bash
node server.js
```

Ou usando nodemon:

```bash
npx nodemon server.js
```

O servidor ficará disponível em:

```
http://localhost:3000
```

---

# Métodos para Amigos se Conectarem

Existem várias formas de permitir que outras pessoas acessem o servidor rodando na sua máquina.

---

# Método 1: LocalTunnel

LocalTunnel cria um link público temporário para seu servidor local.

Instale o LocalTunnel:

```bash
npm install -g localtunnel
```

Execute:

```bash
lt --port 3000
```

Você receberá um link parecido com:

```
https://alguma-coisa.loca.lt
```

Envie esse link para seus amigos acessarem.

---

# Método 2: ngrok

ngrok cria um túnel seguro entre a internet e o seu servidor local.

## Criar conta

1. Acesse https://ngrok.com
2. Crie uma conta gratuita
3. Copie seu **authtoken**

## Conectar a conta

```bash
ngrok config add-authtoken SEU_TOKEN
```

## Criar o túnel

Primeiro rode o servidor:

```bash
node server.js
```

Depois abra outro terminal e execute:

```bash
ngrok http 3000
```

O terminal mostrará algo como:

```
Forwarding https://abc123.ngrok-free.app -> http://localhost:3000
```

Compartilhe o link:

```
https://abc123.ngrok-free.app
```

Esse endereço permitirá que seus amigos acessem seu servidor local.

---

# Método 3: Hamachi

Hamachi cria uma rede virtual entre computadores, como se todos estivessem na mesma rede local.

Passos:

1. Instale o Hamachi em todos os computadores
2. Crie uma rede
3. Seus amigos entram nessa rede
4. Pegue seu IP do Hamachi
5. Seus amigos acessam:

```
http://SEU-IP-HAMACHI:3000
```

Exemplo:

```
http://25.54.120.88:3000
```

---

# Método 4: Radmin VPN

Radmin VPN funciona de forma parecida com Hamachi, criando uma rede virtual privada.

Passos:

1. Instale o Radmin VPN
2. Crie uma rede
3. Seus amigos entram nessa rede
4. Pegue seu IP do Radmin VPN
5. Seus amigos acessam:

```
http://SEU-IP-RADMIN:3000
```

---

# Conceitos Importantes do Socket.IO

## io.on("connection")

Executa quando um novo usuário se conecta ao servidor.

```javascript
io.on("connection", (socket) => {
    console.log("Usuário conectado");
});
```

---

## socket.on()

Escuta eventos enviados pelo cliente.

```javascript
socket.on("message", (msg) => {
    console.log(msg);
});
```

---

## io.emit()

Envia uma mensagem para todos os clientes conectados.

```javascript
io.emit("message", msg);
```

---

## socket.broadcast.emit()

Envia uma mensagem para todos os clientes exceto quem enviou.

```javascript
socket.broadcast.emit("message", msg);
```

---

# Desativando Broadcast

Os usuários podem escolher se querem receber mensagens broadcast.

Exemplo de lógica:

```javascript
let receiveBroadcast = true;

socket.on("toggleBroadcast", (value) => {
    receiveBroadcast = value;
});
```

O servidor verifica essa variável antes de enviar mensagens.

---

# Estrutura do Projeto

```
project
│
├── server.js
├── package.json
├── public
│   └── index.html
│
└── README.md
```

---

# Observações

Este projeto é voltado para aprendizado ou uso privado pequeno.

Se for hospedar publicamente, considere adicionar:

* autenticação
* limitação de requisições
* verificações de segurança

---



