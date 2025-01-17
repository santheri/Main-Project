from flask_sqlalchemy import SQLAlchemy
from datetime import *
db = SQLAlchemy()


class Student(db.Model):
    _tablename_="Students"
    S_id=db.Column(db.Integer,primary_key=True)
    S_name=db.Column(db.String,unique=False)
    S_email=db.Column(db.String,unique=True)
    S_phone=db.Column(db.String,unique=True)
    S_password=db.Column(db.String,unique=False)

class Exam(db.Model):
    __tablename__ = 'exams'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime, nullable=False)
    randomize_questions = db.Column(db.Boolean, default=False)
    submissions = db.relationship('Submission', backref='exam', lazy=True)
    questions = db.relationship('Question', backref='exam', lazy=True)

class Question(db.Model):
    __tablename__ = 'questions'
    id = db.Column(db.Integer, primary_key=True)
    exam_id = db.Column(db.Integer, db.ForeignKey('exams.id'), nullable=False)
    question_text = db.Column(db.Text, nullable=False)
    answer = db.Column(db.Text, nullable=False)
    marks = db.Column(db.Integer, nullable=False)

class Submission(db.Model):
    __tablename__ = 'submissions'
    id = db.Column(db.Integer, primary_key=True)
    exam_id = db.Column(db.Integer, db.ForeignKey('exams.id'), nullable=False)
    student_id = db.Column(db.Integer, db.ForeignKey('Students.S_id'), nullable=False)
    submitted_at = db.Column(db.DateTime, default=datetime.utcnow)
    answers = db.Column(db.JSON, nullable=False)  # Store answers in JSON format
    marks_obtained = db.Column(db.Integer, nullable=True)
    plagarsim_perct = db.Column(db.Integer)


class Result(db.Model):
    __tablename__ = 'results'
    id = db.Column(db.Integer, primary_key=True)
    exam_id = db.Column(db.Integer, db.ForeignKey('exams.id'), nullable=False)
    student_id = db.Column(db.Integer, db.ForeignKey('Students.S_id'), nullable=False)
    marks_obtained = db.Column(db.Integer, nullable=False)
    published_at = db.Column(db.DateTime, default=datetime.utcnow)