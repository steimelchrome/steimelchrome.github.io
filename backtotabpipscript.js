function backToTab() {
  opener.focus();
}

const btnBackToTabFromPipRealm = document.createElement('input');
btnBackToTabFromPipRealm.setAttribute('type', 'button');
btnBackToTabFromPipRealm.value = 'Back to tab from PiP realm';
btnBackToTabFromPipRealm.addEventListener('click', backToTab);
document.body.append(btnBackToTabFromPipRealm);
