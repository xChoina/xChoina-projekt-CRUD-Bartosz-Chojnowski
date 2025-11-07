from sqlalchemy import Float, Column, Integer, String, DateTime
from sqlalchemy.orm import declarative_base
from datetime import datetime
import re
from werkzeug.security import generate_password_hash, check_password_hash

Base = declarative_base()

def validation_error(field,code, message, status=400):
    return {
        "statusCode": status,
        "error": "Bad Request",
        "fieldErrors": [{ "field" : field, "code" : code, "message" : message }]

    }
class Patient(Base):
    __tablename__ = 'patients'
    id = Column(Integer, primary_key=True)
    name = Column(String(100),nullable=False)
    surname = Column(String(100),nullable=False)
    age = Column(Integer)
    pressure = Column(Integer)
    temperature = Column(Float)
    pulse = Column(Integer)                     #deklaracja kolumny tętno
    pesel = Column(String(11), nullable=False)  #deklaracja kolumny pesel

    def __repr__(self):
        return f"<Patient(id={self.id}, name='{self.name} {self.surname}' , pressure={self.pressure} , temperature={self.temperature} , pulse={self.pulse}, pesel={self.pesel} >" #dodanie dwóch nowych pól

    def validate(self):

        if not self.name or len(self.name.strip()) < 3:
            return validation_error("name", "TOO_SHORT", "Name must be at least 3 characters long")

        if len(self.name) > 50:
            return validation_error("name", "TOO_LONG", "Name must be less than 50 characters long")

        if not self.surname or len(self.surname.strip()) < 3:
            return validation_error("surname", "TOO_SHORT", "Surname must be at least 3 characters long")

        if self.age is not None and (self.age <=0 or self.age > 120):
            return validation_error("age", "INVALID_RANGE", "Age must be between 0-120")

        if not re.fullmatch(r"\d{11}", self.pesel or ""):
            return validation_error("pesel", "INVALID_FORMAT", "PESEL must be a valid PESEL number")

        if self.pressure is not None and (self.pressure <60 or self.pressure > 200):
            return validation_error("pressure", "INVALID_VALUE", "Pressure must be between 60-200")

        if self.temperature is not None and (self.temperature < 30 or self.temperature > 45):
            return validation_error("temperature", "INVALID_VALUE", "Temperature must be between 30-45")

        if self.pulse is not None and (self.pulse < 30 or self.pulse > 300):
            return validation_error("pulse", "INVALID_VALUE", "Pulse must be between 30-300")

        return None


class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    login = Column(String(100),nullable=False, unique=True)
    password_hash = Column(String(200), nullable=False)
    role = Column(String(100), nullable=False, default='user')
    created_date = Column(DateTime, default=datetime.utcnow)

    def set_password(self, password):
            self.password_hash=generate_password_hash(password)

    def check_password(self, password):
            return check_password_hash(self.password_hash, password)

    def validate(self, password=None):

         if not self.login or len(self.login.strip()) < 3:
             return validation_error("login", "TOO_SHORT", "Login must be at least 3 characters long")

         if len(self.login) > 40:
             return validation_error("login", "TOO_LONG", "Login must be at least 40 characters long")

         if password:
             if len(password) < 7:
                 return validation_error("password", "TOO_SHORT", "Password must be at least 7 characters long")

             if not re.search(r"[A-Z]",password) or not re.search(r"\d", password):
                 return validation_error("password", "WEAK_PASSWORD", "Password must have at least 1 big character and 1 number")


         if self.role not in ("user", "admin"):
             return validation_error("role", "INVALID_ROLE", "Role must be either USER or ADMIN")


         return None
