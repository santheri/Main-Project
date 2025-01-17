from flask_sqlalchemy import SQLAlchemy
db = SQLAlchemy()


class Student(db.Model):
    _tablename_="Students"
    S_id=db.Column(db.Integer,primary_key=True)
    S_name=db.Column(db.String,unique=False)
    S_email=db.Column(db.String,unique=True)
    S_phone=db.Column(db.String,unique=True)
    S_password=db.Column(db.String,unique=True)