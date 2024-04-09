opener.document.querySelector('#open-on-opener-from-pip').addEventListener('click', () => {
  console.log('open on opener from pip');
  opener.open('https://example.com', '_blank');
});

opener.document.querySelector('#open-on-pip-from-pip').addEventListener('click', () => {
  console.log('open on pip from pip');
  window.open('https://example.com', '_blank');
});

const openOnOpenerFromPipButton = document.createElement('input');
openOnOpenerFromPipButton.type = 'button';
openOnOpenerFromPipButton.value = 'opener.open from pip context';
openOnOpenerFromPipButton.addEventListener('click', () => {
  console.log('opener.open from pip');
  opener.open('https://example.com', '_blank');
});
document.body.append(openOnOpenerFromPipButton);
document.body.append(document.createElement('br'));

const openOnPipFromPipButton = document.createElement('input');
openOnPipFromPipButton.type = 'button';
openOnPipFromPipButton.value = 'window.open from pip context';
openOnPipFromPipButton.addEventListener('click', () => {
  console.log('window.open from pip');
  window.open('https://example.com', '_blank');
});
document.body.append(openOnPipFromPipButton);
document.body.append(document.createElement('br'));

const pDescription = document.createElement('p');
pDescription.innerText = 'A green background means that transient user activation is active.';
document.body.append(pDescription);
