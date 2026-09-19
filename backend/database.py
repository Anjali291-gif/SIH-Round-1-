from sqlalchemy import create_engine, Column, Integer, Float, String, DateTime, Boolean
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime, timezone

SQLALCHEMY_DATABASE_URL = "sqlite:///./aerotwin.db"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class SensorRecord(Base):
    __tablename__ = "sensor_readings"

    id            = Column(Integer, primary_key=True, index=True)
    timestamp     = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    rpm           = Column(Float)
    cht           = Column(Float)
    egt           = Column(Float)
    oil_pressure  = Column(Float)
    oil_temp      = Column(Float)
    fuel_flow     = Column(Float)
    vibration     = Column(Float)
    health_score  = Column(Float)
    status        = Column(String)
    is_fault      = Column(Boolean, default=False)


class FaultEvent(Base):
    __tablename__ = "fault_events"

    id             = Column(Integer, primary_key=True, index=True)
    timestamp      = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    fault_type     = Column(String, nullable=True)
    anomaly_score  = Column(Float)
    confidence     = Column(Float)
    recommendation = Column(String)
    resolved       = Column(Boolean, default=False)


def create_tables():
    Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
