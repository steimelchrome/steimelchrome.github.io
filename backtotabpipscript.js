function backToTab() {
  opener.focus();
}

const btnBackToTab = document.createElement('input');
btnBackToTab.setAttribute('type', 'button');
btnBackToTab.value = 'Back to tab';
btnBackToTab.addEventListener('click', backToTab);
document.body.append(btnBackToTab);
