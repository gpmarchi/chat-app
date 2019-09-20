const socket = io();

socket.on("message", message => {
  console.log(message);
});

const messageForm = document.querySelector("form#message-form");
const messageInput = document.querySelector(
  "form#message-form input#message-input"
);

messageForm.addEventListener("submit", event => {
  event.preventDefault();

  const message = messageInput.value;

  socket.emit("sendMessage", message, ackMessage => {
    console.log(ackMessage);
  });
});

const sendLocationButton = document.querySelector(
  "button#send-location-button"
);

sendLocationButton.addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser!");
  }

  navigator.geolocation.getCurrentPosition(position => {
    socket.emit(
      "sendLocation",
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      },
      ackMessage => {
        console.log(ackMessage);
      }
    );
  });
});
