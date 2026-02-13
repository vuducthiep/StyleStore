import { Client, type StompSubscription } from "@stomp/stompjs";

function requireElement<T extends HTMLElement>(id: string): T {
    const el = document.getElementById(id);
    if (!el) {
        throw new Error(`Missing required DOM element: ${id}`);
    }
    return el as T;
}

const logEl = requireElement<HTMLPreElement>("log");
const connectBtn = requireElement<HTMLButtonElement>("connectBtn");
const disconnectBtn = requireElement<HTMLButtonElement>("disconnectBtn");
const subscribeBtn = requireElement<HTMLButtonElement>("subscribeBtn");
const sendBtn = requireElement<HTMLButtonElement>("sendBtn");
const wsUrlInput = requireElement<HTMLInputElement>("wsUrl");
const jwtInput = requireElement<HTMLTextAreaElement>("jwt");
const subUserIdInput = requireElement<HTMLInputElement>("subUserId");
const receiverIdInput = requireElement<HTMLInputElement>("receiverId");
const messageInput = requireElement<HTMLTextAreaElement>("message");
const clearBtn = requireElement<HTMLButtonElement>("clearBtn");

let client: Client | null = null;
let subscription: StompSubscription | null = null;

function log(msg: string) {
    const time = new Date().toLocaleTimeString();
    logEl.textContent += `[${time}] ${msg}\n`;
    logEl.scrollTop = logEl.scrollHeight;
}

function setConnected(isConnected: boolean) {
    connectBtn.disabled = isConnected;
    disconnectBtn.disabled = !isConnected;
    subscribeBtn.disabled = !isConnected;
    sendBtn.disabled = !isConnected;
}

connectBtn.addEventListener("click", () => {
    const wsUrl = wsUrlInput.value.trim();
    const jwt = jwtInput.value.trim();

    if (client && client.active) {
        log("Already connected");
        return;
    }

    client = new Client({
        brokerURL: wsUrl,
        connectHeaders: jwt ? { Authorization: `Bearer ${jwt}` } : {},
        debug: (str) => log(str),
        reconnectDelay: 2000,
    });

    client.onConnect = () => {
        log("CONNECTED");
        setConnected(true);
    };

    client.onStompError = (frame) => {
        log(`STOMP ERROR: ${frame.headers["message"] || ""}`);
        if (frame.body) {
            log(frame.body);
        }
    };

    client.onWebSocketError = (err) => {
        log(`WS ERROR: ${String(err)}`);
    };

    client.activate();
    log("Connecting...");
});

disconnectBtn.addEventListener("click", () => {
    if (subscription) {
        subscription.unsubscribe();
        subscription = null;
    }
    if (client) {
        client.deactivate();
        log("Disconnected");
    }
    setConnected(false);
});

subscribeBtn.addEventListener("click", () => {
    if (!client || !client.active) {
        log("Not connected");
        return;
    }
    const subUserId = subUserIdInput.value.trim();
    const topic = `/topic/messages/${subUserId}`;

    if (subscription) {
        subscription.unsubscribe();
    }

    subscription = client.subscribe(topic, (message) => {
        log(`RECEIVED: ${message.body}`);
    });
    log(`Subscribed to ${topic}`);
});

sendBtn.addEventListener("click", () => {
    if (!client || !client.active) {
        log("Not connected");
        return;
    }
    const receiverId = Number(receiverIdInput.value.trim());
    const content = messageInput.value.trim();

    if (!receiverId || !content) {
        log("receiverId and message are required");
        return;
    }

    client.publish({
        destination: "/app/chat.send",
        body: JSON.stringify({ receiverUserId: receiverId, content }),
    });
    log("SEND ok");
});

clearBtn.addEventListener("click", () => {
    logEl.textContent = "";
});

setConnected(false);
