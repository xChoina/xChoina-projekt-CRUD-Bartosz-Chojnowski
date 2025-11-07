const API_URL = '/api/patients';
let editId = null;
const user = JSON.parse(localStorage.getItem('user'));

// 1. OCHRONA STRONY
if (!user) {
    window.location.href = '/home'; // Przekieruj na stronę logowania, jeśli nie ma usera
}

// 2. USTAWIENIE UI
// Ustaw rolę użytkownika w nawigacji
document.getElementById('userRole').textContent = `Zalogowany jako: ${user.username} (${user.role})`;

// --- 3. FUNKCJE POMOCNICZE DO WALIDACJI ---

/**
 * Wyświetla komunikat o błędzie w odpowiednim <span>.
 * @param {string} fieldId - ID pola (np. 'name')
 * @param {string} message - Treść błędu
 */
function showError(fieldId, message) {
    // Znajduje <span> o ID 'error-name', 'error-surname' itd. (z pliku index.html)
    const errorSpan = document.getElementById(`error-${fieldId}`);
    if (errorSpan) {
        errorSpan.textContent = message;
    }
}

/**
 * Czyści wszystkie komunikaty o błędach z formularza.
 */
function clearErrors() {
    // Znajduje wszystkie elementy <span> z klasą 'error-message' i czyści ich tekst
    document.querySelectorAll('#patientForm .error-message').forEach(span => {
        span.textContent = '';
    });
}

// --- 4. OBSŁUGA ZDARZEŃ ---

// Wylogowanie
document.getElementById('logoutBtn').addEventListener('click', async () => {
    try {
        const res = await fetch('/logout', { 
            method: 'POST',
            credentials: 'include'
        });

        if (res.ok) {
            localStorage.removeItem('user');
            window.location.href = '/home'; // Powrót do strony logowania
        } else {
            alert('Wylogowanie nie powiodło się');
        }
    } catch (err) {
        console.error('Błąd wylogowania:', err);
        alert('Nie można połączyć się z serwerem');
    }
});

// Główny formularz (Dodawanie / Edycja)
document.getElementById('patientForm').addEventListener('submit', async e => {
    e.preventDefault(); // Zatrzymaj domyślną wysyłkę
    clearErrors(); // Zawsze czyść błędy na starcie

    // --- 5. WALIDACJA "FRONTENDOWA" (DLA WYGODY UŻYTKOWNIKA) ---
    
    // Zbierz dane
    const name = document.getElementById('name').value.trim();
    const surname = document.getElementById('surname').value.trim();
    const ageStr = document.getElementById('age').value;
    const pressureStr = document.getElementById('pressure').value;
    const tempStr = document.getElementById('temperature').value;
    const pulseStr = document.getElementById('pulse').value;
    const pesel = document.getElementById('pesel').value.trim();

    let isValid = true; // Flaga do śledzenia, czy formularz jest poprawny

    // Sprawdź reguły (takie same jak w models.py)
    if (name.length < 3) {
        showError('name', 'Imię musi mieć co najmniej 3 znaki.');
        isValid = false;
    } else if (name.length > 50) {
        showError('name', 'Imię nie może być dłuższe niż 50 znaków.');
        isValid = false;
    }

    if (surname.length < 3) {
        showError('surname', 'Nazwisko musi mieć co najmniej 3 znaki.');
        isValid = false;
    }

    if (!/^\d{11}$/.test(pesel)) {
        showError('pesel', 'PESEL musi składać się z 11 cyfr.');
        isValid = false;
    }

    const age = parseInt(ageStr);
    if (isNaN(age) || age <= 0 || age > 120) {
        showError('age', 'Wiek musi być poprawną liczbą (1-120).');
        isValid = false;
    }

    // Pola opcjonalne - waliduj tylko jeśli są wypełnione
    let pressure = pressureStr ? parseInt(pressureStr) : null;
    if (pressureStr && (isNaN(pressure) || pressure < 60 || pressure > 200)) {
        showError('pressure', 'Ciśnienie musi być w zakresie 60-200.');
        isValid = false;
    }

    let temperature = tempStr ? parseFloat(tempStr) : null;
    if (tempStr && (isNaN(temperature) || temperature < 30 || temperature > 45)) {
        showError('temperature', 'Temperatura musi być w zakresie 30.0-45.0.');
        isValid = false;
    }
    
    let pulse = pulseStr ? parseInt(pulseStr) : null;
    if (pulseStr && (isNaN(pulse) || pulse < 30 || pulse > 300)) {
        showError('pulse', 'Tętno musi być w zakresie 30-300.');
        isValid = false;
    }
    
    // 6. ZATRZYMANIE WYSYŁKI
    // Jeśli walidacja frontendowa nie przeszła, przerwij i nic nie wysyłaj
    if (!isValid) {
        return; 
    }

    // --- KONIEC WALIDACJI FRONTENDOWEJ ---

    // Walidacja przeszła, stwórz obiekt do wysłania
    const data = {
        name, surname, age, pesel, 
        pressure: pressure || null, // Upewnij się, że puste pola są wysyłane jako 'null'
        temperature: temperature || null,
        pulse: pulse || null
    };

    // 7. WYSYŁKA DO SERWERA (API)
    try {
        const url = editId ? `${API_URL}/${editId}` : API_URL;
        const method = editId ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
            credentials: 'include' // Ważne dla sesji i logowania
        });

        // 8. OBSŁUGA ODPOWIEDZI Z SERWERA
        if (!res.ok) {
            // Walidacja frontendowa przeszła, ale backend (models.py) i tak znalazł błąd
            // (np. duplikat PESEL, lub inny błąd 4xx/5xx)
            const errorData = await res.json();
            
            // Spróbuj wyświetlić błąd z serwera przy konkretnym polu
            if (errorData.fieldErrors && errorData.fieldErrors[0]) {
                const err = errorData.fieldErrors[0];
                showError(err.field, err.message); // To jest obsługa błędów "backendowych"
            } else {
                alert(`Błąd serwera: ${errorData.error || 'Nieznany błąd'}`);
            }
        } else {
             // SUKCES!
            editId = null; // Zresetuj tryb edycji
            e.target.reset(); // Wyczyść formularz
            
            if (user.role === 'admin') {
                loadPatients(); // Admin przeładowuje listę
            } else {
                alert('Pacjent dodany pomyślnie!'); // User dostaje powiadomienie
            }
        }
    } catch (err) {
        console.error("Błąd zapisu (fetch):", err);
        alert("Wystąpił błąd połączenia z serwerem.");
    }
});


