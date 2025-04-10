from flask import Flask,render_template,request,redirect, url_for, flash
from flask_sqlalchemy import SQLAlchemy
from models import *

app = Flask(__name__)


#configure the SQLite database, relative to the app instance folder
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///Student.db"
db.init_app(app)



with app.app_context():
    db.create_all()

@app.route("/")
def home():
    return render_template("home.html")
   
@app.route("/signup",methods=["GET","POST"])
def signup():
    if request.method=="POST":
        Name=request.form["Name"]
        email=request.form["email"]
        phone=request.form["phone"]
        password=request.form["password"]
        student=Student(S_name=Name,S_email=email,S_phone=phone,S_password=password)
       
        db.session.add(student)
        db.session.commit()
        print(student)
        data="Registration Succesful"
        return render_template("studentlogin.html",data=data)
    return render_template("signup.html")
 


@app.route("/studentlogin", methods=["GET", "POST"])
def studentlogin():
    if request.method=="POST":
       email=request.form.get("email")
       password=request.form.get("password")
       print(email,password)
       student = Student.query.filter_by(S_email=email).first()
       if student and student.S_password == password:
           print("Succesful")
           return render_template("dashboard.html")
       print("eror")
       return render_template("studentlogin.html")
    return render_template("studentlogin.html")


@app.route("/dashboard")
def dashboard():
    return render_template("dashboard.html")

@app.route("/instruction")
def instruction():
    return render_template("instruction.html")

@app.route("/exampage1")
def exampage1():
    return render_template("exampage1.html")

@app.route("/exampage2")
def exampage2():
    return render_template("exampage2.html")

@app.route("/exampage3")
def exampage3():
    return render_template("exampage3.html")



if __name__=="__main__":
    app.run(debug=True)