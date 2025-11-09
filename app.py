import os

from flask import Flask, request, jsonify, render_template, session
from flask_cors import CORS
from sqlalchemy import create_engine
from sqlalchemy.dialects.mysql import DATETIME
from sqlalchemy.orm import sessionmaker
from models import Base, Patient, User
from datetime import timedelta
from functools import wraps

app = Flask(__name__)
app.secret_key = "bardzo_tajny_kluczyk"
app.permanent_session_lifetime = timedelta(minutes=30)
CORS(app, resources={r"/*": {"origins":"*"}})
if os.environ.get("TESTING") == "1":
    DATABASE_URL = "sqlite:///:memory:"
else:
    DATABASE_URL = "mysql+pymysql://xChoina:ff83pzMxPhnknNc@xChoina.mysql.pythonanywhere-services.com/xChoina$xchoina"
    
engine = create_engine(DATABASE_URL)
Base.metadata.create_all(engine)
Session = sessionmaker(bind=engine)

def login_required(view):
    @wraps(view)
    def decorated_function(*args, **kwargs):
        if "user" not in session:
            return jsonify({"error": "Please login first"}), 401
        return view(*args, **kwargs)
    return decorated_function

def admin_required(view):
    @wraps(view)
    def decorated_function(*args, **kwargs):
        if "user" not in session:
            return jsonify({"error": "Please login first"}), 401
        if session.get("role") != "admin":
            return jsonify({"error": "Admin access required"}), 403
        return view(*args, **kwargs)
    return decorated_function

@app.route("/")
def home():
    return render_template("home.html")

@app.route("/home")
def home_page():
    return render_template("home.html")

@app.route("/index")
def index():
    if "user" not in session:
        return render_template("home.html")
    return  render_template("index.html")

@app.route("/api/patients", methods=["GET"])
@admin_required
def get_patients():
    session_db = Session()
    patients = session_db.query(Patient).all()
    result = [
        {
            "id":p.id,
            "name":p.name,
            "surname":p.surname,
            "age":p.age,
            "pressure":p.pressure,
            "temperature":p.temperature,
            "pulse":p.pulse, #nowe pole tętno
            "pesel":p.pesel #nowe pole pesel
        }

        for p in patients
    ]
    session_db.close()
    return jsonify(result)
@app.route("/api/patients/<int:id>", methods=["GET"])
@admin_required
def get_patient(id):
    session_db = Session()
    patient = session_db.get(Patient,id)
    result = {
            "id": patient.id,
            "name": patient.name,
            "surname": patient.surname,
            "age": patient.age,
            "pressure": patient.pressure,
            "temperature": patient.temperature,
            "pulse":patient.pulse, #nowe pole tętno
            "pesel":patient.pesel #nowe pole pesel
        }
    session_db.close()
    return jsonify(result)

@app.route("/api/patients", methods=["POST"])
@login_required
def add_patient():
    session_db = Session()
    data = request.get_json()
    new_patient = Patient(
        name=data["name"],
        surname=data["surname"],
        age=data["age"],
        pressure=data["pressure"],
        temperature=data["temperature"],
        pulse=data["pulse"], #nowe pole tętno
        pesel=data["pesel"] #nowe pole pesel
    )
    error = new_patient.validate()
    if error:
        session_db.close()
        return jsonify({"error": error}), 400

    session_db.add(new_patient)
    session_db.commit()
    session_db.close()
    return jsonify({"message": "Patients added!"}), 201

@app.route("/api/patients/<int:id>", methods=["PUT"])
@admin_required
def update_patient(id):
    session_db = Session()
    data = request.json
    patient = session_db.get(Patient,id)
    if not patient:
        return jsonify({"error": "Patient not found"}), 404
    patient.name = data["name"]
    patient.surname = data["surname"]
    patient.age = data["age"]
    patient.pressure = data["pressure"]
    patient.temperature = data["temperature"]
    patient.pulse=data["pulse"] #nowe pole tętno
    patient.pesel=data["pesel"] #nowe pole pesel
    error = patient.validate()
    if error:
        session_db.close()
        return jsonify({"error": error}), 400
    session_db.commit()
    session_db.close()
    return jsonify({"message":"Patient updated succesfully"})

@app.route("/api/patients/<int:id>", methods=["DELETE"])
@admin_required
def delete_patient(id):
    session_db = Session()
    patient = session_db.query(Patient).get(id)
    if not patient:
        return jsonify({"error":"Patient not found"}), 404
    session_db.delete(patient)
    session_db.commit()
    session_db.close()
    return jsonify({"message":"Patient deleted succesfully"})

@app.route("/register", methods=["POST","OPTIONS"])
def register():
    session_db = Session()
    data = request.get_json()
    loginn = data.get('username')
    password = data.get('password')
    role = data.get('role')
    if not loginn or not password:
        session_db.close()
        return jsonify({"error": "Username and password are required"}), 400
    if session_db.query(User).filter_by(login=loginn).first():
        session_db.close()
        return jsonify({
            "statusCode": 409,
            "error": "Conflict",
            "fieldErrors":[{
                "field": "login",
                "code": "DUPLICATE",
                "message": "Username is already registered"
            }]
        }),409
    temp_user = User(login=loginn, role=role)
    error = temp_user.validate(password=password)
    if error:
        session_db.close()
        return jsonify(error), 400

    new_user = User(login=loginn, role=role)
    new_user.set_password(password)
    session_db.add(new_user)
    session_db.commit()
    session_db.close()
    return jsonify({"message": "User created successfully"})

@app.route("/login", methods=["POST","OPTIONS"])
def login():
    session_db = Session()
    data = request.get_json()
    loginn = data.get('username')
    password = data.get('password')
    user = session_db.query(User).filter_by(login=loginn).first()
    if not user or not user.check_password(password):
        session_db.close()
        return jsonify({"error": "Incorrect login or password"}), 401
    session["user"]= user.login
    session["role"]= user.role
    session.permanent = True
    session_db.close()
    return jsonify({
        "message": "Login successful",
        "username": user.login,
        "role": user.role
    })

@app.route("/logout",methods=["POST"])
def logout():
    session.pop("user",None)
    return jsonify({"message": "Logout successful"})

@app.route("/health")
def health():
    return {"status": "OK"}, 200


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)

