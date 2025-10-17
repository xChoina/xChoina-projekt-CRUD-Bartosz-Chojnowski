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

    def __repr__(self):
        return f"<Patient(id={self.id}, name='{self.name} {self.surename}' , pressure={self.pressure} , temperature{self.temperature}>"