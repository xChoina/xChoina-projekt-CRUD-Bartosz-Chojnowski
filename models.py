from sqlalchemy import Float, Column, Integer, String, DateTime
from sqlalchemy.orm import declarative_base
from datetime import datetime

from werkzeug.security import generate_password_hash, check_password_hash

Base = declarative_base()

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

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    login = Column(String(100),nullable=False, unique=True)
    password_hash = Column(String(200), nullable=False)
    role = Column(String(100), nullable=False, default='USER')
    created_date = Column(DateTime, default=datetime.utcnow)

    def set_password(self, password):
            self.password_hash=generate_password_hash(password)

    def check_password(self, password):
            return check_password_hash(self.password_hash, password)

