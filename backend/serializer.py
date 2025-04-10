from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.models import User
from .models import *


class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = ["S_id", "S_email", "S_phone", "S_name", "created_at"]


class ExamSerializer(serializers.ModelSerializer):
    students = StudentSerializer(read_only=True, many=True)

    class Meta:
        model = Exam
        fields = ['id', 'name', 'description', 'students', 'start_time', 'end_time', 'duration', 'total_marks',
                  'num_of_questions', 'status', 'rules', 'no_of_students_attended', 'plagiarism_checked']


class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = '__all__'


class SubmissionSerializer(serializers.ModelSerializer):
    student = StudentSerializer(read_only=True)

    class Meta:
        model = Submission
        fields = '__all__'


class ResultSerializer(serializers.ModelSerializer):
    student = StudentSerializer(read_only=True)
    exam = ExamSerializer(read_only=True)
    question = QuestionSerializer(read_only=True)
    submission = SubmissionSerializer(read_only=True)

    class Meta:
        model = Result
        fields = '__all__'


class CompletedExamsSerializer(serializers.ModelSerializer):
    student = StudentSerializer(read_only=True)
    exam = ExamSerializer(read_only=True)
    submission = SubmissionSerializer(read_only=True)

    class Meta:
        model = CompletedExams
        fields = "__all__"
