const API_URL = '/api/patients';
let editId = null;
const user = JSON.parse(localStorage.getItem('user'));

if(!user){
    window.location.href = 'home.html';
}
document.getElementById('logoutBtn').addEventListener('click', async () => {
    try {
        const res = await fetch('https://xchoina.pythonanywhere.com/logout', {
            method: 'POST',
            credentials: 'include'
        });

        if (res.ok) {
            localStorage.removeItem('user');
            window.location.href = '/';
        } else {
            alert('Logout failed');
        }
    } catch (err) {
        console.error('Logout error:', err);
        alert('Could not connect to server');
    }
});



async function loadPatients(){
    const res = await fetch(API_URL);
    const patients = await res.json();
    const list = document.getElementById('patientList');
    list.innerHTML = '';
    patients.forEach(p => {
        const li = document.createElement('li');
        li.innerHTML = `${p.name} ${p.surname} Wiek:${p.age}, Ciśnienie:${p.pressure}, Temperatura:${p.temperature}, Tętno:${p.pulse}, PESEL:${p.pesel}`;
    if(user.role === 'admin'){
        const delBtn = document.createElement('button');
        delBtn.textContent = 'Delete';
        delBtn.onclick = () => deletePatient(p.id);

        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.onclick = () => editPatient(p.id);

        li.appendChild(editBtn);
        li.appendChild(delBtn);
    }
    list.appendChild(li);
    });
}
async function deletePatient(id){
 await fetch(`${API_URL}/${id}`, {method: 'DELETE'});
 loadPatients();
 }
async function editPatient(id){
    const res = await fetch(`${API_URL}/${id}`);
    const patient = await res.json();

    document.getElementById('name').value = patient.name;
    document.getElementById('surname').value = patient.surname;
    document.getElementById('age').value = patient.age;
    document.getElementById('pressure').value = patient.pressure;
    document.getElementById('temperature').value = patient.temperature;
	document.getElementById('pulse').value = patient.pulse;     //nowe pole tętno
	document.getElementById('pesel').value = patient.pesel;     //noew pole pesel

    editId = id;

}
 document.getElementById('patientForm').addEventListener('submit',async e => {e.preventDefault();
    const data = {
        name: document.getElementById('name').value,
        surname: document.getElementById('surname').value,
        age: parseInt(document.getElementById('age').value),
        pressure: parseInt(document.getElementById('pressure').value),
        temperature: parseFloat(document.getElementById('temperature').value),
		pulse: parseInt(document.getElementById('pulse').value), //nowe pole tętno
		pesel: document.getElementById('pesel').value         //noew pole pesel
		
    };
    if(editId){
        await fetch(`${API_URL}/${editId}`,{
            method: 'PUT',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify(data)
    });
    editId = null;
    } else {
        await fetch(API_URL,{
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify(data)
    });
    }
    editId=null;
    e.target.reset();
    loadPatients();
    });
    if(user.role === 'admin') {
    document.getElementById('adminPanel').classList.remove('hidden');
    }

    loadPatients();

