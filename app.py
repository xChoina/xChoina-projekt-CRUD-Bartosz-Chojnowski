from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base, Patient

app = Flask(__name__)
CORS(app)

engine = create_engine("mysql+pymysql://xChoina:ff83pzMxPhnknNc@xChoina.mysql.pythonanywhere-services.com/xChoina$xchoina")
Base.metadata.create_all(engine)
Session = sessionmaker(bind=engine)


@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/patients", methods=["GET"])
def get_patients():
    session = Session()
    patients = session.query(Patient).all()
    result = [
        {
            "id":p.id,
            "name":p.name,
            "surename":p.surename,
            "age":p.age,
            "pressure":p.pressure,
            "temperature":p.temperature,
            "pulse":p.pulse, #nowe pole tętno
            "pesel":p.pesel #nowe pole pesel
        }

        for p in patients
    ]
    session.close()
    return jsonify(result)
@app.route("/api/patients/<int:id>", methods=["GET"])
def get_patient(id):
    session = Session()
    patient = session.get(Patient,id)
    result = {
            "id": patient.id,
            "name": patient.name,
            "surename": patient.surename,
            "age": patient.age,
            "pressure": patient.pressure,
            "temperature": patient.temperature,
            "pulse":p.pulse, #nowe pole tętno
            "pesel":p.pesel #nowe pole pesel
        }
    session.close()
    return jsonify(result)

@app.route("/api/patients", methods=["POST"])
def add_patient():
    session = Session()
    data = request.get_json()
    new_patient = Patient(
        name=data["name"],
        surename=data["surename"],
        age=data["age"],
        pressure=data["pressure"],
        temperature=data["temperature"],
        pulse=data["pulse"], #nowe pole tętno
        pesel=data["pesel"] #nowe pole pesel
    )
    session.add(new_patient)
    session.commit()
    return jsonify({"message": "Patients added!"}), 201

@app.route("/api/patients/<int:id>", methods=["PUT"])
def update_patient(id):
    session = Session()
    data = request.json
    patient = session.get(Patient,id)
    if not patient:
        return jsonify({"error": "Patient not found"}), 404
    patient.name = data["name"]
    patient.surename = data["surename"]
    patient.age = data["age"]
    patient.pressure = data["pressure"]
    patient.temperature = data["temperature"]
    patient.pulse=data["pulse"] #nowe pole tętno
    patient.pesel=data["pesel"] #nowe pole pesel
    session.commit()
    session.close()
    return jsonify({"message":"Patient updated succesfully"})

@app.route("/api/patients/<int:id>", methods=["DELETE"])
def delete_patient(id):
    session = Session()
    patient = session.query(Patient).get(id)
    if not patient:
        return jsonify({"error":"Patient not found"}), 404
    session.delete(patient)
    session.commit()
    session.close()
    return jsonify({"message":"Patient deleted succesfully"})

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
