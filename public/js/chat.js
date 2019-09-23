const socket = io();

// Elements
const $messageForm = document.querySelector("form#message-form");
const $messageFormInput = document.querySelector("input#message-input");
const $messageFormButton = document.querySelector("button#send-message-button");
const $sendLocationButton = document.querySelector("#send-location-button");
const $messages = document.querySelector("div#messages");

// Templates
const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-message-template")
  .innerHTML;

// Options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

socket.on("message", message => {
  console.log(message);
  const html = Mustache.render(messageTemplate, {
    message: message.text,
    createdAt: moment(message.createdAt).format("h:mm a")
  });
  $messages.insertAdjacentHTML("beforeend", html);
});

socket.on("locationMessage", locationMessage => {
  console.log(locationMessage);
  const html = Mustache.render(locationTemplate, {
    locationUrl: locationMessage.url,
    createdAt: moment(locationMessage.createdAt).format("h:mm a")
  });
  $messages.insertAdjacentHTML("beforeend", html);
});

$messageForm.addEventListener("submit", event => {
  event.preventDefault();

  $messageFormButton.setAttribute("disabled", "disabled");

  const message = $messageFormInput.value;

  socket.emit("sendMessage", message, ackMessage => {
    $messageFormButton.removeAttribute("disabled");
    $messageFormInput.value = "";
    $messageFormInput.focus();
    console.log(ackMessage);
  });
});

$sendLocationButton.addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser!");
  }

  $sendLocationButton.setAttribute("disabled", "disabled");

  navigator.geolocation.getCurrentPosition(position => {
    socket.emit(
      "sendLocation",
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      },
      ackMessage => {
        $sendLocationButton.removeAttribute("disabled");
        console.log(ackMessage);
      }
    );
  });
});

socket.emit("join", { username, room });
