from sqlalchemy import Float, Column, Integer, String
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class Patient(Base):
    __tablename__ = 'patients'
    id = Column(Integer, primary_key=True)
    name = Column(String(100),nullable=False)
    surename = Column(String(100),nullable=False)
    age = Column(Integer)
    pressure = Column(Integer)
    temperature = Column(Float)
    pulse = Column(Integer)                     #deklaracja kolumny tętno
    pesel = Column(String(11), nullable=False)  #deklaracja kolumny pesel

    def __repr__(self):
        return f"<Patient(id={self.id}, name='{self.name} {self.surename}' , pressure={self.pressure} , temperature{self.temperature} , pulse{self.pulse}, pesel{self.pesel} >" #dodanie dwóch nowych pól