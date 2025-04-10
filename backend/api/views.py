from .models import Result
import csv
from django.http import HttpResponse
import subprocess
import time
from django.views.decorators.csrf import csrf_exempt
import json
from rest_framework import generics
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
import shutil

from api.helpers import check_plagiarism
from .serializer import *
from rest_framework import generics
from rest_framework import permissions
from rest_framework.exceptions import NotFound
from rest_framework import status
from rest_framework.views import APIView
import json
from rest_framework.exceptions import ValidationError
import os
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import TestCase


class ExecutePythonScriptView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        body = request.data

        if "code" not in body or "input" not in body:
            return Response({"error": "Missing 'code' or 'input' field."}, status=status.HTTP_400_BAD_REQUEST)

        file_path = os.path.join(os.getcwd(), "api", f"{user.username}.py")
        with open(file_path, "w") as file:
            file.write(body["code"])

        try:
            result = subprocess.run(
                ['python', file_path],
                input=body["input"],
                capture_output=True,
                text=True,
                timeout=10,
                check=True
            )
            return Response({"message": result.stdout}, status=status.HTTP_200_OK)
        except subprocess.TimeoutExpired:
            return Response({"message": "Execution exceeded 10 seconds and was terminated."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except subprocess.CalledProcessError as e:
            return Response({"message": f"Error executing script:\n{e.stderr}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except FileNotFoundError:
            return Response({"message": f"File {file_path} not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ExamsView(generics.ListCreateAPIView):
    serializer_class = ExamSerializer
    permission_classes = [permissions.AllowAny]
    queryset = Exam.objects.all()

    def get_permissions(self):
        if self.request.method == "GET":
            self.permission_classes = [permissions.AllowAny]
        return super().get_permissions()

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated:
            if user.is_superuser:
                return self.queryset.all()
            student = Student.objects.filter(S_email=user.email).first()
            if student:
                data = self.queryset.filter(students=student)
                for exam in data:
                    if timezone.now() > exam.end_time:
                        exam.status = 'closed'
                        exam.save()
                return data
        return Exam.objects.none()

    def perform_create(self, serializer):
        students_id = json.loads(self.request.data.get("students"))
        if not students_id:
            raise ValidationError("Please select atleast 1 student.")
        if serializer.is_valid(raise_exception=True):
            students_data = []
            for i in students_id:
                students_data.append(Student.objects.filter(S_id=i).first())
            serializer.save(students=students_data)


class DeleteExamView(generics.DestroyAPIView):
    serializer_class = ExamSerializer
    permission_classes = [permissions.AllowAny]
    queryset = Exam.objects.all()
    lookup_field = "id"


def get_student_submission_plagiarism(data, student_id, question_id):
    files = os.listdir("codes")
    for file in data:
        q_id, s_id = file.replace("codes/", "").replace(".py", "").split("-")
        q_id = int(q_id)
        s_id = int(s_id)
        if s_id == student_id and q_id == question_id:
            return data[file]


def get_exam_mark(question: Question, submission: Submission, total_marks) -> str:
    temp = question.testCases.count()
    if temp == 0:
        temp =1
    return submission.no_of_test_cases_passed * (total_marks / temp)


class GenerateResultsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        exam_id = request.query_params.get("exam_id")
        exams = Exam.objects.filter(id=exam_id)
        results = Result.objects.filter(exam=exams.first())
        for result in results:
            result.delete()
        if not exams.exists():
            return Response({"message": "No exams found for processing"}, status=status.HTTP_404_NOT_FOUND)
        for exam in exams:
            for question in exam.questions.all():
                submissions = Submission.objects.filter(question=question)

                if os.path.exists("codes"):
                    shutil.rmtree("codes")
                os.mkdir("codes")

                for submission in submissions:
                    with open(os.path.join("codes", f"{submission.question.id}-{submission.student.S_id}.py"), "w") as f:
                        f.write(submission.answers)
                if (len(submissions) <= 1):
                    for submission in submissions:
                        t = get_exam_mark(
                            question, submission, question.marks)
                        Result.objects.create(
                            exam=exam,
                            question=submission.question,
                            student=submission.student,
                            submission=submission,
                            marks_obtained=t,
                            plagiarism_percentage=0
                        )
                    continue
                data = check_plagiarism()
                if submissions.exists():
                    for submission in submissions:

                        plagiarism_results = get_student_submission_plagiarism(
                            data, submission.student.S_id, submission.question.id
                        )
                        Result.objects.create(
                            exam=exam,
                            question=submission.question,
                            student=submission.student,
                            submission=submission,
                            marks_obtained=get_exam_mark(
                                question, submission, question.marks),
                            plagiarism_percentage=plagiarism_results
                        )

            exam.plagiarism_checked = True
            exam.save(update_fields=['plagiarism_checked'])
        return Response({"message": "Results generated successfully"}, status=status.HTTP_200_OK)


class UpdateExamView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ExamSerializer
    permission_classes = [permissions.AllowAny]
    queryset = Exam.objects.all()
    lookup_field = "id"


def get_question_difficulty(question: str) -> str:
    from openai import OpenAI

    client = OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key="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",
    )

    completion = client.chat.completions.create(
        extra_body={},
        model="deepseek/deepseek-r1:free",
        messages=[
            {
                "role": "user",
                "content": "You are a code complexity evaluator. I will give you a question, which is programming based. You should categorise - Hard, Medium, Easy, based on difficulty. You should return just the complexity, no explanation, no other text or sentences should be there. Just one word - Hard, Medium, Easy. Question - " + question
            }
        ]
    )
    return completion.choices[0].message.content


class QuestionsView(generics.ListCreateAPIView):
    serializer_class = QuestionSerializer
    permission_classes = [permissions.AllowAny]
    queryset = Question.objects.all()

    def get_permissions(self):
        if self.request.method == "GET":
            self.permission_classes = [permissions.AllowAny]
        return super().get_permissions()

    def get_queryset(self):
        exam_id = self.request.query_params.get(
            "exam_id")
        examObj = Exam.objects.filter(id=exam_id)
        if not examObj.exists():
            raise NotFound(detail="Not found")
        if exam_id:
            return Question.objects.filter(exam_id=exam_id)
        return Question.objects.none()

    def perform_create(self, serializer):
        question = self.request.data.get("title")
        test_cases = self.request.data.get("testCases")
        testCasesd = []
        for i in json.loads(test_cases):
            t = TestCase.objects.create(
                input=i["input"], output=i["output"], isPublic=i["isPublic"])
            testCasesd.append(t)
        if serializer.is_valid(raise_exception=True):
            serializer.save(difficulty=get_question_difficulty(
                question), testCases=testCasesd)
        else:
            raise ValidationError("Invalid data")


class SubmissionsView(generics.ListCreateAPIView):
    serializer_class = SubmissionSerializer
    permission_classes = [permissions.AllowAny]
    queryset = Submission.objects.all()

    def get_permissions(self):
        if self.request.method == "GET":
            self.permission_classes = [permissions.AllowAny]
        return super().get_permissions()

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            print("g")
            return Submission.objects.filter(question__exam=self.request.GET.get("exam_id"))
        if user:
            student = Student.objects.filter(S_email=user.email).first()
            return Submission.objects.filter(student=student)

        return Submission.objects.none()

    def create(self, request, *args, **kwargs):
        try:
            user = request.user
            if not user or not user.is_authenticated:
                return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)

            data = request.data

            try:
                student = Student.objects.get(S_email=user.email)
            except Student.DoesNotExist:
                return Response({"error": "Student not found"}, status=status.HTTP_404_NOT_FOUND)

            question_id = data.get("question")
            try:
                question = Question.objects.get(id=question_id)
            except Question.DoesNotExist:
                return Response({"error": "Question not found"}, status=status.HTTP_404_NOT_FOUND)
            student = Student.objects.filter(S_email=user.email).first()
            examObjects = Exam.objects.filter(
                id=data.get("exam_id"), students=student)
            for exam in examObjects:
                exam.students.remove(student)
                exam.save()

            submission = Submission.objects.create(
                question=question,
                student=student,
                answers=data.get("answers", {}),
                status=data.get("status", "submitted"),
                no_of_test_cases_passed=data.get("no_of_test_cases_passed")
            )
            CompletedExams.objects.create(
                student=student, exam=exam, submission=submission)
            return Response(SubmissionSerializer(submission).data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class CompletedExamsView(generics.ListAPIView):
    serializer_class = CompletedExamsSerializer
    permission_classes = [permissions.AllowAny]
    queryset = CompletedExams.objects.all()

    def get_queryset(self):
        user = self.request.user
        try:
            student = Student.objects.get(S_email=user.email)
        except Student.DoesNotExist:
            return Response({"error": "Student not found"}, status=status.HTTP_404_NOT_FOUND)
        return self.queryset.filter(student=student).all()


class StudentsView(generics.ListAPIView):
    serializer_class = StudentSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = Student.objects.all()


class StudentsDeleteView(generics.DestroyAPIView):
    serializer_class = StudentSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = Student.objects.all()
    lookup_field = "S_id"


class ExamStatusView(APIView):
    permissions = [permissions.AllowAny]

    def get(self, request):
        exam_id = self.request.query_params.get(
            "exam_id")
        exam = get_object_or_404(Exam, id=exam_id)
        if timezone.now() > exam.end_time:
            exam.status = 'closed'
            exam.save()
        return Response({"is_open": exam.status == 'open'}, status=status.HTTP_200_OK)


class ResultsView(generics.ListCreateAPIView):
    serializer_class = ResultSerializer
    queryset = Result.objects.all()
    permission_classes = [permissions.AllowAny]

    def get_permissions(self):
        if self.request.method == "GET":
            self.permission_classes = [permissions.AllowAny]
        return super().get_permissions()

    def get_queryset(self):
        student_id = self.request.query_params.get(
            "student_id")
        student = Student.objects.filter(S_id=student_id).first()
        if not student:
            raise NotFound(detail="Student not found")
        else:
            return self.queryset.filter(student=student).all()


class UpdateResultsView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ResultSerializer
    queryset = Result.objects.all()
    permission_classes = [permissions.AllowAny]
    lookup_field = "id"


class ResultsGenApi(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, exam_id):
        try:
            exam = Exam.objects.get(id=exam_id)
            results = Result.objects.filter(exam=exam)
            results_data = ResultSerializer(results, many=True).data
            return Response({
                "exam_id": exam_id,
                "exam_name": exam.name,
                "results": results_data
            }, status=status.HTTP_200_OK)

        except Exam.DoesNotExist:
            return Response({"error": "Exam not found"}, status=status.HTTP_404_NOT_FOUND)


@csrf_exempt
def check_exam_assigned(request):
    email = request.GET.get("student_email")

    student = Student.objects.filter(S_email=email).first()
    if not student:
        return JsonResponse({"message": "Student not found"}, status=404)

    exam_objects = Exam.objects.filter(students=student)
    if exam_objects.exists():
        return JsonResponse({"message": "access"}, status=200)

    return JsonResponse({"message": "deny"}, status=404)


def export_csv(request):
    response = HttpResponse(content_type="text/csv")
    response["Content-Disposition"] = 'attachment; filename="exported_data.csv"'

    writer = csv.writer(response)

    # Define headers including all fields from Result and related models
    headers = [
        "Exam ID", "Exam Name", "Exam Description", "Exam Start Time", "Exam End Time", "Exam Duration", "Exam Difficulty", "Exam Status", "Exam Total Marks", "Exam No. of Questions",
        "Question ID", "Question Title", "Question Text", "Question Difficulty", "Question Marks", "Expected Output", "Input Constraints", "Input Format",
        "Student ID", "Student Name", "Student Email", "Student Phone", "Student Created At",
        "Submission ID", "No. of Test Cases Passed", "Submitted At", "Submission Answers", "Submission Status",
        "Marks Obtained", "Plagiarism Percentage", "Result Published At"
    ]
    writer.writerow(headers)

    # Fetch all Result records and related objects
    for obj in Result.objects.select_related('exam', 'question', 'student', 'submission'):
        writer.writerow([
            obj.exam.id if obj.exam else "N/A",
            obj.exam.name if obj.exam else "N/A",
            obj.exam.description if obj.exam and obj.exam.description else "N/A",
            obj.exam.start_time.strftime(
                "%Y-%m-%d %H:%M:%S") if obj.exam else "N/A",
            obj.exam.end_time.strftime(
                "%Y-%m-%d %H:%M:%S") if obj.exam else "N/A",
            obj.exam.duration if obj.exam else "N/A",
            obj.exam.difficulty if obj.exam and obj.exam.difficulty else "N/A",
            obj.exam.status if obj.exam else "N/A",
            obj.exam.total_marks if obj.exam else "N/A",
            obj.exam.num_of_questions if obj.exam else "N/A",

            obj.question.id if obj.question else "N/A",
            obj.question.title if obj.question else "N/A",
            obj.question.question_text if obj.question else "N/A",
            obj.question.difficulty if obj.question and obj.question.difficulty else "N/A",
            obj.question.marks if obj.question else "N/A",
            obj.question.expected_output if obj.question and obj.question.expected_output else "N/A",
            obj.question.input_constrains if obj.question and obj.question.input_constrains else "N/A",
            obj.question.input_format if obj.question and obj.question.input_format else "N/A",

            obj.student.S_id if obj.student else "N/A",
            obj.student.S_name if obj.student else "N/A",
            obj.student.S_email if obj.student else "N/A",
            obj.student.S_phone if obj.student else "N/A",
            obj.student.created_at.strftime(
                "%Y-%m-%d %H:%M:%S") if obj.student else "N/A",

            obj.submission.id if obj.submission else "N/A",
            obj.submission.no_of_test_cases_passed if obj.submission else "N/A",
            obj.submission.submitted_at.strftime(
                "%Y-%m-%d %H:%M:%S") if obj.submission else "N/A",
            obj.submission.answers if obj.submission else "N/A",
            obj.submission.status if obj.submission else "N/A",

            obj.marks_obtained,
            obj.plagiarism_percentage,
            obj.published_at.strftime(
                "%Y-%m-%d %H:%M:%S") if obj.published_at else "N/A"
        ])

    return response
