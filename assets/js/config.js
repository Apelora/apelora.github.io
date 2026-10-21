// Where the contact form sends its messages. Leave `endpoint` empty and the form says it is not
// connected, validates what was typed and sends nothing. To connect it, set the address of a form
// service (or your own endpoint) that accepts a multipart/form-data POST and answers 2xx when it
// has accepted the message; the page shows "sent" only after such an answer.
window.APELORA_CONTACT = {
  endpoint: "",
};