// --- 9. FUNKCJE DLA ADMINA ---

/**
 * Ładuje listę pacjentów (tylko dla admina).
 */
async function loadPatients() {
    // Tylko admin widzi panel i listę
    if (user.role !== 'admin') {
        document.getElementById('adminPanel').classList.add('hidden');
        return; // Zwykły użytkownik nie wykonuje tej funkcji
    }
    
    // Jeśli to admin, pokaż panel
    document.getElementById('adminPanel').classList.remove('hidden');

    try {
        const res = await fetch(API_URL, { credentials: 'include' });
        if (!res.ok) {
            // Np. sesja wygasła lub inny błąd
            throw new Error(`Błąd serwera: ${res.status}`);
        }
        
        const patients = await res.json();
        const list = document.getElementById('patientList');
        list.innerHTML = ''; // Wyczyść starą listę
        
        if (patients.length === 0) {
            list.innerHTML = '<li>Brak pacjentów w bazie.</li>';
        }

        // Stwórz listę pacjentów z przyciskami
        patients.forEach(p => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div>
                    <strong>${p.name} ${p.surname}</strong> (Wiek: ${p.age}, PESEL: ${p.pesel})<br>
                    <small>
                        Ciśnienie: ${p.pressure || 'N/A'} | 
                        Temp: ${p.temperature || 'N/A'} | 
                        Tętno: ${p.pulse || 'N/A'}
                    </small>
                </div>
                <div>
                    <!-- Używamy data-atrybutów do przechowywania ID -->
                    <button class="editBtn" data-id="${p.id}" style="margin-left: 10px;">Edytuj</button>
                    <button class="deleteBtn" data-id="${p.id}" style="margin-left: 5px;">Usuń</button>
                </div>
            `;
            list.appendChild(li);
        });

        // Dodaj listenery do *wszystkich* nowych przycisków na liście
        list.querySelectorAll('.editBtn').forEach(btn => {
            btn.addEventListener('click', () => editPatient(btn.dataset.id));
        });
        list.querySelectorAll('.deleteBtn').forEach(btn => {
            btn.addEventListener('click', () => deletePatient(btn.dataset.id));
        });

    } catch (err) {
        console.error("Błąd ładowania pacjentów:", err);
        document.getElementById('patientList').innerHTML = '<li>Wystąpił błąd serwera podczas ładowania listy.</li>';
    }
}

/**
 * Usuwa pacjenta (tylko admin).
 */
async function deletePatient(id) {
    if (!confirm('Czy na pewno chcesz usunąć tego pacjenta?')) {
        return;
    }
    try {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE', credentials: 'include' });
        loadPatients(); // Przeładuj listę po usunięciu
    } catch (err) {
        alert('Błąd podczas usuwania pacjenta.');
    }
}

/**
 * Wypełnia formularz danymi pacjenta do edycji (tylko admin).
 */
async function editPatient(id) {
    try {
        const res = await fetch(`${API_URL}/${id}`, { credentials: 'include' });
        if (!res.ok) throw new Error('Nie można pobrać danych pacjenta');
        
        const patient = await res.json();

        // Wypełnij formularz danymi pacjenta
        document.getElementById('name').value = patient.name;
        document.getElementById('surname').value = patient.surname;
        document.getElementById('age').value = patient.age;
        document.getElementById('pressure').value = patient.pressure || ''; 
        document.getElementById('temperature').value = patient.temperature || '';
        document.getElementById('pulse').value = patient.pulse || '';
        document.getElementById('pesel').value = patient.pesel;

        editId = id; // Ustaw ID do edycji
        window.scrollTo(0, 0); // Przewiń na górę do formularza
    } catch (err) {
        alert('Błąd podczas pobierania danych pacjenta.');
    }
}

// --- 10. PIERWSZE URUCHOMIENIE ---
// Wywołaj funkcję loadPatients() przy starcie strony.
// Funkcja sama sprawdzi, czy user jest adminem i co ma zrobić.
loadPatients();
