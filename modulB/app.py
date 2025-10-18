from flask import Flask, jsonify, request, render_template
from datetime import datetime
from flask_cors import CORS
import mysql.connector

app = Flask(__name__)
CORS(app)

db_config = {
    'host': 'radper.mysql.pythonanywhere-services.com',
    'user': 'radper',
    'password': 'pantadeusz',
    'database': 'radper$default'
}

def get_connection():
    return mysql.connector.connect(**db_config)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/ksiazki', methods=['GET'])
def get_all():
    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    cur.execute('SELECT * FROM ksiazki ORDER BY id DESC')
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify(rows)

@app.route('/ksiazki/<int:id>', methods=['GET'])
def get_one(id):
    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    cur.execute('SELECT * FROM ksiazki WHERE id = %s', (id,))
    row = cur.fetchone()
    cur.close()
    conn.close()
    if not row:
        return jsonify({'error': 'Nie znaleziono książki'}), 404
    return jsonify(row)

@app.route('/ksiazki', methods=['POST'])
def create():
    data = request.get_json()
    if not data or not data.get('tytul'):
        return jsonify({'error': 'Brak tytułu'}), 400
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        'INSERT INTO ksiazki (tytul, imie_autora, nazwisko_autora, rok_wydania, wydawnictwo, cena ,data_dodania) VALUES (%s, %s, %s, %s, %s, %s, %s)',
        (data['tytul'], data.get('imie_autora'), data.get('nazwisko_autora'), data.get('rok_wydania'), data.get('wydawnictwo'), data.get('cena'), datetime.now())
    )
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({'message': 'Dodano książkę'}), 201

@app.route('/ksiazki/<int:id>', methods=['PUT'])
def update(id):
    data = request.get_json()
    if not data or not data.get('tytul'):
        return jsonify({'error': 'Brak tytułu'}), 400
    conn = get_connection()
    cur = conn.cursor()
    cur.execute('SELECT * FROM ksiazki WHERE id = %s', (id,))
    if not cur.fetchone():
        cur.close()
        conn.close()
        return jsonify({'error': 'Nie znaleziono książki'}), 404
    cur.execute(
        'UPDATE ksiazki SET tytul=%s, imie_autora=%s, nazwisko_autora=%s, rok_wydania=%s, wydawnictwo=%s, cena=%s WHERE id=%s',
        (data['tytul'], data.get('imie_autora'), data.get('nazwisko_autora'), data.get('rok_wydania'), data.get('wydawnictwo') , data.get('cena') ,id)
    )
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({'message': 'Zaktualizowano książkę'})

@app.route('/ksiazki/<int:id>', methods=['DELETE'])
def delete(id):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute('SELECT * FROM ksiazki WHERE id = %s', (id,))
    if not cur.fetchone():
        cur.close()
        conn.close()
        return jsonify({'error': 'Nie znaleziono książki'}), 404
    cur.execute('DELETE FROM ksiazki WHERE id = %s', (id,))
    conn.commit()
    cur.close()
    conn.close()
    return '', 204

if __name__ == '__main__':
    app.run(debug=True)
