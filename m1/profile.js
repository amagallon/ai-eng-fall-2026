const button = document.querySelector("#hi-button");
const bio = document.querySelector("#bio");

button.addEventListener("click", function () {
  bio.textContent = "Thanks for stopping by!";
});