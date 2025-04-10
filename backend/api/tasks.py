from celery import shared_task
from django.utils.timezone import now
from api.models import Submission, Exam, Result
import os
from api.helpers import check_plagiarism


def get_student_submission_plagiarism(data, student_id, question_id):
    files = os.listdir("codes")
    for file in data:
        q_id, s_id = file.replace("codes/", "").replace(".py", "").split("-")
        q_id = int(q_id)
        s_id = int(s_id)
        if s_id == student_id and q_id == question_id:
            return data[file]


@shared_task
def check_plagiarism_task():
    exams = Exam.objects.filter(end_time__lt=now(), plagiarism_checked=False)

    for exam in exams:
        submissions = Submission.objects.filter(question__exam=exam)
        if os.path.exists("codes"):
            os.rmdir('codes')
        os.mkdir("codes")
        for i in submissions:
            with open(os.path.join("codes", f"{i.question.id}-{i.student.S_id}.py"), "w") as f:
                f.write(i.answer)
        data = check_plagiarism()
        if submissions.exists():
            plagiarism_results = get_student_submission_plagiarism(
                data, submissions[0].student.S_id, submissions[0].question.id)
            for submission in submissions.items():
                Result.objects.create(
                    exam=exam,
                    question=submission.question,
                    student=submission.student,
                    submission=submission,
                    marks_obtained=0,
                    plagiarism_percentage=plagiarism_results,
                    plagiarism_checked=True
                )

        exam.plagiarism_checked = True
        exam.save(update_fields=['plagiarism_checked'])
