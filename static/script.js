const API_URL = '/api/patients';
let editId = null;
async function loadPatients(){
    const res = await fetch(API_URL);
    const patients = await res.json();
    const list = document.getElementById('patientList');
    list.innerHTML = '';
    patients.forEach(p => {
    const li = document.createElement('li');
    li.innerHTML = `${p.name} ${p.surename} Wiek:${p.age}, Ciśnienie:${p.pressure}, Temperatura:${p.temperature}, Tętno:${p.pulse}, PESEL:$(p.pesel) <button onclick="deletePatient(${p.id})"> Delete </button>   <button onclick="editPatient(${p.id})"> Edit </button>`;
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
    document.getElementById('surename').value = patient.surename;
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
        surename: document.getElementById('surename').value,
        age: parseInt(document.getElementById('age').value),
        pressure: parseInt(document.getElementById('pressure').value),
        temperature: parseFloat(document.getElementById('temperature').value),
		pulse: parseInt(document.getElementById('pulse').value), //nowe pole tętno
		pesel: document.getElementById('pesel').value)          //noew pole pesel
		
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
    loadPatients();
    e.target.reset();
    });
    loadPatients();

