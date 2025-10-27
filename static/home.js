const API_BASE = 'https://xchoina.pythonanywhere.com';
document.getElementById('loginForm').addEventListener('submit', async e => {
    e.preventDefault();
    const username = document.getElementById('login_username').value;
    const password = document.getElementById('login_password').value;
try{
    const res = await fetch(`${API_BASE}/login`,{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({username, password}), credentials: 'include'
    });
    const data = await res.json();

    if(res.ok){
        localStorage.setItem('user',JSON.stringify({username: data.username, role: data.role}));
        window.location.href = '/index';
        }else{
        alert(data.error || 'Login failed');
        }
}catch(err){
    alert('Failed server connection');
    console.error(err);
    }
    });

document.getElementById('registerForm').addEventListener('submit', async e => {
    e.preventDefault();
    const username = document.getElementById('reg_username').value;
    const password = document.getElementById('reg_password').value;
    const role = document.getElementById('reg_role').value;

try{
    const res = await fetch(`${API_BASE}/register`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({username, password,role}), credentials: 'include'
    });
    const data = await res.json();

    if(res.ok){
        alert('Registration successful! You can log in now.');
    }else{
        alert(data.error || 'Register failed');
    }
}catch(err){
    alert('Failed server connection');
    console.error(err);
}

});