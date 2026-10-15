// JS: Find the button and message, then update the message when clicked.
const button = document.querySelector('button')
const message = document.querySelector('.message')

button.addEventListener('click', () => {
  message.textContent = 'Nice work showing up for yourself today.'
})
