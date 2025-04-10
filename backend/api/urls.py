from django.urls import path, include
from . import views

urlpatterns = [
    path("execute", views.ExecutePythonScriptView.as_view()),
    path("exams/all", views.ExamsView.as_view()),
    path("delete/exam/<int:id>", views.DeleteExamView.as_view()),
    path("update/exam/<int:id>", views.UpdateExamView.as_view()),
    path("status/exam", views.ExamStatusView.as_view()),
    path("questions", views.QuestionsView.as_view()),
    path("submissions", views.SubmissionsView.as_view()),
    path("completed-exams", views.CompletedExamsView.as_view()),
    path("results/all", views.ResultsView.as_view()),
    path("update/results/<int:id>", views.UpdateResultsView.as_view()),
    path("students", views.StudentsView.as_view()),
    path("students/delete/<int:S_id>", views.StudentsDeleteView.as_view()),
    path("check_exam_assigned", views.check_exam_assigned),
    path('results/<int:exam_id>/',
         views.ResultsGenApi.as_view(), name='exam-results'),
    path("generate-results", views.GenerateResultsView.as_view()),
    path("export-csv/", views.export_csv, name="export_csv"),
]
