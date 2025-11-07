const API_BASE = 'https://xchoina.pythonanywhere.com';

function showError(fieldId, message) {
    let field = document.getElementById(fieldId);
    if (!field) return;

    // usuń stare błędy
    let oldError = field.parentNode.querySelector('.error');
    if (oldError) oldError.remove();

    // dodaj nowy
    let errorMsg = document.createElement('div');
    errorMsg.className = 'error';
    errorMsg.style.color = 'red';
    errorMsg.style.fontSize = '12px';
    errorMsg.textContent = message;
    field.parentNode.appendChild(errorMsg);
}

function clearErrors(formId) {
    document.querySelectorAll(`#${formId} .error`).forEach(e => e.remove());
}

document.getElementById('loginForm').addEventListener('submit', async e => {
    e.preventDefault();
    clearErrors('loginForm');

    const username = document.getElementById('login_username').value;
    const password = document.getElementById('login_password').value;

    try {
        const res = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({username, password}),
            credentials: 'include'
        });

        const data = await res.json();

        if (res.ok) {
            localStorage.setItem('user', JSON.stringify({username: data.username, role: data.role}));
            window.location.href = '/index';
        } else if (data.fieldErrors) {
            data.fieldErrors.forEach(err => {
                if (err.field === 'password') showError('login_password', err.message);
                if (err.field === 'username' || err.field === 'login') showError('login_username', err.message);
            });
        } else {
            showError('login_username', data.error || 'Błędne dane logowania');
        }
    } catch (err) {
        alert('Błąd połączenia z serwerem');
        console.error(err);
    }
});

document.getElementById('registerForm').addEventListener('submit', async e => {
    e.preventDefault();
    clearErrors('registerForm');

    const username = document.getElementById('reg_username').value;
    const password = document.getElementById('reg_password').value;
    const role = document.getElementById('reg_role').value;

    try {
        const res = await fetch(`${API_BASE}/register`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({username, password, role}),
            credentials: 'include'
        });

        const data = await res.json();

        if (res.ok) {
            alert('Rejestracja zakończona sukcesem! Możesz się teraz zalogować.');
            document.getElementById('registerForm').reset();
        } else if (data.fieldErrors) {
            data.fieldErrors.forEach(err => {
                if (err.field === 'password') showError('reg_password', err.message);
                if (err.field === 'username' || err.field === 'login') showError('reg_username', err.message);
            });
        } else {
            showError('reg_username', data.error || 'Błąd rejestracji');
        }
    } catch (err) {
        alert('Błąd połączenia z serwerem');
        console.error(err);
    }
});
