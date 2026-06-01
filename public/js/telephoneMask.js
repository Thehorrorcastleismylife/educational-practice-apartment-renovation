const PHONE_MASK = '+7 (___) ___-__-__';

function initPhoneMask() {
  const phoneInputs = document.querySelectorAll('.order-telephone');
  phoneInputs.forEach(input => {
    // Если поле уже имеет значение (например, из профиля), применить маску к нему
    const existingValue = input.value;
    if (existingValue && existingValue !== PHONE_MASK && existingValue !== '+7') {
      const digits = existingValue.replace(/\D/g, '');
      input.value = applyMask(digits);
    } else if (!existingValue || existingValue === '') {
      input.value = PHONE_MASK;
    }

    // Удаляем старые обработчики, если есть
    input.removeEventListener('focus', handleFocus);
    input.removeEventListener('blur', handleBlur);
    input.removeEventListener('keydown', handleKeyDownWrapper);
    input.removeEventListener('input', handleInput);
    input.removeEventListener('paste', handlePaste);

    input.addEventListener('focus', handleFocus);
    input.addEventListener('blur', handleBlur);
    input.addEventListener('keydown', handleKeyDownWrapper);
    input.addEventListener('input', handleInput);
    input.addEventListener('paste', handlePaste);
  });
}

function handleFocus(e) {
  const input = e.target;
  if (input.value === PHONE_MASK || !input.value) {
    input.value = PHONE_MASK;
    setCaretPosition(input, 4);
  }
}

function handleBlur(e) {
  const input = e.target;
  const digits = extractDigits(input.value);
  if (digits.length === 0) {
    input.value = PHONE_MASK;
  }
}

function handleKeyDownWrapper(e) {
  handlePhoneKeyDown(e, e.target);
}

function handleInput(e) {
  e.preventDefault();
}

function handlePaste(e) {
  e.preventDefault();
  const pasted = (e.clipboardData || window.clipboardData).getData('text');
  const digits = pasted.replace(/\D/g, '');
  insertDigits(e.target, digits);
}

function applyMask(digits) {
  let result = PHONE_MASK;
  let digitIndex = 0;
  const arr = result.split('');
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === '_' && digitIndex < digits.length) {
      arr[i] = digits[digitIndex++];
    }
  }
  return arr.join('');
}

function handlePhoneKeyDown(e, input) {
  const key = e.key;
  const isDigit = /^[0-9]$/.test(key);
  const isBackspace = key === 'Backspace';
  const isDelete = key === 'Delete';
  const isArrow = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(key);
  const isTab = key === 'Tab';
  const isCtrl = e.ctrlKey || e.metaKey;

  if (isArrow || isTab || isCtrl) return;
  e.preventDefault();

  let pos = getCaretPosition(input);

  if (isDigit) {
    let insertPos = findNextUnderscore(input.value, pos);
    if (insertPos === -1) return;

    const arr = input.value.split('');
    arr[insertPos] = key;
    input.value = arr.join('');

    const nextPos = findNextUnderscore(input.value, insertPos + 1);
    if (nextPos !== -1) {
      setCaretPosition(input, nextPos);
    } else {
      setCaretPosition(input, input.value.length);
    }
  }

  if (isBackspace || isDelete) {
    let deletePos = findLastFilledSlot(input.value);
    if (deletePos === -1) return;

    const arr = input.value.split('');
    arr[deletePos] = '_';
    input.value = arr.join('');

    setCaretPosition(input, deletePos);
  }
}

function findNextUnderscore(str, startPos) {
  for (let i = startPos; i < str.length; i++) {
    if (str[i] === '_') return i;
  }
  return -1;
}

function findLastFilledSlot(str) {
  const maskChars = new Set(['+', ' ', '(', ')', '-']);
  for (let i = str.length - 1; i >= 0; i--) {
    const ch = str[i];
    if (ch !== '_' && !maskChars.has(ch)) {
      return i;
    }
  }
  return -1;
}

function insertDigits(input, digits) {
  for (const digit of digits) {
    let pos = getCaretPosition(input);
    let insertPos = findNextUnderscore(input.value, pos);
    if (insertPos === -1) break;

    const arr = input.value.split('');
    arr[insertPos] = digit;
    input.value = arr.join('');
    setCaretPosition(input, insertPos + 1);
  }
}

function extractDigits(str) {
  return str.replace(/\D/g, '');
}

function getCaretPosition(input) {
  return input.selectionStart || 0;
}

function setCaretPosition(input, pos) {
  input.setSelectionRange(pos, pos);
}

function getCleanPhone(input) {
  if (!input) {
    input = document.querySelector('.order-telephone');
  }
  if (!input) return '';
  const digits = extractDigits(input.value);
  if (digits.length > 0 && digits[0] !== '7') {
    return '7' + digits.slice(0, 10);
  }
  return digits.slice(0, 11);
}

// Функция для повторной инициализации маски (для модальных окон)
function reinitPhoneMask() {
  initPhoneMask();
}